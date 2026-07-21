import { apiFootball, apiFootballObject, apiFootballPaged } from './apiFootball'
import type {
  ApiFixtureEntry,
  ApiOddsEntry,
  ApiPlayerEntry,
  ApiStandingEntry,
  ApiStandingsResponse,
  ApiTeamStatistics,
} from './apiFootballTypes'
import type {
  Fixture,
  FormGame,
  FormResult,
  Match,
  Odds,
  Player,
  PlayerPosition,
  Scope,
  Standing,
  Stat,
  VenueRecord,
} from '../data/types'

function formatDate(iso?: string): { date: string; time: string } {
  if (!iso) return { date: 'TBD', time: '--:--' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { date: 'TBD', time: '--:--' }
  return {
    date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  }
}

// API-Football's `last` query param is a paid-plan-only convenience for
// "give me the last N fixtures". The free plan rejects it outright, so
// instead we fetch the unfiltered set and take the most recent finished
// matches ourselves.
const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN'])

function mostRecentFinished<T extends ApiFixtureEntry>(entries: T[], count: number): T[] {
  return entries
    .filter((e) => FINISHED_STATUSES.has(e.fixture?.status?.short ?? ''))
    .sort((a, b) => (b.fixture?.date ?? '').localeCompare(a.fixture?.date ?? ''))
    .slice(0, count)
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
export async function fetchTeamStats({ league, team, season }: Scope): Promise<Stat[]> {
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
function venue(r: ApiStandingEntry['home']): VenueRecord {
  return {
    won: r?.win ?? 0,
    drawn: r?.draw ?? 0,
    lost: r?.lose ?? 0,
    goalsFor: r?.goals?.for ?? 0,
    goalsAgainst: r?.goals?.against ?? 0,
  }
}

export async function fetchStandings({ league, season }: Scope): Promise<Standing[]> {
  const res = await apiFootball<ApiStandingsResponse>('standings', {
    league,
    season,
  })
  const table: ApiStandingEntry[] = res[0]?.league?.standings?.[0] ?? []
  return table.map((s) => ({
    rank: s.rank ?? 0,
    team: s.team?.name ?? 'Unknown',
    teamId: s.team?.id ?? 0,
    played: s.all?.played ?? 0,
    won: s.all?.win ?? 0,
    drawn: s.all?.draw ?? 0,
    lost: s.all?.lose ?? 0,
    gd: s.goalsDiff ?? 0,
    points: s.points ?? 0,
    home: venue(s.home),
    away: venue(s.away),
  }))
}

// ── Head-to-head history ────────────────────────────────────────────
export async function fetchHeadToHead(
  homeId: number,
  awayId: number,
  count = 6,
): Promise<Match[]> {
  const res = await apiFootball<ApiFixtureEntry>('fixtures/headtohead', {
    h2h: `${homeId}-${awayId}`,
  })
  return mostRecentFinished(res, count).map((f) => {
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

// ── Recent form (last N results for a team) ─────────────────────────
export async function fetchForm(
  teamId: number,
  season: number,
  count = 5,
): Promise<FormGame[]> {
  const res = await apiFootball<ApiFixtureEntry>('fixtures', {
    team: teamId,
    season,
  })
  return mostRecentFinished(res, count).map((f) => {
    const isHome = f.teams?.home?.id === teamId
    const hg = f.goals?.home ?? 0
    const ag = f.goals?.away ?? 0
    const gf = isHome ? hg : ag
    const ga = isHome ? ag : hg
    const result: FormResult = gf > ga ? 'W' : gf < ga ? 'L' : 'D'
    const opponent = (isHome ? f.teams?.away?.name : f.teams?.home?.name) ?? 'TBD'
    return { result, opponent, score: `${gf}-${ga}`, home: isHome }
  })
}

// ── Upcoming fixtures ───────────────────────────────────────────────
export async function fetchUpcomingFixtures(
  { league, season }: Scope,
  count = 8,
): Promise<Fixture[]> {
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
export async function fetchRecentResults(
  { league, season }: Scope,
  count = 6,
): Promise<Match[]> {
  const res = await apiFootball<ApiFixtureEntry>('fixtures', {
    league,
    season,
  })
  return mostRecentFinished(res, count).map((f) => {
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

// ── Odds (Layer 4) ──────────────────────────────────────────────────
// The id of the next scheduled meeting between the two teams (for odds).
export async function fetchNextMeetingId(
  homeId: number,
  awayId: number,
): Promise<number | null> {
  const res = await apiFootball<ApiFixtureEntry>('fixtures/headtohead', {
    h2h: `${homeId}-${awayId}`,
    next: 1,
  })
  return res[0]?.fixture?.id ?? null
}

// Market 1X2 (Match Winner, bet id 1) decimal odds from the first bookmaker.
export async function fetchOdds(fixtureId: number): Promise<Odds | null> {
  const res = await apiFootball<ApiOddsEntry>('odds', { fixture: fixtureId, bet: 1 })
  const values = res[0]?.bookmakers?.[0]?.bets?.[0]?.values
  if (!values) return null
  const odd = (name: string): number => {
    const v = values.find((x) => x.value === name)
    return v?.odd ? Number(v.odd) : NaN
  }
  const home = odd('Home')
  const draw = odd('Draw')
  const away = odd('Away')
  if (![home, draw, away].every((n) => Number.isFinite(n) && n > 0)) return null
  return { home, draw, away }
}

// ── Squad / player stats ────────────────────────────────────────────
export async function fetchPlayers({ team, season }: Scope): Promise<Player[]> {
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
