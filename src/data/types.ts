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

export interface Standing {
  rank: number
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  gd: number
  points: number
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
