import { LEAGUES, SEASONS } from '../data/leagues'
import type { Scope, Standing } from '../data/types'

interface ScopeBarProps {
  scope: Scope
  onChange: (scope: Scope) => void
  // Team options for the current league (from live standings).
  teams: Standing[]
  teamsLoading: boolean
}

export function ScopeBar({ scope, onChange, teams, teamsLoading }: ScopeBarProps) {
  return (
    <div className="scope-bar">
      <label className="scope-field">
        <span>League</span>
        <select
          value={scope.league}
          onChange={(e) => onChange({ ...scope, league: Number(e.target.value) })}
        >
          {LEAGUES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>

      <label className="scope-field">
        <span>Season</span>
        <select
          value={scope.season}
          onChange={(e) => onChange({ ...scope, season: Number(e.target.value) })}
        >
          {SEASONS.map((y) => (
            <option key={y} value={y}>
              {y}/{String(y + 1).slice(2)}
            </option>
          ))}
        </select>
      </label>

      <label className="scope-field">
        <span>Team</span>
        <select
          value={scope.team}
          disabled={teamsLoading || teams.length === 0}
          onChange={(e) => onChange({ ...scope, team: Number(e.target.value) })}
        >
          {teams.length === 0 ? (
            <option value={scope.team}>
              {teamsLoading ? 'Loading…' : 'No teams'}
            </option>
          ) : (
            teams.map((t) => (
              <option key={t.teamId} value={t.teamId}>
                {t.team}
              </option>
            ))
          )}
        </select>
      </label>
    </div>
  )
}
