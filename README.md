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

## Live Data (required for real content)

All data is pulled live from
[API-Football](https://rapidapi.com/api-sports/api/api-football) — there is no
bundled sample data. Add a key (free tier available) to see real content:

```bash
cp .env.example .env.local
# then edit .env.local and set VITE_API_FOOTBALL_KEY
```

Configure which league / team / season the feeds target with
`VITE_API_FOOTBALL_LEAGUE`, `VITE_API_FOOTBALL_TEAM`, and
`VITE_API_FOOTBALL_SEASON` (defaults: Premier League, Arsenal, 2025/26).

How it works:

- **No key** → data views show a "connect a key" placeholder and the header
  shows a "No API key" badge. Nothing fabricated is ever displayed.
- **With a key** → the Dashboard KPIs, Standings, Players/Stats, Recent Results
  and upcoming Fixtures load live; the header shows a "Live data" badge. A
  failed request shows an inline error state rather than fake data.

Responses are cached (in memory + `localStorage`, default 15 min — tune with
`VITE_API_FOOTBALL_CACHE_MINUTES`) and concurrent identical requests are
deduped, so reloads and navigation don't burn through the free-tier quota. The
header's ↻ button clears the cache and refetches.

The Match Analyzer is a formation tool and works without a key; a key just
populates its team-name suggestions from the live standings. Fixtures you add
yourself are stored locally and layer on top of the live feed.

The data layer lives in `src/services/` (typed client, endpoint mappers) and
`src/hooks/useLiveData.ts` (fetch hook with loading/error/empty states). It's
structured so a second provider — e.g.
[football-data.org](https://www.football-data.org/) — can be slotted in behind
the same service functions.

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
├── data/           # Domain types, nav config, and formation definitions
├── services/       # API-Football client, response types, and mappers
├── hooks/          # useLiveData (fetch + loading/error/empty state) and others
├── utils/          # CSV export and the localStorage hook
├── App.tsx         # App shell, routing, and shared state
└── index.css       # Global styles
```

## License

MIT
