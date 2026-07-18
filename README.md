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
