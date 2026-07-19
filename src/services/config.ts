// Central configuration for the live-data layer.
//
// All values come from Vite env vars (see .env.example). When no API key
// is present the app stays on bundled sample data — every service falls
// back gracefully, so the UI works identically with or without a key.

const env = import.meta.env

function intOr(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? '', 10)
  return Number.isFinite(n) ? n : fallback
}

export const apiConfig = {
  key: (env.VITE_API_FOOTBALL_KEY ?? '').trim(),
  host: 'api-football-v1.p.rapidapi.com',
  baseUrl: 'https://api-football-v1.p.rapidapi.com/v3',
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
