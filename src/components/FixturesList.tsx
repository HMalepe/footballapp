import type { Fixture } from '../data/types'

interface FixturesListProps {
  fixtures: Fixture[]
  onViewAll?: () => void
  onAnalyze?: (fixture: Fixture) => void
  onRemove?: (id: number) => void
}

export function FixturesList({
  fixtures,
  onViewAll,
  onAnalyze,
  onRemove,
}: FixturesListProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Upcoming Fixtures</h3>
        {onViewAll && (
          <button type="button" className="panel-link" onClick={onViewAll}>
            View all
          </button>
        )}
      </div>
      {fixtures.length === 0 ? (
        <p className="empty-state">
          No fixtures scheduled. Use “+ New Match” to add one.
        </p>
      ) : (
        <ul className="fixtures-list">
          {fixtures.map((fixture) => (
            <li key={fixture.id} className="fixture-item">
              <div className="fixture-date">
                <span className="date">{fixture.date}</span>
                <span className="time">{fixture.time}</span>
              </div>
              <div className="fixture-teams">
                <span>{fixture.homeTeam}</span>
                <span className="vs">vs</span>
                <span>{fixture.awayTeam}</span>
              </div>
              <span className="fixture-comp">{fixture.competition}</span>
              {(onAnalyze || onRemove) && (
                <div className="fixture-actions">
                  {onAnalyze && (
                    <button
                      type="button"
                      className="row-action"
                      title="Analyze this matchup"
                      onClick={() => onAnalyze(fixture)}
                    >
                      ⚔ Analyze
                    </button>
                  )}
                  {onRemove && (
                    <button
                      type="button"
                      className="row-action row-remove"
                      title="Remove fixture"
                      aria-label={`Remove ${fixture.homeTeam} vs ${fixture.awayTeam}`}
                      onClick={() => onRemove(fixture.id)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
