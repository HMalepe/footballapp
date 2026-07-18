import { apiConfig } from './config'
import { apiFootball, apiFootballObject, apiFootballPaged } from './apiFootball'
import type {
  ApiFixtureEntry,
  ApiPlayerEntry,
  ApiStandingEntry,
  ApiStandingsResponse,
  ApiTeamStatistics,
} from './apiFootballTypes'
import type {
  Fixture,
  Match,
  Player,
  PlayerPosition,
  Standing,
  Stat,
} from '../data/types'

const { league, team, season } = apiConfig

function formatDate(iso?: string): { date: string; time: string } {
  if (!iso) return { date: 'TBD', time: '--:--' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { date: 'TBD', time: '--:--' }
  return {
    date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  }
}

function mapPosition(raw?: string | null): PlayerPosition {
  switch ((raw ?? '').toLowerCase()) {
    case 'goalkeeper':
      return 'GK'
    case 'defender':
      return 'DEF'
    case 'midfielder':
      return 'MID'
    case 'attacker':
      return 'FWD'
    default:
      return 'MID'
  }
}

// ── Team statistics → dashboard KPI cards ───────────────────────────
export async function fetchTeamStats(): Promise<Stat[]> {
  const s = await apiFootballObject<ApiTeamStatistics>('teams/statistics', {
    league,
    team,
    season,
  })
  if (!s) return []

  const played = s.fixtures?.played?.total ?? 0
  const wins = s.fixtures?.wins?.total ?? 0
  const draws = s.fixtures?.draws?.total ?? 0
  const loses = s.fixtures?.loses?.total ?? 0
  const goalsFor = s.goals?.for?.total?.total ?? 0
  const cleanSheets = s.clean_sheet?.total ?? 0
  const winPct = played > 0 ? Math.round((wins / played) * 100) : 0
  const perGame = played > 0 ? (goalsFor / played).toFixed(1) : '0.0'

  return [
    { label: 'Matches Played', value: String(played), change: 'This season', trend: 'neutral' },
    { label: 'Goals Scored', value: String(goalsFor), change: `Ø ${perGame} per game`, trend: 'up' },
    {
      label: 'Win Rate',
      value: `${winPct}%`,
      change: `${wins}W ${draws}D ${loses}L`,
      trend: winPct >= 50 ? 'up' : 'down',
    },
    { label: 'Clean Sheets', value: String(cleanSheets), change: 'Season total', trend: 'neutral' },
  ]
}

// ── Standings ───────────────────────────────────────────────────────
export async function fetchStandings(): Promise<Standing[]> {
  const res = await apiFootball<ApiStandingsResponse>('standings', {
    league,
    season,
  })
  const table: ApiStandingEntry[] = res[0]?.league?.standings?.[0] ?? []
  return table.map((s) => ({
    rank: s.rank ?? 0,
    team: s.team?.name ?? 'Unknown',
    played: s.all?.played ?? 0,
    won: s.all?.win ?? 0,
    drawn: s.all?.draw ?? 0,
    lost: s.all?.lose ?? 0,
    gd: s.goalsDiff ?? 0,
    points: s.points ?? 0,
  }))
}

// ── Upcoming fixtures ───────────────────────────────────────────────
export async function fetchUpcomingFixtures(count = 8): Promise<Fixture[]> {
  const res = await apiFootball<ApiFixtureEntry>('fixtures', {
    league,
    season,
    next: count,
  })
  return res.map((f) => {
    const { date, time } = formatDate(f.fixture?.date)
    return {
      id: f.fixture?.id ?? 0,
      homeTeam: f.teams?.home?.name ?? 'TBD',
      awayTeam: f.teams?.away?.name ?? 'TBD',
      date,
      time,
      competition: f.league?.name ?? 'Unknown',
    }
  })
}

// ── Recent results ──────────────────────────────────────────────────
export async function fetchRecentResults(count = 6): Promise<Match[]> {
  const res = await apiFootball<ApiFixtureEntry>('fixtures', {
    league,
    season,
    last: count,
  })
  return res.map((f) => {
    const { date } = formatDate(f.fixture?.date)
    return {
      id: f.fixture?.id ?? 0,
      homeTeam: f.teams?.home?.name ?? 'TBD',
      awayTeam: f.teams?.away?.name ?? 'TBD',
      homeScore: f.goals?.home ?? 0,
      awayScore: f.goals?.away ?? 0,
      date,
      competition: f.league?.name ?? 'Unknown',
    }
  })
}

// ── Squad / player stats ────────────────────────────────────────────
export async function fetchPlayers(): Promise<Player[]> {
  const res = await apiFootballPaged<ApiPlayerEntry>('players', { team, season })
  return res.map((entry, i) => {
    const stat = entry.statistics?.[0]
    const rating = Number.parseFloat(stat?.games?.rating ?? '')
    return {
      id: entry.player?.id ?? i,
      name: entry.player?.name ?? 'Unknown',
      number: stat?.games?.number ?? 0,
      position: mapPosition(stat?.games?.position),
      appearances: stat?.games?.appearences ?? 0,
      goals: stat?.goals?.total ?? 0,
      assists: stat?.goals?.assists ?? 0,
      rating: Number.isFinite(rating) ? Number(rating.toFixed(1)) : 0,
    }
  })
}
