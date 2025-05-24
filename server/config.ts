import { TTLCache } from '@brokerloop/ttlcache'
import { oneaiRequest } from './core'

const TTL = 30
const cache = new TTLCache<string, any>({ ttl: TTL * 1000, max: 10000 })

export async function fetchConfig(agent: string) {
  if (cache.get(agent)) return cache.get(agent)

  const config = await oneaiRequest("GET", agent, "internal")
  cache.set(agent, config)
  return config
}

