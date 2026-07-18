import { useState } from 'react'
import type { Player, PlayerPosition } from '../data/mockData'

interface PlayersListProps {
  players: Player[]
}

type Filter = 'ALL' | PlayerPosition

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'GK', label: 'Goalkeepers' },
  { key: 'DEF', label: 'Defenders' },
  { key: 'MID', label: 'Midfielders' },
  { key: 'FWD', label: 'Forwards' },
]

export function PlayersList({ players }: PlayersListProps) {
  const [filter, setFilter] = useState<Filter>('ALL')

  const visible = players
    .filter((p) => filter === 'ALL' || p.position === filter)
    .sort((a, b) => a.number - b.number)

  return (
    <div className="players-page">
      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`filter-chip ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="players-grid">
        {visible.map((player) => (
          <article key={player.id} className="player-card">
            <div className="player-card-top">
              <span className="player-number">{player.number}</span>
              <span className={`player-pos player-pos-${player.position.toLowerCase()}`}>
                {player.position}
              </span>
            </div>
            <h4 className="player-name">{player.name}</h4>
            <div className="player-rating">
              <span className="rating-value">{player.rating.toFixed(1)}</span>
              <span className="rating-label">Avg rating</span>
            </div>
            <div className="player-stats">
              <div className="player-stat">
                <span className="ps-value">{player.appearances}</span>
                <span className="ps-label">Apps</span>
              </div>
              <div className="player-stat">
                <span className="ps-value">{player.goals}</span>
                <span className="ps-label">Goals</span>
              </div>
              <div className="player-stat">
                <span className="ps-value">{player.assists}</span>
                <span className="ps-label">Assists</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
