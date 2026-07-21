import type { Stakes } from '../data/types'

// Layer 2 — derive what's at stake for a team from its league position.
// Pure heuristic based on rank within the table (no external data).
export function computeStakes(rank: number, totalTeams: number): Stakes {
  if (rank <= 0 || totalTeams <= 0) {
    return { label: 'Unknown', note: 'Not enough table data to judge stakes.' }
  }
  if (rank <= 2) {
    return { label: 'Title race', note: 'Fighting at the top — every point is decisive.' }
  }
  if (rank <= 4) {
    return {
      label: 'Champions League places',
      note: 'Chasing a top-four finish and UCL qualification.',
    }
  }
  if (rank <= 7) {
    return {
      label: 'European places',
      note: 'In the hunt for continental qualification.',
    }
  }
  if (rank >= totalTeams - 2) {
    return {
      label: 'Relegation battle',
      note: 'Fighting to avoid the drop — maximum urgency.',
    }
  }
  return {
    label: 'Mid-table',
    note: 'Little league significance — motivation can dip, especially late season.',
  }
}

// A one-line read on how lopsided the two teams' stakes are.
export function stakesAsymmetry(home: Stakes, away: Stakes): string {
  if (home.label === away.label) {
    return `Both sides carry similar stakes (${home.label.toLowerCase()}) — motivation looks balanced.`
  }
  return `Asymmetric stakes: ${home.label} vs ${away.label} — the side with more to play for often has the edge in intensity.`
}
