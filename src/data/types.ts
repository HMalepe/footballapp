// Shared domain types. (No sample data lives here — every value the UI
// shows comes from the live API layer in src/services.)

export interface Stat {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
}

export interface Fixture {
  id: number
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  competition: string
}

export interface VenueRecord {
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
}

export interface Standing {
  rank: number
  team: string
  teamId: number
  played: number
  won: number
  drawn: number
  lost: number
  gd: number
  points: number
  home: VenueRecord
  away: VenueRecord
}

export type FormResult = 'W' | 'D' | 'L'

export interface FormGame {
  result: FormResult
  opponent: string
  score: string
  home: boolean
}

export interface Match {
  id: number
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  date: string
  competition: string
}

export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD'

export interface Player {
  id: number
  name: string
  number: number
  position: PlayerPosition
  appearances: number
  goals: number
  assists: number
  rating: number
}

// Which competition/team/season the live feeds target.
export interface Scope {
  league: number
  season: number
  team: number
}

// ── Deeper context (Layers 2–4 of the Context Layer framework) ──────

export interface Injury {
  player: string
  reason: string
}

// Layer 2 — motivation / match importance, derived from league position.
export interface Stakes {
  label: string
  note: string
}

// Layers 3–4 + Trap Score — produced by the LLM analysis layer. This is
// context/education only: it estimates how much hidden context a casual
// reader is likely missing. It is NOT a prediction or betting advice.
export interface ReportSource {
  title: string
  url: string
}

export interface ContextReport {
  trapScore: number // 1–10
  classification: string
  humanIntel: string[] // Layer 3
  sentiment: string[] // Layer 4
  explanation: string
  sources: ReportSource[] // web-search citations that grounded the analysis
}
