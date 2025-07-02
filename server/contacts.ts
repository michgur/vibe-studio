import { Router, type NextFunction, type Request, type Response } from 'express'
import { TTLCache } from '@brokerloop/ttlcache'
import { parseISO } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'
import { oneaiRequest } from './core'
import type { Contact, CallMetadata, CallMessage, DateString } from '../shared/types'
import { fetchConfig } from './config'

const PAGE_SIZE = 25
const TTL = 30
const cache = new TTLCache<[string, string], Contact>({ ttl: TTL * 1000, max: 10000 })
const router = Router()

function parseDateTime(raw: string, timezone: string): string {
  return fromZonedTime(raw, "UTC").toISOString()
}

function parseCallMetadata(raw: any, timezone: string): CallMetadata {
  const match = raw.recording_url?.match(/\/Recordings\/([^/.]+)/)
  return {
    id: raw.chat_id,
    dialedAt: parseDateTime(raw.start_time, timezone),
    duration: (raw.call_duration_seconds || 0) + (raw.merged_call_duration_seconds || 0),
    metadata: raw.result_metadata || {},
    direction: raw.call_direction || 'outgoing',
    result: (raw.result || '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    fromPhone: raw.from_number,
    attempt: raw.attempt_num || 0,
    recordingId: (match && match[1]) || undefined,
  }
}

function parseContact(raw: any, fallbackTimezone: string): Contact {
  raw.metadata ??= {}
  const timezone: string = raw.timezone_name
    || raw.metadata?.timezone_name
    || (raw.call_attempts_log || []).find((call: any) => call?.timezone_name || call?.result_metadata?.timezone_name)
    || fallbackTimezone
  const calls: CallMetadata[] = (raw.call_attempts_log || [])
    .map((call: any) => parseCallMetadata(call, fallbackTimezone))
    .sort((a: CallMetadata, b: CallMetadata) => (+new Date(b.dialedAt!)) - (+new Date(a.dialedAt!)))

  return {
    status: (raw.contact_state || '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    metadata: raw.metadata,
    firstName: raw.metadata.contact_name || '',
    lastName: raw.metadata.contact_last_name || '',
    phone: raw.phone_number || '',
    id: raw.contact_id,
    timezone,
    retryLimit: raw.retry_limit || 0,
    retryCount: raw.retry_count || 0,
    queuedAt: parseDateTime(raw.queue_time, timezone),
    scheduledAt: raw.scheduled_time && parseDateTime(raw.scheduled_time, timezone),
    calls,
  }
}

router.get('/:agent/contacts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { agent } = req.params
    const { from, to, query } = req.query as { from?: DateString, to?: DateString, query?: string }
    const page = parseInt(req.query.page as string || '1', 10)
    const status = typeof req.query.status === 'string' ? [req.query.status] : (req.query.status as string[] || [])
    const body: any = {
      limit: PAGE_SIZE,
      sort: { last_call_time: 'DESC' },
      page,
      ...(from && { from_date: from }),
      ...(to && { to_date: to }),
      ...(status.length && { contact_state: status.join(',') }),
      ...(query && { contact_name: query }),
    }

    const [resp, config] = await Promise.all([
      oneaiRequest('POST', agent, 'contacts/list', { body }),
      fetchConfig(agent),
    ])
    const contacts: Contact[] = (resp.contacts || []).map((contact: any) => parseContact(contact, config.outbound_call?.timezone))
    for (const c of contacts) cache.set([agent, c.id], c)

    res.json({ contacts, totalContacts: resp.total_count, totalPages: Math.ceil(resp.total_count / PAGE_SIZE) })
  } catch (err) {
    next(err)
  }
})

router.get('/:agent/contacts/:id', async (req, res, next) => {
  try {
    const { agent, id } = req.params

    let contact = cache.get([agent, id])
    if (!contact) {
      const resp = await oneaiRequest('GET', agent, `contacts/${id}`)
      contact = parseContact(resp)
      cache.set([agent, id], contact)
    }

    res.json(contact)
  } catch (err) {
    next(err)
  }
})

router.get('/:agent/calls/:id/contact', async (req, res, next) => {
  try {
    const { agent, id } = req.params
    const raw = await oneaiRequest('GET', agent, `contacts/by_chat_id/${id}`)
    const contact = parseContact(raw)
    cache.set([agent, contact.id], contact)
    res.json(contact)
  } catch (err) {
    next(err)
  }
})

function timedeltaSeconds(ts: string, start?: number): number | undefined {
  try {
    let dt = parseISO(ts).getTime() / 1000
    if (start !== undefined) dt -= start
    return dt
  } catch {
    return undefined;
  }
}

router.get('/:agent/calls/:id/transcript', async (req, res, next) => {
  try {
    const { agent, id } = req.params
    const { debug } = req.query

    const raw = await oneaiRequest('GET', agent, `chats/${id}/history`)
    let messages = raw.chat_items || []
    if (messages.length === 0 || (!messages[0].content && messages.length === 1)) {
      res.json([])
      return
    }

    if (!messages[0].content) messages = messages.slice(1)
    if (!messages[0].timestamp && messages[1]?.timestamp) messages[0].timestamp = messages[1].timestamp

    const start = timedeltaSeconds(messages[0].timestamp)
    const transcript: CallMessage[] = messages.map((msg: any) => ({
      content: msg.content || '',
      speaker: msg.speaker || 'assistant',
      timestamp: timedeltaSeconds(msg.timestamp, start),
      ...(debug !== undefined && msg.debug_info && { debugJSON: JSON.stringify(msg.debug_info, null, 2) }),
    }))

    res.json(transcript)
  } catch (err) {
    next(err)
  }
})

export default router
