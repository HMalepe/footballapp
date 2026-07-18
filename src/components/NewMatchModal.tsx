import { useState } from 'react'
import type { Fixture } from '../data/mockData'

interface NewMatchModalProps {
  onClose: () => void
  onAdd: (fixture: Omit<Fixture, 'id'>) => void
}

export function NewMatchModal({ onClose, onAdd }: NewMatchModalProps) {
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [competition, setCompetition] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!homeTeam.trim() || !awayTeam.trim()) {
      setError('Both team names are required.')
      return
    }
    onAdd({
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      competition: competition.trim() || 'Friendly',
      date: date.trim() || 'TBD',
      time: time.trim() || '--:--',
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Add new match"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3>New Match</h3>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={submit}>
          <div className="modal-grid">
            <label className="modal-field">
              <span>Home Team *</span>
              <input
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                placeholder="e.g. Arsenal"
                autoFocus
              />
            </label>
            <label className="modal-field">
              <span>Away Team *</span>
              <input
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                placeholder="e.g. Chelsea"
              />
            </label>
            <label className="modal-field">
              <span>Competition</span>
              <input
                value={competition}
                onChange={(e) => setCompetition(e.target.value)}
                placeholder="e.g. Premier League"
              />
            </label>
            <div className="modal-row">
              <label className="modal-field">
                <span>Date</span>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. Jul 20"
                />
              </label>
              <label className="modal-field">
                <span>Time</span>
                <input
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 15:00"
                />
              </label>
            </div>
          </div>

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Match
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
