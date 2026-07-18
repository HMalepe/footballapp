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
