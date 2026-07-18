export interface Stat {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
}

export interface Fixture {
  id: number
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  competition: string
}

export interface Standing {
  rank: number
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  gd: number
  points: number
}

export interface Match {
  id: number
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  date: string
  competition: string
}

export type PlayerPosition = 'GK' | 'DEF' | 'MID' | 'FWD'

export interface Player {
  id: number
  name: string
  number: number
  position: PlayerPosition
  appearances: number
  goals: number
  assists: number
  rating: number
}

export const stats: Stat[] = [
  { label: 'Matches Played', value: '38', change: '+4 this month', trend: 'up' },
  { label: 'Goals Scored', value: '67', change: '+12 vs last season', trend: 'up' },
  { label: 'Win Rate', value: '58%', change: '+3.2%', trend: 'up' },
  { label: 'Active Players', value: '24', change: '2 injured', trend: 'down' },
]

export const upcomingFixtures: Fixture[] = [
  {
    id: 1,
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    date: 'Jul 12',
    time: '15:00',
    competition: 'Premier League',
  },
  {
    id: 2,
    homeTeam: 'Liverpool',
    awayTeam: 'Man City',
    date: 'Jul 13',
    time: '17:30',
    competition: 'Premier League',
  },
  {
    id: 3,
    homeTeam: 'Barcelona',
    awayTeam: 'Real Madrid',
    date: 'Jul 14',
    time: '20:00',
    competition: 'La Liga',
  },
  {
    id: 4,
    homeTeam: 'Bayern Munich',
    awayTeam: 'Dortmund',
    date: 'Jul 15',
    time: '18:30',
    competition: 'Bundesliga',
  },
]

export const standings: Standing[] = [
  { rank: 1, team: 'Arsenal', played: 38, won: 28, drawn: 5, lost: 5, gd: 62, points: 89 },
  { rank: 2, team: 'Man City', played: 38, won: 27, drawn: 7, lost: 4, gd: 61, points: 88 },
  { rank: 3, team: 'Liverpool', played: 38, won: 24, drawn: 10, lost: 4, gd: 45, points: 82 },
  { rank: 4, team: 'Aston Villa', played: 38, won: 20, drawn: 8, lost: 10, gd: 15, points: 68 },
  { rank: 5, team: 'Tottenham', played: 38, won: 20, drawn: 6, lost: 12, gd: 5, points: 66 },
  { rank: 6, team: 'Chelsea', played: 38, won: 18, drawn: 9, lost: 11, gd: 14, points: 63 },
]

export const recentMatches: Match[] = [
  {
    id: 1,
    homeTeam: 'Arsenal',
    awayTeam: 'Everton',
    homeScore: 2,
    awayScore: 1,
    date: 'Jul 8',
    competition: 'Premier League',
  },
  {
    id: 2,
    homeTeam: 'Man United',
    awayTeam: 'Liverpool',
    homeScore: 0,
    awayScore: 3,
    date: 'Jul 7',
    competition: 'Premier League',
  },
  {
    id: 3,
    homeTeam: 'Real Madrid',
    awayTeam: 'Atletico',
    homeScore: 1,
    awayScore: 1,
    date: 'Jul 6',
    competition: 'La Liga',
  },
  {
    id: 4,
    homeTeam: 'Inter Milan',
    awayTeam: 'AC Milan',
    homeScore: 2,
    awayScore: 0,
    date: 'Jul 5',
    competition: 'Serie A',
  },
]

export const players: Player[] = [
  { id: 1, name: 'David Raya', number: 1, position: 'GK', appearances: 38, goals: 0, assists: 1, rating: 7.1 },
  { id: 2, name: 'William Saliba', number: 2, position: 'DEF', appearances: 37, goals: 3, assists: 1, rating: 7.4 },
  { id: 3, name: 'Gabriel Magalhães', number: 6, position: 'DEF', appearances: 36, goals: 5, assists: 2, rating: 7.3 },
  { id: 4, name: 'Ben White', number: 4, position: 'DEF', appearances: 30, goals: 2, assists: 6, rating: 7.2 },
  { id: 5, name: 'Declan Rice', number: 41, position: 'MID', appearances: 38, goals: 7, assists: 9, rating: 7.8 },
  { id: 6, name: 'Martin Ødegaard', number: 8, position: 'MID', appearances: 35, goals: 11, assists: 10, rating: 7.9 },
  { id: 7, name: 'Kai Havertz', number: 29, position: 'MID', appearances: 37, goals: 13, assists: 7, rating: 7.5 },
  { id: 8, name: 'Bukayo Saka', number: 7, position: 'FWD', appearances: 34, goals: 16, assists: 13, rating: 8.1 },
  { id: 9, name: 'Gabriel Martinelli', number: 11, position: 'FWD', appearances: 33, goals: 10, assists: 5, rating: 7.4 },
  { id: 10, name: 'Leandro Trossard', number: 19, position: 'FWD', appearances: 36, goals: 12, assists: 8, rating: 7.6 },
  { id: 11, name: 'Gabriel Jesus', number: 9, position: 'FWD', appearances: 24, goals: 8, assists: 6, rating: 7.0 },
]

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '⚽' },
  { id: 'fixtures', label: 'Fixtures', icon: '📅' },
  { id: 'standings', label: 'Standings', icon: '🏆' },
  { id: 'analyzer', label: 'Match Analyzer', icon: '🧠' },
  { id: 'players', label: 'Players', icon: '👤' },
  { id: 'stats', label: 'Stats', icon: '📊' },
]
