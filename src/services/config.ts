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
} as const

// True when a key is configured and live requests should be attempted.
export function isLiveEnabled(): boolean {
  return apiConfig.key.length > 0
}
