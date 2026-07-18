import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { StatCard } from './components/StatCard'
import { FixturesList } from './components/FixturesList'
import { LeagueTable } from './components/LeagueTable'
import { RecentMatches } from './components/RecentMatches'
import { MatchAnalyzer } from './components/MatchAnalyzer'
import { PlayersList } from './components/PlayersList'
import { StatsPage } from './components/StatsPage'
import {
  stats,
  upcomingFixtures,
  standings,
  recentMatches,
  players,
} from './data/mockData'

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Overview of your football season at a glance',
  },
  fixtures: {
    title: 'Fixtures',
    subtitle: 'Upcoming matches and schedule',
  },
  standings: {
    title: 'Standings',
    subtitle: 'Current league table and rankings',
  },
  analyzer: {
    title: 'Match Analyzer',
    subtitle: 'Compare formations and expose tactical weaknesses',
  },
  players: {
    title: 'Players',
    subtitle: 'Squad roster and player stats',
  },
  stats: {
    title: 'Statistics',
    subtitle: 'Team and player performance metrics',
  },
}

function DashboardPage() {
  return (
    <>
      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="content-grid">
        <FixturesList fixtures={upcomingFixtures} />
        <LeagueTable standings={standings} />
      </div>

      <RecentMatches matches={recentMatches} />
    </>
  )
}

function renderPage(activeNav: string) {
  switch (activeNav) {
    case 'fixtures':
      return <FixturesList fixtures={upcomingFixtures} />
    case 'standings':
      return <LeagueTable standings={standings} />
    case 'analyzer':
      return <MatchAnalyzer />
    case 'players':
      return <PlayersList players={players} />
    case 'stats':
      return (
        <StatsPage stats={stats} players={players} recentMatches={recentMatches} />
      )
    default:
      return <DashboardPage />
  }
}

function App() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const page = pageTitles[activeNav] ?? pageTitles.dashboard

  return (
    <div className="dashboard">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      <main className="main-content">
        <Header title={page.title} subtitle={page.subtitle} />
        {renderPage(activeNav)}
      </main>
    </div>
  )
}

export default App
