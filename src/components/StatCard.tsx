import type { Stat } from '../data/types'

interface StatCardProps {
  stat: Stat
}

export function StatCard({ stat }: StatCardProps) {
  return (
    <div className="stat-card">
      <span className="stat-label">{stat.label}</span>
      <span className="stat-value">{stat.value}</span>
      <span className={`stat-change trend-${stat.trend}`}>{stat.change}</span>
    </div>
  )
}
