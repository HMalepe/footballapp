// Partial type definitions for the API-Football v3 responses.
// Only the fields this app reads are modelled; everything is optional
// so mappers can defend against missing data.

export interface ApiTeamRef {
  id?: number
  name?: string
}

export interface ApiGoals {
  home?: number | null
  away?: number | null
}

export interface ApiFixtureEntry {
  fixture?: {
    id?: number
    date?: string
  }
  league?: {
    id?: number
    name?: string
  }
  teams?: {
    home?: ApiTeamRef
    away?: ApiTeamRef
  }
  goals?: ApiGoals
}

interface ApiRecord {
  played?: number
  win?: number
  draw?: number
  lose?: number
  goals?: { for?: number; against?: number }
}

export interface ApiStandingEntry {
  rank?: number
  team?: ApiTeamRef
  points?: number
  goalsDiff?: number
  all?: ApiRecord
  home?: ApiRecord
  away?: ApiRecord
}

export interface ApiStandingsResponse {
  league?: {
    standings?: ApiStandingEntry[][]
  }
}

export interface ApiTeamStatistics {
  fixtures?: {
    played?: { total?: number }
    wins?: { total?: number }
    draws?: { total?: number }
    loses?: { total?: number }
  }
  goals?: {
    for?: { total?: { total?: number } }
    against?: { total?: { total?: number } }
  }
  clean_sheet?: { total?: number }
}

export interface ApiInjuryEntry {
  player?: {
    name?: string
    reason?: string
  }
}

export interface ApiOddsEntry {
  bookmakers?: {
    bets?: {
      id?: number
      name?: string
      values?: { value?: string; odd?: string }[]
    }[]
  }[]
}

export interface ApiPlayerEntry {
  player?: {
    id?: number
    name?: string
  }
  statistics?: {
    games?: {
      appearences?: number | null
      position?: string | null
      rating?: string | null
      number?: number | null
    }
    goals?: {
      total?: number | null
      assists?: number | null
    }
  }[]
}
