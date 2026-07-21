import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Scope } from '../data/types'

vi.mock('./apiFootball', () => ({
  apiFootball: vi.fn(),
  apiFootballObject: vi.fn(),
  apiFootballPaged: vi.fn(),
}))

import { apiFootball, apiFootballObject, apiFootballPaged } from './apiFootball'
import {
  fetchStandings,
  fetchPlayers,
  fetchTeamStats,
  fetchRecentResults,
  fetchForm,
  fetchHeadToHead,
  fetchInjuries,
  fetchOdds,
} from './football'

const scope: Scope = { league: 39, season: 2025, team: 42 }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('fetchStandings', () => {
  it('maps an API standings table into app Standings', async () => {
    vi.mocked(apiFootball).mockResolvedValue([
      {
        league: {
          standings: [
            [
              {
                rank: 1,
                team: { id: 42, name: 'Arsenal' },
                points: 88,
                goalsDiff: 60,
                all: { played: 38, win: 28, draw: 4, lose: 6 },
                home: { win: 16, draw: 2, lose: 1, goals: { for: 45, against: 12 } },
                away: { win: 12, draw: 2, lose: 5, goals: { for: 30, against: 15 } },
              },
            ],
          ],
        },
      },
    ] as never)

    const out = await fetchStandings(scope)
    expect(out).toEqual([
      {
        rank: 1,
        team: 'Arsenal',
        teamId: 42,
        played: 38,
        won: 28,
        drawn: 4,
        lost: 6,
        gd: 60,
        points: 88,
        home: { won: 16, drawn: 2, lost: 1, goalsFor: 45, goalsAgainst: 12 },
        away: { won: 12, drawn: 2, lost: 5, goalsFor: 30, goalsAgainst: 15 },
      },
    ])
  })
})

describe('fetchPlayers', () => {
  it('maps positions and parses ratings', async () => {
    vi.mocked(apiFootballPaged).mockResolvedValue([
      {
        player: { id: 7, name: 'Saka' },
        statistics: [
          {
            games: { appearences: 34, position: 'Attacker', rating: '8.14', number: 7 },
            goals: { total: 16, assists: 13 },
          },
        ],
      },
    ] as never)

    const [p] = await fetchPlayers(scope)
    expect(p.name).toBe('Saka')
    expect(p.position).toBe('FWD')
    expect(p.number).toBe(7)
    expect(p.rating).toBe(8.1)
    expect(p.goals).toBe(16)
  })

  it('defaults unknown positions to MID and missing ratings to 0', async () => {
    vi.mocked(apiFootballPaged).mockResolvedValue([
      { player: { id: 1, name: 'Mystery' }, statistics: [{ games: { position: 'Coach' } }] },
    ] as never)

    const [p] = await fetchPlayers(scope)
    expect(p.position).toBe('MID')
    expect(p.rating).toBe(0)
  })
})

describe('fetchTeamStats', () => {
  it('derives KPI cards including win rate', async () => {
    vi.mocked(apiFootballObject).mockResolvedValue({
      fixtures: { played: { total: 10 }, wins: { total: 6 }, draws: { total: 2 }, loses: { total: 2 } },
      goals: { for: { total: { total: 20 } } },
      clean_sheet: { total: 4 },
    } as never)

    const stats = await fetchTeamStats(scope)
    const byLabel = Object.fromEntries(stats.map((s) => [s.label, s.value]))
    expect(byLabel['Matches Played']).toBe('10')
    expect(byLabel['Goals Scored']).toBe('20')
    expect(byLabel['Win Rate']).toBe('60%')
    expect(byLabel['Clean Sheets']).toBe('4')
  })

  it('returns an empty list when there is no data', async () => {
    vi.mocked(apiFootballObject).mockResolvedValue(null as never)
    expect(await fetchTeamStats(scope)).toEqual([])
  })
})

describe('fetchForm', () => {
  it('derives W/D/L relative to the team, home or away', async () => {
    vi.mocked(apiFootball).mockResolvedValue([
      // team 42 at home, won 2-1
      {
        teams: { home: { id: 42, name: 'Arsenal' }, away: { id: 5, name: 'Spurs' } },
        goals: { home: 2, away: 1 },
      },
      // team 42 away, lost 0-3 (they are the away side)
      {
        teams: { home: { id: 9, name: 'City' }, away: { id: 42, name: 'Arsenal' } },
        goals: { home: 3, away: 0 },
      },
      // draw
      {
        teams: { home: { id: 42, name: 'Arsenal' }, away: { id: 7, name: 'Chelsea' } },
        goals: { home: 1, away: 1 },
      },
    ] as never)

    const form = await fetchForm(42, 2025)
    expect(form.map((f) => f.result)).toEqual(['W', 'L', 'D'])
    expect(form[0]).toMatchObject({ opponent: 'Spurs', home: true, score: '2-1' })
    expect(form[1]).toMatchObject({ opponent: 'City', home: false, score: '0-3' })
  })
})

describe('fetchHeadToHead', () => {
  it('maps h2h fixtures into matches', async () => {
    vi.mocked(apiFootball).mockResolvedValue([
      {
        fixture: { id: 5, date: '2025-03-01T00:00:00+00:00' },
        league: { name: 'Premier League' },
        teams: { home: { name: 'Arsenal' }, away: { name: 'Chelsea' } },
        goals: { home: 3, away: 0 },
      },
    ] as never)

    const [m] = await fetchHeadToHead(42, 7)
    expect(m.homeTeam).toBe('Arsenal')
    expect(m.homeScore).toBe(3)
    expect(apiFootball).toHaveBeenCalledWith('fixtures/headtohead', {
      h2h: '42-7',
      last: 6,
    })
  })
})

describe('fetchInjuries', () => {
  it('maps injury entries and caps at six', async () => {
    vi.mocked(apiFootball).mockResolvedValue(
      Array.from({ length: 8 }, (_, i) => ({
        player: { name: `Player ${i}`, reason: 'Knock' },
      })) as never,
    )
    const out = await fetchInjuries(42, 2025)
    expect(out).toHaveLength(6)
    expect(out[0]).toEqual({ player: 'Player 0', reason: 'Knock' })
  })
})

describe('fetchOdds', () => {
  it('extracts 1X2 decimal odds from the first bookmaker', async () => {
    vi.mocked(apiFootball).mockResolvedValue([
      {
        bookmakers: [
          {
            bets: [
              {
                id: 1,
                name: 'Match Winner',
                values: [
                  { value: 'Home', odd: '1.80' },
                  { value: 'Draw', odd: '3.60' },
                  { value: 'Away', odd: '4.50' },
                ],
              },
            ],
          },
        ],
      },
    ] as never)
    expect(await fetchOdds(700)).toEqual({ home: 1.8, draw: 3.6, away: 4.5 })
  })

  it('returns null when odds are missing', async () => {
    vi.mocked(apiFootball).mockResolvedValue([] as never)
    expect(await fetchOdds(700)).toBeNull()
  })
})

describe('fetchRecentResults', () => {
  it('maps goals into scores', async () => {
    vi.mocked(apiFootball).mockResolvedValue([
      {
        fixture: { id: 900, date: '2026-05-01T14:00:00+00:00' },
        league: { name: 'Premier League' },
        teams: { home: { name: 'Arsenal' }, away: { name: 'Everton' } },
        goals: { home: 2, away: 1 },
      },
    ] as never)

    const [m] = await fetchRecentResults(scope)
    expect(m.homeTeam).toBe('Arsenal')
    expect(m.homeScore).toBe(2)
    expect(m.awayScore).toBe(1)
  })
})
