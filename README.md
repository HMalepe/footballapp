# MY-FOOTBALL-APP

A simple football dashboard built with React, TypeScript, and Vite.

## Features

- **Dashboard overview** — key stats at a glance (matches, goals, win rate, players)
- **Match Analyzer** — compare two teams' formations head-to-head on a pitch
  diagram, with unit-strength bars, a balance verdict, and each shape's primary
  structural weakness
- **Fixtures** — scheduled matches; add new ones, jump straight into the
  analyzer, or remove them (changes persist via `localStorage`)
- **Standings** — current league table with points and goal difference
- **Players** — squad roster with a position filter and a per-player detail
  modal
- **Statistics** — KPI cards plus top-scorer / top-assist leaderboards
- **Export** — download the current page's data as a CSV
- **Responsive layout** — works on desktop and mobile

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) in your browser after running `npm run dev`.

## Live Data (optional)

The app ships with sample data and works out of the box. To pull **live**
standings, results, and player stats, add an
[API-Football](https://rapidapi.com/api-sports/api/api-football) key
(free tier available):

```bash
cp .env.example .env.local
# then edit .env.local and set VITE_API_FOOTBALL_KEY
```

Configure which league / team / season the feeds target with
`VITE_API_FOOTBALL_LEAGUE`, `VITE_API_FOOTBALL_TEAM`, and
`VITE_API_FOOTBALL_SEASON` (defaults: Premier League, Arsenal, 2025/26).

How it works:

- **No key** → every feed falls back to bundled sample data; the header shows
  a "Sample data" badge.
- **With a key** → Standings, Players/Stats, and Recent Results load live from
  API-Football; the header shows a "Live data" badge. Any request failure
  falls back to sample data silently.

The data layer lives in `src/services/` (typed client, endpoint mappers) and
`src/hooks/useLiveData.ts` (fetch-with-fallback hook). It's structured so a
second provider — e.g. [football-data.org](https://www.football-data.org/) —
can be slotted in behind the same service functions.

> **Security note:** Vite exposes `VITE_*` variables to the browser bundle,
> which is fine for local/personal use. For a public deployment, proxy the
> API through a backend so the key is never shipped to clients.

## Tech Stack

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)

## Project Structure

```
src/
├── components/     # UI components (Sidebar, MatchAnalyzer, PlayersList, modals, etc.)
├── data/           # Mock data and formation definitions
├── utils/          # CSV export and the localStorage hook
├── App.tsx         # App shell, routing, and shared state
└── index.css       # Global styles
```

## License

MIT
