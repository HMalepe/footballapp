// Small response cache for the API layer. Serves three purposes:
//  1. Avoid burning the API-Football free-tier quota (~100 req/day) — repeat
//     loads within the TTL are served from memory / localStorage, no network.
//  2. Dedupe concurrent identical requests into a single in-flight promise.
//  3. Survive reloads via localStorage so a refresh costs zero requests.

interface Entry<T> {
  value: T
  expires: number
}

const PREFIX = 'af-cache:'
const memory = new Map<string, Entry<unknown>>()
const inflight = new Map<string, Promise<unknown>>()

export async function cached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now()

  const mem = memory.get(key) as Entry<T> | undefined
  if (mem && mem.expires > now) return mem.value

  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw) {
      const entry = JSON.parse(raw) as Entry<T>
      if (entry.expires > now) {
        memory.set(key, entry)
        return entry.value
      }
      localStorage.removeItem(PREFIX + key)
    }
  } catch {
    // Ignore malformed/unavailable storage.
  }

  const existing = inflight.get(key) as Promise<T> | undefined
  if (existing) return existing

  const promise = loader()
    .then((value) => {
      const entry: Entry<T> = { value, expires: Date.now() + ttlMs }
      memory.set(key, entry)
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(entry))
      } catch {
        // Ignore quota/serialization failures — memory cache still applies.
      }
      inflight.delete(key)
      return value
    })
    .catch((e) => {
      inflight.delete(key)
      throw e
    })

  inflight.set(key, promise)
  return promise
}

// Clear every cached API response (memory + persisted). Useful for a manual
// "refresh" that forces the next request to hit the network.
export function clearApiCache(): void {
  memory.clear()
  inflight.clear()
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) localStorage.removeItem(k)
    }
  } catch {
    // Ignore storage errors.
  }
}
