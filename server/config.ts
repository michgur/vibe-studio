import { TTLCache } from '@brokerloop/ttlcache'
import { oneaiRequest } from './core'

const TTL = 120
const cache = new TTLCache<string, any>({ ttl: TTL * 1000, max: 10000 })

export async function fetchConfig(agent: string) {
  if (cache.get(agent)) return cache.get(agent)

  const [config, outbound_call] = await Promise.all([
    oneaiRequest("GET", agent, "internal"),
    oneaiRequest("GET", agent, "outbound_call/settings"),
  ])
  config.outbound_call = outbound_call
  return config
}

