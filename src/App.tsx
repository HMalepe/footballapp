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
import { NewMatchModal } from './components/NewMatchModal'
import { downloadCsv } from './utils/csv'
import {
  stats,
  upcomingFixtures,
  standings,
  recentMatches,
  players,
  type Fixture,
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

function App() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [fixtures, setFixtures] = useState<Fixture[]>(upcomingFixtures)
  const [showNewMatch, setShowNewMatch] = useState(false)
  const page = pageTitles[activeNav] ?? pageTitles.dashboard

  const addMatch = (data: Omit<Fixture, 'id'>) => {
    const id = fixtures.reduce((max, f) => Math.max(max, f.id), 0) + 1
    setFixtures((prev) => [{ id, ...data }, ...prev])
    setShowNewMatch(false)
    setActiveNav('fixtures')
  }

  const handleExport = () => {
    switch (activeNav) {
      case 'standings':
        downloadCsv(
          'standings',
          ['Rank', 'Team', 'P', 'W', 'D', 'L', 'GD', 'Pts'],
          standings.map((s) => [
            s.rank,
            s.team,
            s.played,
            s.won,
            s.drawn,
            s.lost,
            s.gd,
            s.points,
          ]),
        )
        break
      case 'players':
      case 'stats':
        downloadCsv(
          'players',
          ['Number', 'Name', 'Position', 'Apps', 'Goals', 'Assists', 'Rating'],
          players.map((p) => [
            p.number,
            p.name,
            p.position,
            p.appearances,
            p.goals,
            p.assists,
            p.rating,
          ]),
        )
        break
      default:
        downloadCsv(
          'fixtures',
          ['Date', 'Time', 'Home', 'Away', 'Competition'],
          fixtures.map((f) => [
            f.date,
            f.time,
            f.homeTeam,
            f.awayTeam,
            f.competition,
          ]),
        )
    }
  }

  const renderPage = () => {
    switch (activeNav) {
      case 'fixtures':
        return <FixturesList fixtures={fixtures} />
      case 'standings':
        return <LeagueTable standings={standings} />
      case 'analyzer':
        return <MatchAnalyzer />
      case 'players':
        return <PlayersList players={players} />
      case 'stats':
        return (
          <StatsPage
            stats={stats}
            players={players}
            recentMatches={recentMatches}
          />
        )
      default:
        return (
          <>
            <div className="stats-grid">
              {stats.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
            </div>

            <div className="content-grid">
              <FixturesList
                fixtures={fixtures}
                onViewAll={() => setActiveNav('fixtures')}
              />
              <LeagueTable
                standings={standings}
                onViewAll={() => setActiveNav('standings')}
              />
            </div>

            <RecentMatches
              matches={recentMatches}
              onViewAll={() => setActiveNav('stats')}
            />
          </>
        )
    }
  }

  return (
    <div className="dashboard">
      <Sidebar activeItem={activeNav} onNavigate={setActiveNav} />
      <main className="main-content">
        <Header
          title={page.title}
          subtitle={page.subtitle}
          onExport={handleExport}
          onNewMatch={() => setShowNewMatch(true)}
        />
        {renderPage()}
      </main>

      {showNewMatch && (
        <NewMatchModal onClose={() => setShowNewMatch(false)} onAdd={addMatch} />
      )}
    </div>
  )
}

export default App
