import type { Standing } from '../data/mockData'

interface LeagueTableProps {
  standings: Standing[]
}

export function LeagueTable({ standings }: LeagueTableProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>League Standings</h3>
        <a href="#" className="panel-link">
          Full table
        </a>
      </div>
      <div className="table-wrap">
        <table className="standings-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr key={row.rank} className={row.rank <= 4 ? 'top-four' : ''}>
                <td>{row.rank}</td>
                <td className="team-name">{row.team}</td>
                <td>{row.played}</td>
                <td>{row.won}</td>
                <td>{row.drawn}</td>
                <td>{row.lost}</td>
                <td>{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                <td className="points">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
