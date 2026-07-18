import { StatCard } from './StatCard'
import { RecentMatches } from './RecentMatches'
import type { Match, Player, Stat } from '../data/mockData'

interface StatsPageProps {
  stats: Stat[]
  players: Player[]
  recentMatches: Match[]
}

interface LeaderProps {
  title: string
  players: Player[]
  metric: (p: Player) => number
}

function Leaderboard({ title, players, metric }: LeaderProps) {
  const ranked = [...players].sort((a, b) => metric(b) - metric(a)).slice(0, 5)
  const max = metric(ranked[0]) || 1

  return (
    <section className="panel">
      <div className="panel-header">
        <h3>{title}</h3>
      </div>
      <ul className="leaderboard">
        {ranked.map((p, i) => (
          <li key={p.id} className="leader-row">
            <span className="leader-rank">{i + 1}</span>
            <span className="leader-name">{p.name}</span>
            <div className="leader-bar-track">
              <div
                className="leader-bar-fill"
                style={{ width: `${(metric(p) / max) * 100}%` }}
              />
            </div>
            <span className="leader-value">{metric(p)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function StatsPage({ stats, players, recentMatches }: StatsPageProps) {
  return (
    <div className="stats-page">
      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="content-grid">
        <Leaderboard title="Top Scorers" players={players} metric={(p) => p.goals} />
        <Leaderboard title="Top Assists" players={players} metric={(p) => p.assists} />
      </div>

      <RecentMatches matches={recentMatches} />
    </div>
  )
}
