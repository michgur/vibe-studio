import { Router } from 'express'
import { oneaiRequest } from './core'
import { TTLCache } from '@brokerloop/ttlcache'
import type { DateRange } from '../shared/types'


interface FunnelOptions {
  rows: string[]
  columns: string[]
  dateRange: DateRange
}

function funnelCacheKey(opts: FunnelOptions) {
  return {
    rows: opts.rows, dateRange: opts.dateRange
  }
}
type FunnelCacheKey = ReturnType<typeof funnelCacheKey>

const router = Router()
const TTL = 30
const cache = new TTLCache<FunnelCacheKey, any[]>({ ttl: TTL * 1000, max: 10000 })

const fieldFormatters: Record<string, (value: string) => string> = {
  day: (value) => value.replace(/T.+$/, ''),
}

router.post('/:agent/report', async (req, res, next) => {
  try {
    const { agent } = req.params
    const opts = req.body as FunnelOptions

    const key = funnelCacheKey(opts)
    const resp = cache.get(key) ||
      await oneaiRequest("POST", agent, "contacts/funnel", {
        body: {
          bins: opts.rows,
          from_date: opts.dateRange[0],
          to_date: opts.dateRange[1],
        }
      })
    cache.set(key, resp)

    const headers = opts.rows.concat(opts.columns)
    const rows = resp.map((r: any) => headers.map(h => h in fieldFormatters ? fieldFormatters[h](r[h]) : r[h]))
    res.json({ headers, rows })
  } catch (err) {
    next(err)
  }
})

export default router
