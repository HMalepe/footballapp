import { apiConfig, isLiveEnabled } from './config'

type Params = Record<string, string | number>

export class ApiFootballError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiFootballError'
  }
}

// Low-level request to an API-Football v3 endpoint.
// Returns the raw `response` array; throws ApiFootballError on any failure.
export async function apiFootball<T>(path: string, params: Params = {}): Promise<T[]> {
  if (!isLiveEnabled()) {
    throw new ApiFootballError('No API key configured')
  }

  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  )
  const url = `${apiConfig.baseUrl}/${path}?${query}`

  let res: Response
  try {
    res = await fetch(url, {
      headers: {
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

  const body = await res.json().catch(() => null)
  if (!body) {
    throw new ApiFootballError('Malformed response from API-Football')
  }

  // API-Football reports auth/quota problems in an `errors` object with a 200.
  if (body.errors && Object.keys(body.errors).length > 0) {
    throw new ApiFootballError(
      `API-Football error: ${JSON.stringify(body.errors)}`,
    )
  }

  return (body.response ?? []) as T[]
}
