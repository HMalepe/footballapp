import type { Match } from '../data/mockData'

interface RecentMatchesProps {
  matches: Match[]
}

export function RecentMatches({ matches }: RecentMatchesProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Recent Results</h3>
        <a href="#" className="panel-link">
          View all
        </a>
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
