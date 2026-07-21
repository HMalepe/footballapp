import { apiConfig, isLiveEnabled } from './config'
import { cached } from './cache'
import { throttle } from './rateLimiter'

type Params = Record<string, string | number>

interface ApiBody<T> {
  response?: T[]
  errors?: Record<string, string> | unknown[]
  paging?: { current?: number; total?: number }
}

export class ApiFootballError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiFootballError'
  }
}

// Single request to an API-Football v3 endpoint. Returns the parsed body
// (including paging); throws ApiFootballError on any failure.
async function request<T>(path: string, params: Params): Promise<ApiBody<T>> {
  if (!isLiveEnabled()) {
    throw new ApiFootballError('No API key configured')
  }

  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  )
  const url = `${apiConfig.baseUrl}/${path}?${query}`

  // Cache keyed by URL — repeat/duplicate requests are served without a call.
  return cached<ApiBody<T>>(url, apiConfig.cacheTtlMs, async () => {
    await throttle()
    let res: Response
    try {
      res = await fetch(url, {
        headers: apiConfig.direct
          ? { 'x-apisports-key': apiConfig.key }
          : {
              'x-rapidapi-key': apiConfig.key,
              'x-rapidapi-host': apiConfig.host,
            },
      })
    } catch (e) {
      throw new ApiFootballError(
        `Network error contacting API-Football: ${(e as Error).message}`,
      )
    }

    if (!res.ok) {
      throw new ApiFootballError(`API-Football responded ${res.status}`)
    }

    const body = (await res.json().catch(() => null)) as ApiBody<T> | null
    if (!body) {
      throw new ApiFootballError('Malformed response from API-Football')
    }

    // API-Football reports auth/quota problems in an `errors` object with a 200.
    const errs = body.errors
    const hasErrors = Array.isArray(errs) ? errs.length > 0 : Object.keys(errs ?? {}).length > 0
    if (hasErrors) {
      throw new ApiFootballError(`API-Football error: ${JSON.stringify(errs)}`)
    }

    return body
  })
}

// Fetch a single page's `response` array.
export async function apiFootball<T>(path: string, params: Params = {}): Promise<T[]> {
  const body = await request<T>(path, params)
  return body.response ?? []
}

// Fetch an endpoint whose `response` is a single object (e.g. teams/statistics).
export async function apiFootballObject<T>(
  path: string,
  params: Params = {},
): Promise<T | null> {
  const body = (await request<unknown>(path, params)) as { response?: T }
  return body.response ?? null
}

// Fetch and concatenate every page (capped by `maxPages` to respect rate
// limits). Used for endpoints like `players` that paginate ~20 at a time.
export async function apiFootballPaged<T>(
  path: string,
  params: Params = {},
  maxPages = 5,
): Promise<T[]> {
  const first = await request<T>(path, { ...params, page: 1 })
  const all: T[] = [...(first.response ?? [])]
  const total = Math.min(first.paging?.total ?? 1, maxPages)

  for (let page = 2; page <= total; page++) {
    const body = await request<T>(path, { ...params, page })
    all.push(...(body.response ?? []))
  }
  return all
}
