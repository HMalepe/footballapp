import { useMemo, useState } from 'react'
import { FormationPitch } from './FormationPitch'
import { MatchContext } from './MatchContext'
import { FORMATION_KEYS, getFormation } from '../data/formations'
import type { Standing } from '../data/types'

interface MatchAnalyzerProps {
  initialHome?: string
  initialAway?: string
  // Live standings — used for team suggestions and the Match Context panel.
  standings?: Standing[]
  season: number
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

export function MatchAnalyzer({
  initialHome,
  initialAway,
  standings = [],
  season,
}: MatchAnalyzerProps) {
  const teams = useMemo(() => standings.map((s) => s.team), [standings])
  const [homeTeam, setHomeTeam] = useState(initialHome ?? teams[0] ?? '')
  const [awayTeam, setAwayTeam] = useState(initialAway ?? teams[1] ?? '')
  const [homeFormation, setHomeFormation] = useState('4-3-3')
  const [awayFormation, setAwayFormation] = useState('4-2-3-1')

  // Suggestions for the team inputs — live teams, sorted and de-duplicated.
  const teamOptions = useMemo(
    () => Array.from(new Set(teams.filter(Boolean))).sort(),
    [teams],
  )

  // Resolve the typed names to standings rows so we can pull live H2H/form.
  const homeStanding = standings.find(
    (s) => s.team.toLowerCase() === homeTeam.trim().toLowerCase(),
  )
  const awayStanding = standings.find(
    (s) => s.team.toLowerCase() === awayTeam.trim().toLowerCase(),
  )

  // Fallback labels so the pitch/verdict read cleanly before names are typed.
  const homeLabel = homeTeam.trim() || 'Home'
  const awayLabel = awayTeam.trim() || 'Away'

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
      verdict = `${homeLabel}'s ${homeFormation} holds the tactical edge on the balance of the shapes.`
    } else if (totalDiff <= -3) {
      verdict = `${awayLabel}'s ${awayFormation} looks the better-balanced setup on paper.`
    } else {
      verdict = 'The two shapes are finely balanced — this one likely turns on individual quality.'
    }
    return { rows, homeTotal, awayTotal, verdict }
  }, [homeFormation, awayFormation, homeLabel, awayLabel])

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
            <input
              className="setup-input"
              list="analyzer-team-list"
              value={homeTeam}
              placeholder="Team name"
              onChange={(e) => setHomeTeam(e.target.value)}
            />
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
            <input
              className="setup-input"
              list="analyzer-team-list"
              value={awayTeam}
              placeholder="Team name"
              onChange={(e) => setAwayTeam(e.target.value)}
            />
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

      <datalist id="analyzer-team-list">
        {teamOptions.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>

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
          homeTeam={homeLabel}
          awayTeam={awayLabel}
        />
      </section>

      {/* Live Layer-1 context — only when both teams resolve to the league table */}
      {homeStanding && awayStanding && (
        <MatchContext
          key={`${homeStanding.teamId}-${awayStanding.teamId}`}
          home={homeStanding}
          away={awayStanding}
          season={season}
        />
      )}

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
              {homeLabel} · {homeFormation}
            </span>
            <span className="weakness-title">{homeWeakness.label}</span>
            <span className="weakness-detail">{homeWeakness.detail}</span>
          </div>
          <div className="weakness-card weakness-away">
            <span className="weakness-team">
              {awayLabel} · {awayFormation}
            </span>
            <span className="weakness-title">{awayWeakness.label}</span>
            <span className="weakness-detail">{awayWeakness.detail}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
