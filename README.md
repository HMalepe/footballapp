# MY-FOOTBALL-APP

A simple football dashboard built with React, TypeScript, and Vite.

## Features

- **Dashboard overview** — key stats at a glance (matches, goals, win rate, players)
- **Match Analyzer** — compare two teams' formations head-to-head on a pitch
  diagram, with unit-strength bars, a balance verdict, and each shape's primary
  structural weakness. With a key it also shows live **match context** for the
  selected teams: recent form (W/D/L), head-to-head history, and home/away
  season records
- **Deeper Context report** (in the Analyzer) — motivation/stakes from live
  data, plus an optional AI layer (reported injuries, human intelligence,
  sentiment, and a 1–10 **Trap Score**) researched live off the web by Claude.
  This is educational context only — never a bet or a prediction — with a
  responsible-gambling disclaimer
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

# Run the test suite
npm test
```

Open [http://localhost:5173](http://localhost:5173) in your browser after running `npm run dev`.

## Live Data (required for real content)

All data is pulled live from [API-Football](https://www.api-football.com) —
there is no bundled sample data. Add a key (free tier available) to see real
content:

```bash
cp .env.example .env.local
# then edit .env.local and set VITE_API_FOOTBALL_KEY
```

Get a key either way (same data, same endpoints):

- **Direct** — sign up at [api-football.com](https://www.api-football.com),
  the key is on your dashboard. Set `VITE_API_FOOTBALL_PROVIDER=direct`.
- **RapidAPI** — subscribe at
  [rapidapi.com/api-sports/api/api-football](https://rapidapi.com/api-sports/api/api-football).
  Leave `VITE_API_FOOTBALL_PROVIDER` unset (this is the default).

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

### Deeper Context (Claude API — optional)

The Analyzer's "Deeper Context" panel derives motivation/stakes from live
API-Football data (league position). It can also generate **reported
injuries** (Layer 2), the qualitative **human-intelligence** (Layer 3) and
**sentiment** (Layer 4) layers, plus a 1–10 **Trap Score** using Claude — add
a key from [console.anthropic.com](https://console.anthropic.com) as
`VITE_ANTHROPIC_KEY` (model configurable via `VITE_ANTHROPIC_MODEL`, default
`claude-opus-4-8`).

Those layers are **grounded in live web search**: Claude runs the web-search
tool to pull confirmed injuries/suspensions, current team news, morale,
manager pressure, contract sagas, and fan/media sentiment for the specific
fixture, then cites its **sources** in the report (rather than relying on
stale training knowledge or a data feed's injuries endpoint — API-Football's
free plan doesn't reliably cover every league, so this is more current and
provider-independent). Because it uses web search, the configured model must
support it (Opus 4.6+ / Sonnet 4.6+ — the `claude-opus-4-8` default does).

The panel also shows a **market odds** block (Layer 4) — the 1X2 prices for the
fixture from API-Football, with de-vigged implied probabilities and price
**movement since you last viewed it** (a local snapshot per fixture). Those
numbers are also fed into the AI report so its analysis is grounded in the
actual market, not guesswork. Odds use the same API-Football key — no extra
provider needed.

This layer is **context/education only**: it never names a bet, never claims to
know the result, and the Trap Score measures how much hidden context a casual
read is likely missing — not a prediction or confidence level. A
responsible-gambling disclaimer is shown alongside it. The same client-key
caveat applies — for a public deploy, proxy the Claude call through a backend so
the key isn't shipped to the browser.

The data layer lives in `src/services/` (typed client, endpoint mappers) and
`src/hooks/useLiveData.ts` (fetch hook with loading/error/empty states). It's
structured so a second provider — e.g.
[football-data.org](https://www.football-data.org/) — can be slotted in behind
the same service functions.

> **Security note:** Vite exposes `VITE_*` variables to the browser bundle,
> which is fine for local/personal use. For a public deployment, proxy the
> API through a backend so the key is never shipped to clients.

## Deployment

The app is a static SPA — build with `npm run build` and serve the `dist/`
folder from any static host. Config for the two common ones is included:

- **Netlify** — `netlify.toml` sets the build command, publish dir, and SPA
  redirect. Connect the repo and deploy.
- **Vercel** — `vercel.json` does the same. Import the repo and deploy.

For live data, set `VITE_API_FOOTBALL_KEY` (and optionally
`VITE_API_FOOTBALL_LEAGUE` / `TEAM` / `SEASON` / `CACHE_MINUTES`) as an
environment variable in the host's dashboard, then redeploy. Without it the
deployed app shows the "connect a key" states.

> **Heads-up:** `VITE_*` vars are baked into the client bundle at build time,
> so a key set this way is visible to anyone who loads the site. For a public
> deployment, front the API with a small backend/serverless proxy that holds
> the key server-side instead.

## Tech Stack

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Vitest](https://vitest.dev/) for unit tests
- [API-Football](https://www.api-football.com/) for live data

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
