import { useEffect, useState } from 'react'
import { useLiveData } from '../hooks/useLiveData'
import { FeedState } from './FeedState'
import { fetchInjuries, fetchNextMeetingId, fetchOdds } from '../services/football'
import { generateContextReport } from '../services/anthropic'
import { isAiEnabled } from '../services/config'
import { computeStakes, stakesAsymmetry } from '../utils/motivation'
import { impliedProbabilities, oddsMovement } from '../utils/odds'
import type { OddsMovement as Movement } from '../utils/odds'
import type { ContextReport as Report, FormGame, Odds, Standing } from '../data/types'

interface ContextReportProps {
  home: Standing
  away: Standing
  season: number
  leagueSize: number
  leagueName: string
  homeForm: FormGame[]
  awayForm: FormGame[]
  h2hSummary: string
}

function formString(games: FormGame[]): string {
  return games.length ? games.map((g) => g.result).join(' ') : 'N/A'
}

function scoreClass(score: number): string {
  if (score >= 9) return 'trap-flag'
  if (score >= 7) return 'trap-high'
  if (score >= 4) return 'trap-mod'
  return 'trap-low'
}

export function ContextReport({
  home,
  away,
  season,
  leagueSize,
  leagueName,
  homeForm,
  awayForm,
  h2hSummary,
}: ContextReportProps) {
  const homeStakes = computeStakes(home.rank, leagueSize)
  const awayStakes = computeStakes(away.rank, leagueSize)

  // Layer 2 — injuries (real, live).
  const injuries = useLiveData(
    () =>
      Promise.all([
        fetchInjuries(home.teamId, season),
        fetchInjuries(away.teamId, season),
      ]).then(([homeInj, awayInj]) => ({ homeInj, awayInj })),
    `inj-${home.teamId}-${away.teamId}-${season}`,
  )

  // Layer 4 — market odds for the next meeting of these two teams.
  const oddsFeed = useLiveData<{ fixtureId: number | null; odds: Odds | null }>(
    async () => {
      const fixtureId = await fetchNextMeetingId(home.teamId, away.teamId)
      const odds = fixtureId ? await fetchOdds(fixtureId) : null
      return { fixtureId, odds }
    },
    `odds-${home.teamId}-${away.teamId}`,
  )
  const odds = oddsFeed.data?.odds ?? null

  // Track how the price has moved since the user last viewed this fixture.
  const [movement, setMovement] = useState<Movement | null>(null)
  useEffect(() => {
    const d = oddsFeed.data
    if (!d?.odds || !d.fixtureId) return
    const key = `odds-snap:${d.fixtureId}`
    try {
      const prevRaw = localStorage.getItem(key)
      if (prevRaw) {
        setMovement(oddsMovement(JSON.parse(prevRaw) as Odds, d.odds))
      }
      localStorage.setItem(key, JSON.stringify(d.odds))
    } catch {
      // Ignore storage errors — movement is a nice-to-have.
    }
  }, [oddsFeed.data])

  // Layers 3-4 + Trap Score — on-demand LLM analysis.
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await generateContextReport({
        home: home.team,
        away: away.team,
        league: leagueName,
        season,
        homePosition: `${home.rank}${ordinal(home.rank)}, ${home.points} pts`,
        awayPosition: `${away.rank}${ordinal(away.rank)}, ${away.points} pts`,
        homeForm: formString(homeForm),
        awayForm: formString(awayForm),
        h2hSummary,
        homeStakes: `${homeStakes.label} — ${homeStakes.note}`,
        awayStakes: `${awayStakes.label} — ${awayStakes.note}`,
        homeInjuries: injuriesText(injuries.data?.homeInj),
        awayInjuries: injuriesText(injuries.data?.awayInj),
        odds: oddsText(odds),
      })
      setReport(result)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Deeper Context</h3>
        <span className="panel-sub">Motivation · Injuries · Trap Score</span>
      </div>

      {/* Layer 2 — motivation */}
      <div className="ctx-block" style={{ marginBottom: 12 }}>
        <span className="ctx-label">What's at stake (Layer 2)</span>
        <div className="ctx-row">
          <span className="ctx-team ctx-team-home">{home.team}</span>
          <span className="ctx-record">{homeStakes.label}</span>
        </div>
        <div className="ctx-row">
          <span className="ctx-team ctx-team-away">{away.team}</span>
          <span className="ctx-record">{awayStakes.label}</span>
        </div>
        <span className="ctx-muted">{stakesAsymmetry(homeStakes, awayStakes)}</span>
      </div>

      {/* Layer 2 — injuries */}
      <div className="ctx-block" style={{ marginBottom: 12 }}>
        <span className="ctx-label">Reported injuries (Layer 2)</span>
        <FeedState
          configured={injuries.configured}
          loading={injuries.loading}
          error={injuries.error}
          empty={!injuries.data}
        >
          {injuries.data && (
            <>
              <div className="ctx-row">
                <span className="ctx-team ctx-team-home">{home.team}</span>
                <span className="ctx-record">{injuriesText(injuries.data.homeInj)}</span>
              </div>
              <div className="ctx-row">
                <span className="ctx-team ctx-team-away">{away.team}</span>
                <span className="ctx-record">{injuriesText(injuries.data.awayInj)}</span>
              </div>
            </>
          )}
        </FeedState>
      </div>

      {/* Layer 4 — market odds (only shown when a fixture + prices exist) */}
      {odds && (
        <div className="ctx-block" style={{ marginBottom: 12 }}>
          <span className="ctx-label">Market odds (Layer 4)</span>
          <OddsBar
            homeTeam={home.team}
            awayTeam={away.team}
            odds={odds}
            movement={movement}
          />
        </div>
      )}

      {/* Layers 3-4 + Trap Score — AI generated */}
      {!isAiEnabled() ? (
        <div className="ai-hint">
          🔌 Add a Claude API key (<code>VITE_ANTHROPIC_KEY</code>) to research the
          web for the human-intelligence and sentiment layers plus a Trap Score.
        </div>
      ) : report ? (
        <TrapReport report={report} onRegenerate={generate} loading={loading} />
      ) : (
        <div className="ai-generate">
          <button
            type="button"
            className="btn-primary"
            onClick={generate}
            disabled={loading}
          >
            {loading ? 'Researching the web…' : '🔎 Research & build report'}
          </button>
          {loading && (
            <span className="ai-note">
              Claude is searching for current team news, morale, and sentiment —
              this can take up to a minute.
            </span>
          )}
          {error && <p className="ai-error">{error}</p>}
        </div>
      )}

      <p className="ctx-disclaimer">
        Educational context only — not betting advice, not a prediction. The Trap
        Score estimates how much hidden context a casual read may miss. 18+ · Please
        gamble responsibly · BeGambleAware.org
      </p>
    </section>
  )
}

function TrapReport({
  report,
  onRegenerate,
  loading,
}: {
  report: Report
  onRegenerate: () => void
  loading: boolean
}) {
  return (
    <div className="trap-report">
      <div className={`trap-gauge ${scoreClass(report.trapScore)}`}>
        <span className="trap-score">{report.trapScore}</span>
        <div className="trap-meta">
          <span className="trap-band">{report.classification}</span>
          <span className="trap-scale">Trap Score · 1–10</span>
        </div>
      </div>

      <p className="trap-explanation">{report.explanation}</p>

      {report.humanIntel.length > 0 && (
        <div className="ctx-block" style={{ marginBottom: 12 }}>
          <span className="ctx-label">Human intelligence (Layer 3)</span>
          <ul className="trap-list">
            {report.humanIntel.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {report.sentiment.length > 0 && (
        <div className="ctx-block">
          <span className="ctx-label">Sentiment & narrative (Layer 4)</span>
          <ul className="trap-list">
            {report.sentiment.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {report.sources.length > 0 && (
        <div className="trap-sources">
          <span className="ctx-label">Sources</span>
          <div className="trap-source-links">
            {report.sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={s.title}
              >
                [{i + 1}] {hostOf(s.url)}
              </a>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        className="btn-secondary trap-regen"
        onClick={onRegenerate}
        disabled={loading}
      >
        {loading ? 'Researching…' : '↻ Regenerate'}
      </button>
    </div>
  )
}

function OddsBar({
  homeTeam,
  awayTeam,
  odds,
  movement,
}: {
  homeTeam: string
  awayTeam: string
  odds: Odds
  movement: Movement | null
}) {
  const probs = impliedProbabilities(odds)
  const cols: {
    key: 'home' | 'draw' | 'away'
    label: string
    price: number
    prob: number
  }[] = [
    { key: 'home', label: homeTeam, price: odds.home, prob: probs.home },
    { key: 'draw', label: 'Draw', price: odds.draw, prob: probs.draw },
    { key: 'away', label: awayTeam, price: odds.away, prob: probs.away },
  ]
  return (
    <div className="odds-bar">
      {cols.map((c) => {
        const dir = movement?.[c.key]
        return (
          <div key={c.key} className="odds-cell">
            <span className="odds-label">{c.label}</span>
            <span className="odds-price">
              {c.price.toFixed(2)}
              {dir && dir !== 'same' && (
                <span className={`odds-move odds-${dir}`}>
                  {dir === 'shortened' ? '▼' : '▲'}
                </span>
              )}
            </span>
            <span className="odds-prob">{c.prob}%</span>
          </div>
        )
      })}
    </div>
  )
}

function oddsText(odds: Odds | null): string {
  if (!odds) return 'Not available'
  const p = impliedProbabilities(odds)
  return `1X2 ${odds.home.toFixed(2)} / ${odds.draw.toFixed(2)} / ${odds.away.toFixed(2)} (implied ${p.home}% / ${p.draw}% / ${p.away}%)`
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'source'
  }
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

function injuriesText(list?: { player: string; reason: string }[]): string {
  if (!list || list.length === 0) return 'None reported'
  return list.map((i) => `${i.player} (${i.reason})`).join(', ')
}
