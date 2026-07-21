// Central configuration for the live-data layer.
//
// All values come from Vite env vars (see .env.example). Without an API key
// every feed shows an explicit "connect a key" state — no data is ever
// fabricated.

const env = import.meta.env

function intOr(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? '', 10)
  return Number.isFinite(n) ? n : fallback
}

// API-Football can be reached two ways with the same data/endpoints:
//   - "rapidapi" (default) — a key from rapidapi.com/api-sports/api/api-football
//   - "direct" — a key from your dashboard at api-football.com, sent as
//     x-apisports-key with no RapidAPI host header.
const isDirect = (env.VITE_API_FOOTBALL_PROVIDER ?? '').trim().toLowerCase() === 'direct'

export const apiConfig = {
  key: (env.VITE_API_FOOTBALL_KEY ?? '').trim(),
  direct: isDirect,
  host: 'api-football-v1.p.rapidapi.com',
  baseUrl: isDirect
    ? 'https://v3.football.api-sports.io'
    : 'https://api-football-v1.p.rapidapi.com/v3',
  league: intOr(env.VITE_API_FOOTBALL_LEAGUE, 39), // Premier League
  team: intOr(env.VITE_API_FOOTBALL_TEAM, 42), // Arsenal
  season: intOr(env.VITE_API_FOOTBALL_SEASON, 2025),
  // How long cached responses stay fresh (default 15 min) — protects the
  // free-tier request quota across reloads and navigation.
  cacheTtlMs: intOr(env.VITE_API_FOOTBALL_CACHE_MINUTES, 15) * 60_000,
} as const

// Anthropic (Claude) config — powers the qualitative Context Report layers.
export const aiConfig = {
  key: (env.VITE_ANTHROPIC_KEY ?? '').trim(),
  model: (env.VITE_ANTHROPIC_MODEL ?? 'claude-opus-4-8').trim(),
  baseUrl: 'https://api.anthropic.com/v1/messages',
} as const

// True when a key is configured and live requests should be attempted.
export function isLiveEnabled(): boolean {
  return apiConfig.key.length > 0
}

// True when a Claude API key is configured (for the AI Context Report).
export function isAiEnabled(): boolean {
  return aiConfig.key.length > 0
}
