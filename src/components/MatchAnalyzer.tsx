import { useMemo, useState } from 'react'
import { FormationPitch } from './FormationPitch'
import { FORMATION_KEYS, getFormation } from '../data/formations'
import { standings, upcomingFixtures } from '../data/mockData'

// Unique team pool drawn from the app's existing data.
const BASE_TEAM_POOL = Array.from(
  new Set([
    ...standings.map((s) => s.team),
    ...upcomingFixtures.flatMap((f) => [f.homeTeam, f.awayTeam]),
  ]),
).sort()

interface MatchAnalyzerProps {
  initialHome?: string
  initialAway?: string
}

type Unit = 'def' | 'mid' | 'atk'
const UNITS: { key: Unit; label: string }[] = [
  { key: 'def', label: 'Defense' },
  { key: 'mid', label: 'Midfield' },
  { key: 'atk', label: 'Attack' },
]

interface EdgeRow {
  label: string
  home: number
  away: number
  edge: 'home' | 'away' | 'even'
}

export function MatchAnalyzer({ initialHome, initialAway }: MatchAnalyzerProps) {
  const [homeTeam, setHomeTeam] = useState(
    initialHome ?? upcomingFixtures[0]?.homeTeam ?? 'Arsenal',
  )
  const [awayTeam, setAwayTeam] = useState(
    initialAway ?? upcomingFixtures[0]?.awayTeam ?? 'Chelsea',
  )
  const [homeFormation, setHomeFormation] = useState('4-3-3')
  const [awayFormation, setAwayFormation] = useState('4-2-3-1')

  // Ensure the selected teams always exist as options, even if they came
  // from a newly added fixture that isn't in the base pool.
  const teamOptions = useMemo(
    () =>
      Array.from(new Set([...BASE_TEAM_POOL, homeTeam, awayTeam])).sort(),
    [homeTeam, awayTeam],
  )

  const analysis = useMemo(() => {
    const hs = getFormation(homeFormation).strength
    const as = getFormation(awayFormation).strength
    const rows: EdgeRow[] = UNITS.map(({ key, label }) => {
      const home = hs[key]
      const away = as[key]
      const diff = home - away
      const edge: EdgeRow['edge'] = diff >= 2 ? 'home' : diff <= -2 ? 'away' : 'even'
      return { label, home, away, edge }
    })
    const homeTotal = hs.def + hs.mid + hs.atk
    const awayTotal = as.def + as.mid + as.atk
    const totalDiff = homeTotal - awayTotal
    let verdict: string
    if (totalDiff >= 3) {
      verdict = `${homeTeam}'s ${homeFormation} holds the tactical edge on the balance of the shapes.`
    } else if (totalDiff <= -3) {
      verdict = `${awayTeam}'s ${awayFormation} looks the better-balanced setup on paper.`
    } else {
      verdict = 'The two shapes are finely balanced — this one likely turns on individual quality.'
    }
    return { rows, homeTotal, awayTotal, verdict }
  }, [homeFormation, awayFormation, homeTeam, awayTeam])

  const homeWeakness = getFormation(homeFormation).weakness
  const awayWeakness = getFormation(awayFormation).weakness

  const swap = () => {
    setHomeTeam(awayTeam)
    setAwayTeam(homeTeam)
    setHomeFormation(awayFormation)
    setAwayFormation(homeFormation)
  }

  return (
    <div className="analyzer">
      {/* Setup controls */}
      <section className="panel analyzer-setup">
        <div className="setup-side setup-home">
          <span className="setup-tag">Home</span>
          <label className="setup-field">
            <span>Team</span>
            <select value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)}>
              {teamOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="setup-field">
            <span>Formation</span>
            <select
              value={homeFormation}
              onChange={(e) => setHomeFormation(e.target.value)}
            >
              {FORMATION_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button type="button" className="setup-swap" onClick={swap} title="Swap sides">
          ⇄
        </button>

        <div className="setup-side setup-away">
          <span className="setup-tag setup-tag-away">Away</span>
          <label className="setup-field">
            <span>Team</span>
            <select value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)}>
              {teamOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="setup-field">
            <span>Formation</span>
            <select
              value={awayFormation}
              onChange={(e) => setAwayFormation(e.target.value)}
            >
              {FORMATION_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Pitch */}
      <section className="panel">
        <div className="panel-header">
          <h3>Formation Clash</h3>
          <span className="panel-sub">
            {homeFormation} vs {awayFormation}
          </span>
        </div>
        <FormationPitch
          homeFormation={homeFormation}
          awayFormation={awayFormation}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
        />
      </section>

      {/* Unit strength comparison */}
      <section className="panel">
        <div className="panel-header">
          <h3>Unit Strength</h3>
          <span className="panel-sub">Shape balance · 0–10</span>
        </div>
        <div className="edge-grid">
          {analysis.rows.map((row) => (
            <div key={row.label} className="edge-row">
              <span className="edge-val edge-val-home">{row.home}</span>
              <div className="edge-bars">
                <div className="edge-bar-track edge-bar-home">
                  <div
                    className="edge-bar-fill edge-fill-home"
                    style={{ width: `${row.home * 10}%` }}
                  />
                </div>
                <span className={`edge-label edge-label-${row.edge}`}>{row.label}</span>
                <div className="edge-bar-track edge-bar-away">
                  <div
                    className="edge-bar-fill edge-fill-away"
                    style={{ width: `${row.away * 10}%` }}
                  />
                </div>
              </div>
              <span className="edge-val edge-val-away">{row.away}</span>
            </div>
          ))}
        </div>
        <p className="verdict">⚡ {analysis.verdict}</p>
      </section>

      {/* Exploit zones */}
      <section className="panel">
        <div className="panel-header">
          <h3>Where to Hurt Them</h3>
          <span className="panel-sub">Primary structural weakness</span>
        </div>
        <div className="weakness-grid">
          <div className="weakness-card weakness-home">
            <span className="weakness-team">
              {homeTeam} · {homeFormation}
            </span>
            <span className="weakness-title">{homeWeakness.label}</span>
            <span className="weakness-detail">{homeWeakness.detail}</span>
          </div>
          <div className="weakness-card weakness-away">
            <span className="weakness-team">
              {awayTeam} · {awayFormation}
            </span>
            <span className="weakness-title">{awayWeakness.label}</span>
            <span className="weakness-detail">{awayWeakness.detail}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
