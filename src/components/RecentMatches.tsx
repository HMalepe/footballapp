import type { Match } from '../data/mockData'

interface RecentMatchesProps {
  matches: Match[]
  onViewAll?: () => void
}

export function RecentMatches({ matches, onViewAll }: RecentMatchesProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Recent Results</h3>
        {onViewAll && (
          <button type="button" className="panel-link" onClick={onViewAll}>
            View all
          </button>
        )}
      </div>
      <ul className="results-list">
        {matches.map((match) => (
          <li key={match.id} className="result-item">
            <span className="result-date">{match.date}</span>
            <div className="result-score">
              <span className="team">{match.homeTeam}</span>
              <span className="score">
                {match.homeScore} - {match.awayScore}
              </span>
              <span className="team">{match.awayTeam}</span>
            </div>
            <span className="result-comp">{match.competition}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
