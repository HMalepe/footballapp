import type { Player } from '../data/types'

interface PlayerModalProps {
  player: Player
  onClose: () => void
}

const POSITION_NAMES: Record<Player['position'], string> = {
  GK: 'Goalkeeper',
  DEF: 'Defender',
  MID: 'Midfielder',
  FWD: 'Forward',
}

export function PlayerModal({ player, onClose }: PlayerModalProps) {
  const contributions = player.goals + player.assists
  const perGame =
    player.appearances > 0
      ? (contributions / player.appearances).toFixed(2)
      : '0.00'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${player.name} details`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="pm-title">
            <span className="pm-number">{player.number}</span>
            <div>
              <h3>{player.name}</h3>
              <span className="pm-position">
                {POSITION_NAMES[player.position]}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="pm-rating">
            <span className="pm-rating-val">{player.rating.toFixed(1)}</span>
            <span className="pm-rating-lbl">Average match rating</span>
          </div>

          <div className="pm-stats">
            <div className="pm-stat">
              <span className="pm-stat-val">{player.appearances}</span>
              <span className="pm-stat-lbl">Appearances</span>
            </div>
            <div className="pm-stat">
              <span className="pm-stat-val">{player.goals}</span>
              <span className="pm-stat-lbl">Goals</span>
            </div>
            <div className="pm-stat">
              <span className="pm-stat-val">{player.assists}</span>
              <span className="pm-stat-lbl">Assists</span>
            </div>
            <div className="pm-stat">
              <span className="pm-stat-val">{contributions}</span>
              <span className="pm-stat-lbl">G+A</span>
            </div>
            <div className="pm-stat">
              <span className="pm-stat-val">{perGame}</span>
              <span className="pm-stat-lbl">G+A / game</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
