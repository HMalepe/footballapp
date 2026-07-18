import type { Fixture } from '../data/mockData'

interface FixturesListProps {
  fixtures: Fixture[]
  onViewAll?: () => void
}

export function FixturesList({ fixtures, onViewAll }: FixturesListProps) {
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
          </li>
        ))}
      </ul>
    </section>
  )
}
