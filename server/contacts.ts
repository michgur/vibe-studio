import { Router, type NextFunction, type Request, type Response } from 'express'
import { TTLCache } from '@brokerloop/ttlcache'
import { parseISO } from 'date-fns'
import { oneaiRequest } from './core'
import type { Contact, CallMetadata, CallMessage } from '../shared/types'

const PAGE_SIZE = 25
const TTL = 30
const cache = new TTLCache<[string, string], Contact>({ ttl: TTL * 1000, max: 10000 })
const router = Router()

function parseCallMetadata(raw: any): CallMetadata {
  const match = raw.recording_url?.match(/\/Recordings\/([^/.]+)/)
  return {
    id: raw.chat_id,
    dialedAt: raw.start_time,
    duration: (raw.call_duration_seconds || 0) + (raw.merged_call_duration_seconds || 0),
    metadata: raw.result_metadata || {},
    direction: raw.call_direction || 'outgoing',
    result: (raw.result || '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    fromPhone: raw.from_number,
    attempt: raw.attempt_num || 0,
    recordingId: (match && match[1]) || undefined,
    timezone: raw.timezone_name || raw.result_metadata?.timezone_name,
  }
}

function parseContact(raw: any): Contact {
  raw.metadata ??= {}
  const calls: CallMetadata[] = (raw.call_attempts_log || [])
    .map(parseCallMetadata)
    .sort((a: CallMetadata, b: CallMetadata) => (+new Date(b.dialedAt!)) - (+new Date(a.dialedAt!)))

  return {
    rawJsonStr: JSON.stringify(raw, null, 4),
    status: (raw.contact_state || '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    metadata: raw.metadata,
    firstName: raw.metadata.contact_name || '',
    lastName: raw.metadata.contact_last_name || '',
    phone: raw.phone_number || '',
    id: raw.contact_id,
    timezone: raw.timezone_name || raw.metadata?.timezone_name || calls.find(c => c.timezone)?.timezone,
    retryLimit: raw.retry_limit || 0,
    retryCount: raw.retry_count || 0,
    queuedAt: raw.queue_time,
    scheduledAt: raw.scheduled_time,
    calls,
  }
}

router.get('/:agent/contacts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { agent } = req.params
    const page = parseInt(req.query.page as string || '1', 10)
    const status = typeof req.query.status === 'string' ? [req.query.status] : (req.query.status as string[] || [])
    const body: any = { limit: PAGE_SIZE, page }
    if (status.length) body.contact_state = status.join(',')

    const resp = await oneaiRequest('POST', agent, 'contacts/list', { body })
    const contacts = (resp.contacts || []).map(parseContact)
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
    }))

    res.json(transcript)
  } catch (err) {
    next(err)
  }
})

export default router
