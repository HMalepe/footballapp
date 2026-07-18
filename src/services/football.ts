import { apiConfig } from './config'
import { apiFootball, apiFootballPaged } from './apiFootball'
import type {
  ApiFixtureEntry,
  ApiPlayerEntry,
  ApiStandingEntry,
  ApiStandingsResponse,
} from './apiFootballTypes'
import type {
  Fixture,
  Match,
  Player,
  PlayerPosition,
  Standing,
} from '../data/mockData'

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
