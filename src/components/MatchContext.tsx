import { useLiveData } from '../hooks/useLiveData'
import { FeedState } from './FeedState'
import { fetchForm, fetchHeadToHead } from '../services/football'
import type { FormGame, Match, Standing } from '../data/types'

interface MatchContextProps {
  home: Standing
  away: Standing
  season: number
}

function FormPills({ games }: { games: FormGame[] }) {
  if (!games.length) return <span className="ctx-muted">No recent games</span>
  return (
    <span className="form-pills">
      {games.map((g, i) => (
        <span
          key={i}
          className={`form-pill form-${g.result.toLowerCase()}`}
          title={`${g.home ? 'H' : 'A'} vs ${g.opponent} ${g.score}`}
        >
          {g.result}
        </span>
      ))}
    </span>
  )
}

function h2hSummary(games: Match[], homeName: string, awayName: string) {
  let h = 0
  let d = 0
  let a = 0
  games.forEach((g) => {
    const homeWon = g.homeScore > g.awayScore
    const draw = g.homeScore === g.awayScore
    const winner = draw ? null : homeWon ? g.homeTeam : g.awayTeam
    if (draw) d++
    else if (winner === homeName) h++
    else if (winner === awayName) a++
  })
  return { h, d, a }
}

export function MatchContext({ home, away, season }: MatchContextProps) {
  const feed = useLiveData(
    () =>
      Promise.all([
        fetchHeadToHead(home.teamId, away.teamId),
        fetchForm(home.teamId, season),
        fetchForm(away.teamId, season),
      ]).then(([h2h, homeForm, awayForm]) => ({ h2h, homeForm, awayForm })),
    `${home.teamId}-${away.teamId}-${season}`,
  )

  const data = feed.data
  const summary = data ? h2hSummary(data.h2h, home.team, away.team) : null

  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Match Context</h3>
        <span className="panel-sub">Form · Head-to-head · Home/away</span>
      </div>

      <FeedState
        configured={feed.configured}
        loading={feed.loading}
        error={feed.error}
        empty={!data}
      >
        {data && (
          <div className="ctx-grid">
            {/* Recent form */}
            <div className="ctx-block">
              <span className="ctx-label">Recent form (last 5)</span>
              <div className="ctx-row">
                <span className="ctx-team ctx-team-home">{home.team}</span>
                <FormPills games={data.homeForm} />
              </div>
              <div className="ctx-row">
                <span className="ctx-team ctx-team-away">{away.team}</span>
                <FormPills games={data.awayForm} />
              </div>
            </div>

            {/* Home / away records */}
            <div className="ctx-block">
              <span className="ctx-label">Venue record this season</span>
              <div className="ctx-row">
                <span className="ctx-team ctx-team-home">{home.team} at home</span>
                <span className="ctx-record">
                  {home.home.won}W {home.home.drawn}D {home.home.lost}L · GF{' '}
                  {home.home.goalsFor} GA {home.home.goalsAgainst}
                </span>
              </div>
              <div className="ctx-row">
                <span className="ctx-team ctx-team-away">{away.team} away</span>
                <span className="ctx-record">
                  {away.away.won}W {away.away.drawn}D {away.away.lost}L · GF{' '}
                  {away.away.goalsFor} GA {away.away.goalsAgainst}
                </span>
              </div>
            </div>

            {/* Head to head */}
            <div className="ctx-block ctx-block-wide">
              <span className="ctx-label">
                Head-to-head (last {data.h2h.length})
                {summary && (
                  <span className="ctx-h2h-summary">
                    {' '}
                    · {home.team} {summary.h} — {summary.d} draws — {summary.a}{' '}
                    {away.team}
                  </span>
                )}
              </span>
              {data.h2h.length === 0 ? (
                <span className="ctx-muted">No previous meetings on record</span>
              ) : (
                <ul className="ctx-h2h-list">
                  {data.h2h.map((g) => (
                    <li key={g.id} className="ctx-h2h-item">
                      <span className="ctx-h2h-date">{g.date}</span>
                      <span className="ctx-h2h-score">
                        {g.homeTeam} {g.homeScore}–{g.awayScore} {g.awayTeam}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </FeedState>
    </section>
  )
}
