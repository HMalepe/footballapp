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
import { useLocalStorage } from './utils/useLocalStorage'
import { useLiveData } from './hooks/useLiveData'
import { isLiveEnabled } from './services/config'
import {
  fetchStandings,
  fetchRecentResults,
  fetchPlayers,
  fetchUpcomingFixtures,
} from './services/football'
import {
  stats,
  upcomingFixtures as sampleFixtures,
  standings as sampleStandings,
  recentMatches as sampleRecentMatches,
  players as samplePlayers,
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

interface AnalyzerMatch {
  home: string
  away: string
}

function App() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [showNewMatch, setShowNewMatch] = useState(false)
  const [analyzerMatch, setAnalyzerMatch] = useState<AnalyzerMatch | null>(null)
  const page = pageTitles[activeNav] ?? pageTitles.dashboard

  // Live feeds — each falls back to bundled sample data when no key is set.
  const standingsFeed = useLiveData(fetchStandings, sampleStandings)
  const resultsFeed = useLiveData(fetchRecentResults, sampleRecentMatches)
  const playersFeed = useLiveData(fetchPlayers, samplePlayers)
  const fixturesFeed = useLiveData(fetchUpcomingFixtures, sampleFixtures)
  const standings = standingsFeed.data
  const recentMatches = resultsFeed.data
  const players = playersFeed.data
  const feedsLoading =
    standingsFeed.loading ||
    resultsFeed.loading ||
    playersFeed.loading ||
    fixturesFeed.loading

  // The fixtures list layers user-added matches on top of the live/sample
  // feed, with user-removed ids filtered out. Both edits persist locally.
  const [userFixtures, setUserFixtures] = useLocalStorage<Fixture[]>(
    'football-app.userFixtures',
    [],
  )
  const [removedFixtureIds, setRemovedFixtureIds] = useLocalStorage<number[]>(
    'football-app.removedFixtures',
    [],
  )
  const fixtures = [...userFixtures, ...fixturesFeed.data].filter(
    (f) => !removedFixtureIds.includes(f.id),
  )

  const addMatch = (data: Omit<Fixture, 'id'>) => {
    // Timestamp id keeps user matches from colliding with feed/sample ids.
    setUserFixtures((prev) => [{ id: Date.now(), ...data }, ...prev])
    setShowNewMatch(false)
    setActiveNav('fixtures')
  }

  const removeFixture = (id: number) => {
    setUserFixtures((prev) => prev.filter((f) => f.id !== id))
    setRemovedFixtureIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    )
  }

  const analyzeFixture = (fixture: Fixture) => {
    setAnalyzerMatch({ home: fixture.homeTeam, away: fixture.awayTeam })
    setActiveNav('analyzer')
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
        return (
          <FixturesList
            fixtures={fixtures}
            onAnalyze={analyzeFixture}
            onRemove={removeFixture}
          />
        )
      case 'standings':
        return <LeagueTable standings={standings} />
      case 'analyzer':
        return (
          <MatchAnalyzer
            key={analyzerMatch ? `${analyzerMatch.home}-${analyzerMatch.away}` : 'default'}
            initialHome={analyzerMatch?.home}
            initialAway={analyzerMatch?.away}
          />
        )
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
                onAnalyze={analyzeFixture}
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
          isLive={isLiveEnabled()}
          loading={feedsLoading}
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
