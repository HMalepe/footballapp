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

export interface ApiStandingEntry {
  rank?: number
  team?: ApiTeamRef
  points?: number
  goalsDiff?: number
  all?: {
    played?: number
    win?: number
    draw?: number
    lose?: number
  }
}

export interface ApiStandingsResponse {
  league?: {
    standings?: ApiStandingEntry[][]
  }
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
