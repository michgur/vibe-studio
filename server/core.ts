const baseUrl = 'https://api.oneai.com'
const apiKey = '95b374e9-4c7a-4be4-b3e8-ca3925b79c54'

export async function oneaiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  agent: string,
  path: string,
  options: {
    headers?: Record<string, any>
    body?: any
    params?: Record<string, any>
  } = {}
): Promise<any> {
  const headers: Record<string, string> = {}
  const inputHeaders = options.headers || {}

  for (const [k, v] of Object.entries(inputHeaders)) {
    headers[k.toLowerCase()] = v
  }

  if (options.body && !headers['content-type']) {
    headers['content-type'] = 'application/json'
  }

  if (!headers['api-key']) {
    headers['api-key'] = apiKey
  }

  const url = new URL(`/agent/v1/agents/${agent}/${path}`, baseUrl)
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      url.searchParams.append(key, String(value))
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  return await res.json()
}
