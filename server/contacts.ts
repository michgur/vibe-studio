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
    time: raw.start_time,
    duration: (raw.call_duration_seconds || 0) + (raw.merged_call_duration_seconds || 0),
    metadata: raw.metadata || {},
    recording_url: match ? `/recording/${match[1]}.wav` : undefined,
    direction: raw.call_direction || 'outgoing',
    result: (raw.result || '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    from_number: raw.from_number,
    attempt_num: raw.attempt_num || 0,
    twilio_sid: (match && match[1]) || undefined,
  }
}

function parseContact(raw: any): Contact {
  raw.metadata ??= {}
  return {
    json_str: JSON.stringify(raw, null, 4),
    status: (raw.contact_state || '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    metadata: raw.metadata,
    first_name: raw.metadata.contact_name || '',
    last_name: raw.metadata.contact_last_name || '',
    phone: raw.phone_number || '',
    id: raw.contact_id,
    timezone_offset: raw.timezone_offset || 0,
    retry_limit: raw.retry_limit || 0,
    retry_count: raw.retry_count || 0,
    queue_time: raw.queue_time,
    scheduled_time: raw.scheduled_time,
    calls: (raw.call_attempts_log || [])
      .map(parseCallMetadata)
      .sort((a: CallMetadata, b: CallMetadata) => (+new Date(b.time!)) - (+new Date(a.time!))),
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

router.get('/:agent/calls/:id', async (req, res, next) => {
  try {
    const { agent, id } = req.params
    const cached = cache.get([agent, id])
    if (cached) {
      res.json(cached)
      return
    }

    const raw = await oneaiRequest('GET', agent, `contacts/${id}`)
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
