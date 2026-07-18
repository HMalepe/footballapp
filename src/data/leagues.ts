// Curated list of leagues for the in-app scope switcher, with their
// API-Football league ids. Extend as needed.

export interface League {
  id: number
  name: string
}

export const LEAGUES: League[] = [
  { id: 39, name: 'Premier League' },
  { id: 140, name: 'La Liga' },
  { id: 135, name: 'Serie A' },
  { id: 78, name: 'Bundesliga' },
  { id: 61, name: 'Ligue 1' },
  { id: 88, name: 'Eredivisie' },
  { id: 94, name: 'Primeira Liga' },
  { id: 253, name: 'Major League Soccer' },
  { id: 307, name: 'Saudi Pro League' },
  { id: 2, name: 'UEFA Champions League' },
]

// Recent seasons (API-Football keys a season by its starting year).
export const SEASONS: number[] = [2025, 2024, 2023, 2022, 2021]
