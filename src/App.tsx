import { useEffect, useState } from 'react'
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
import { FeedState } from './components/FeedState'
import { ScopeBar } from './components/ScopeBar'
import { downloadCsv } from './utils/csv'
import { useLocalStorage } from './utils/useLocalStorage'
import { useLiveData } from './hooks/useLiveData'
import { apiConfig, isLiveEnabled } from './services/config'
import { clearApiCache } from './services/cache'
import {
  fetchTeamStats,
  fetchStandings,
  fetchRecentResults,
  fetchPlayers,
  fetchUpcomingFixtures,
} from './services/football'
import type { Fixture, Scope } from './data/types'

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

  // Selected competition / team / season for the live feeds.
  const [scope, setScope] = useLocalStorage<Scope>('football-app.scope', {
    league: apiConfig.league,
    season: apiConfig.season,
    team: apiConfig.team,
  })
  const leagueKey = `${scope.league}-${scope.season}`
  const teamKey = `${scope.team}-${scope.season}`

  // Live feeds — real API data only, no sample fallback. Each refetches when
  // the part of the scope it depends on changes.
  const statsFeed = useLiveData(() => fetchTeamStats(scope), `${scope.league}-${teamKey}`)
  const standingsFeed = useLiveData(() => fetchStandings(scope), leagueKey)
  const resultsFeed = useLiveData(() => fetchRecentResults(scope), leagueKey)
  const playersFeed = useLiveData(() => fetchPlayers(scope), teamKey)
  const fixturesFeed = useLiveData(() => fetchUpcomingFixtures(scope), leagueKey)

  // When the league changes, snap the selected team to one that exists in the
  // new standings so the Players/Stats feeds stay coherent.
  useEffect(() => {
    const teams = standingsFeed.data
    if (teams && teams.length && !teams.some((t) => t.teamId === scope.team)) {
      setScope((s) => ({ ...s, team: teams[0].teamId }))
    }
  }, [standingsFeed.data, scope.team, setScope])

  const feedsLoading =
    statsFeed.loading ||
    standingsFeed.loading ||
    resultsFeed.loading ||
    playersFeed.loading ||
    fixturesFeed.loading

  // Fixtures layer the user's own matches on top of the live feed, minus
  // anything the user removed. Both edits persist to localStorage.
  const [userFixtures, setUserFixtures] = useLocalStorage<Fixture[]>(
    'football-app.userFixtures',
    [],
  )
  const [removedFixtureIds, setRemovedFixtureIds] = useLocalStorage<number[]>(
    'football-app.removedFixtures',
    [],
  )
  const fixtures = [...userFixtures, ...(fixturesFeed.data ?? [])].filter(
    (f) => !removedFixtureIds.includes(f.id),
  )
  const teamNames = (standingsFeed.data ?? []).map((s) => s.team)

  const addMatch = (data: Omit<Fixture, 'id'>) => {
    // Timestamp id keeps user matches from colliding with feed ids.
    setUserFixtures((prev) => [{ id: Date.now(), ...data }, ...prev])
    setShowNewMatch(false)
    setActiveNav('fixtures')
  }

  const removeFixture = (id: number) => {
    setUserFixtures((prev) => prev.filter((f) => f.id !== id))
    setRemovedFixtureIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
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
          (standingsFeed.data ?? []).map((s) => [
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
          (playersFeed.data ?? []).map((p) => [
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
        return (
          <FeedState
            configured={standingsFeed.configured}
            loading={standingsFeed.loading}
            error={standingsFeed.error}
            empty={!standingsFeed.data?.length}
          >
            <LeagueTable standings={standingsFeed.data ?? []} />
          </FeedState>
        )
      case 'analyzer':
        return (
          <MatchAnalyzer
            key={analyzerMatch ? `${analyzerMatch.home}-${analyzerMatch.away}` : 'default'}
            initialHome={analyzerMatch?.home}
            initialAway={analyzerMatch?.away}
            teams={teamNames}
          />
        )
      case 'players':
        return (
          <FeedState
            configured={playersFeed.configured}
            loading={playersFeed.loading}
            error={playersFeed.error}
            empty={!playersFeed.data?.length}
          >
            <PlayersList players={playersFeed.data ?? []} />
          </FeedState>
        )
      case 'stats':
        return (
          <StatsPage
            statsFeed={statsFeed}
            playersFeed={playersFeed}
            resultsFeed={resultsFeed}
          />
        )
      default:
        return (
          <>
            <FeedState
              configured={statsFeed.configured}
              loading={statsFeed.loading}
              error={statsFeed.error}
              empty={!statsFeed.data?.length}
            >
              <div className="stats-grid">
                {(statsFeed.data ?? []).map((stat) => (
                  <StatCard key={stat.label} stat={stat} />
                ))}
              </div>
            </FeedState>

            <div className="content-grid">
              <FixturesList
                fixtures={fixtures}
                onViewAll={() => setActiveNav('fixtures')}
                onAnalyze={analyzeFixture}
              />
              <FeedState
                configured={standingsFeed.configured}
                loading={standingsFeed.loading}
                error={standingsFeed.error}
                empty={!standingsFeed.data?.length}
              >
                <LeagueTable
                  standings={standingsFeed.data ?? []}
                  onViewAll={() => setActiveNav('standings')}
                />
              </FeedState>
            </div>

            <FeedState
              configured={resultsFeed.configured}
              loading={resultsFeed.loading}
              error={resultsFeed.error}
              empty={!resultsFeed.data?.length}
            >
              <RecentMatches
                matches={resultsFeed.data ?? []}
                onViewAll={() => setActiveNav('stats')}
              />
            </FeedState>
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
          onRefresh={() => {
            clearApiCache()
            window.location.reload()
          }}
          configured={isLiveEnabled()}
          loading={feedsLoading}
        />
        <ScopeBar
          scope={scope}
          onChange={setScope}
          teams={standingsFeed.data ?? []}
          teamsLoading={standingsFeed.loading}
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
