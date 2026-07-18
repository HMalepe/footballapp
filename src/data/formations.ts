// ──────────────────────────────────────────────────────────────────
// Formation data for the Match Analyzer.
//
// Each formation is described as rows, GK first → attackers last.
//  - `rows`  : Y fraction of each player on the pitch (0 = top, 1 = bottom)
//  - `roles` : matching role label for each player in that row
//  - `depth` : X depth fraction of each row from the team's own goal-line
//              (0 = on the goal-line, ~0.5 = around the halfway line)
//
// `strength` grades the shape's balance (0-10) for the comparison bars,
// and `weakness` captures the primary zone an opponent can exploit.
// ──────────────────────────────────────────────────────────────────

export type Role =
  | 'GK'
  | 'RB' | 'CB' | 'LB' | 'RWB' | 'LWB'
  | 'DM' | 'CM' | 'RM' | 'LM' | 'CAM' | 'AM' | 'SS'
  | 'RW' | 'LW' | 'ST'

export interface FormationStrength {
  def: number
  mid: number
  atk: number
}

export interface FormationWeakness {
  label: string
  detail: string
}

export interface Formation {
  key: string
  rows: number[][]
  roles: Role[][]
  depth: number[]
  strength: FormationStrength
  weakness: FormationWeakness
}

// Raw shape data — rows/roles ported from the analyzer's FM_DATA,
// depth ported from FM_BASE_X (defensive base shape).
const FORMATIONS: Formation[] = [
  // ── 4-back ────────────────────────────────────────────────────────
  {
    key: '4-3-3',
    rows: [[0.5], [0.15, 0.38, 0.62, 0.85], [0.25, 0.5, 0.75], [0.2, 0.5, 0.8]],
    roles: [['GK'], ['RB', 'CB', 'CB', 'LB'], ['CM', 'CM', 'CM'], ['RW', 'ST', 'LW']],
    depth: [0.05, 0.18, 0.38, 0.52],
    strength: { def: 7, mid: 7, atk: 9 },
    weakness: {
      label: 'Space between the lines',
      detail: 'A flat back four leaves the half-spaces behind the wide midfielders open for runners.',
    },
  },
  {
    key: '4-2-3-1',
    rows: [[0.5], [0.15, 0.38, 0.62, 0.85], [0.3, 0.7], [0.2, 0.5, 0.8], [0.5]],
    roles: [['GK'], ['RB', 'CB', 'CB', 'LB'], ['DM', 'DM'], ['RM', 'CAM', 'LM'], ['ST']],
    depth: [0.05, 0.18, 0.32, 0.44, 0.56],
    strength: { def: 7, mid: 9, atk: 7 },
    weakness: {
      label: 'Wide channels',
      detail: 'The double pivot sits central, so full-backs get isolated one-on-one out wide.',
    },
  },
  {
    key: '4-4-2',
    rows: [[0.5], [0.15, 0.38, 0.62, 0.85], [0.15, 0.38, 0.62, 0.85], [0.3, 0.7]],
    roles: [['GK'], ['RB', 'CB', 'CB', 'LB'], ['RM', 'CM', 'CM', 'LM'], ['ST', 'ST']],
    depth: [0.05, 0.18, 0.36, 0.52],
    strength: { def: 7, mid: 7, atk: 7 },
    weakness: {
      label: 'The vacant No.10 space',
      detail: 'With no attacking midfielder, the flat midfield struggles to track runners into the pocket.',
    },
  },
  {
    key: '4-1-4-1',
    rows: [[0.5], [0.15, 0.38, 0.62, 0.85], [0.5], [0.15, 0.38, 0.62, 0.85], [0.5]],
    roles: [['GK'], ['RB', 'CB', 'CB', 'LB'], ['DM'], ['RM', 'CM', 'CM', 'LM'], ['ST']],
    depth: [0.05, 0.18, 0.3, 0.44, 0.56],
    strength: { def: 8, mid: 8, atk: 5 },
    weakness: {
      label: 'Behind the single pivot',
      detail: 'Runners in behind the lone DM can converge on the two centre-backs before cover arrives.',
    },
  },
  {
    key: '4-1-2-3',
    rows: [[0.5], [0.15, 0.38, 0.62, 0.85], [0.5], [0.3, 0.7], [0.2, 0.5, 0.8]],
    roles: [['GK'], ['RB', 'CB', 'CB', 'LB'], ['DM'], ['CM', 'CM'], ['RW', 'ST', 'LW']],
    depth: [0.05, 0.18, 0.3, 0.44, 0.56],
    strength: { def: 7, mid: 6, atk: 9 },
    weakness: {
      label: 'Narrow midfield',
      detail: 'No natural wide midfielder means wingers can run free down the open channels.',
    },
  },
  {
    key: '4-2-2-2',
    rows: [[0.5], [0.15, 0.38, 0.62, 0.85], [0.3, 0.7], [0.3, 0.7], [0.3, 0.7]],
    roles: [['GK'], ['RB', 'CB', 'CB', 'LB'], ['DM', 'DM'], ['AM', 'AM'], ['ST', 'ST']],
    depth: [0.05, 0.18, 0.3, 0.44, 0.56],
    strength: { def: 7, mid: 7, atk: 8 },
    weakness: {
      label: 'No midfield width',
      detail: 'Diagonal runs between the pivot and the two attacking midfielders arrive unmarked.',
    },
  },
  {
    key: '4-3-2-1',
    rows: [[0.5], [0.15, 0.38, 0.62, 0.85], [0.25, 0.5, 0.75], [0.3, 0.7], [0.5]],
    roles: [['GK'], ['RB', 'CB', 'CB', 'LB'], ['CM', 'CM', 'CM'], ['SS', 'SS'], ['ST']],
    depth: [0.05, 0.18, 0.32, 0.46, 0.58],
    strength: { def: 7, mid: 8, atk: 7 },
    weakness: {
      label: 'No wide cover',
      detail: 'The "Christmas tree" has no wide player above the full-back — overload the flanks 2v1.',
    },
  },
  {
    key: '4-5-1',
    rows: [[0.5], [0.15, 0.38, 0.62, 0.85], [0.1, 0.3, 0.5, 0.7, 0.9], [0.5]],
    roles: [['GK'], ['RB', 'CB', 'CB', 'LB'], ['RM', 'CM', 'CM', 'CM', 'LM'], ['ST']],
    depth: [0.05, 0.18, 0.36, 0.52],
    strength: { def: 7, mid: 10, atk: 4 },
    weakness: {
      label: 'Isolated lone striker',
      detail: 'The packed midfield defends deep, but transitions leave the single forward with no support.',
    },
  },
  {
    key: '4-2-4',
    rows: [[0.5], [0.15, 0.38, 0.62, 0.85], [0.3, 0.7], [0.1, 0.37, 0.63, 0.9]],
    roles: [['GK'], ['RB', 'CB', 'CB', 'LB'], ['DM', 'DM'], ['RW', 'ST', 'ST', 'LW']],
    depth: [0.05, 0.18, 0.34, 0.52],
    strength: { def: 5, mid: 6, atk: 10 },
    weakness: {
      label: 'Exposed on the counter',
      detail: 'Two midfielders cannot screen the whole pitch — pace in behind punishes the back four.',
    },
  },
  // ── 3-back ────────────────────────────────────────────────────────
  {
    key: '3-4-3',
    rows: [[0.5], [0.25, 0.5, 0.75], [0.15, 0.38, 0.62, 0.85], [0.2, 0.5, 0.8]],
    roles: [['GK'], ['CB', 'CB', 'CB'], ['RWB', 'CM', 'CM', 'LWB'], ['RW', 'ST', 'LW']],
    depth: [0.05, 0.18, 0.36, 0.52],
    strength: { def: 6, mid: 7, atk: 9 },
    weakness: {
      label: 'Behind the wing-backs',
      detail: 'When wing-backs push high, pace into the space they vacate is devastating on the turnover.',
    },
  },
  {
    key: '3-5-2',
    rows: [[0.5], [0.25, 0.5, 0.75], [0.1, 0.3, 0.5, 0.7, 0.9], [0.3, 0.7]],
    roles: [['GK'], ['CB', 'CB', 'CB'], ['RWB', 'CM', 'CM', 'CM', 'LWB'], ['ST', 'ST']],
    depth: [0.05, 0.18, 0.36, 0.52],
    strength: { def: 6, mid: 9, atk: 7 },
    weakness: {
      label: 'Wide dead zones',
      detail: 'With no natural winger, a wide overload forces the wing-back to cover enormous ground.',
    },
  },
  {
    key: '3-4-1-2',
    rows: [[0.5], [0.25, 0.5, 0.75], [0.15, 0.38, 0.62, 0.85], [0.5], [0.3, 0.7]],
    roles: [['GK'], ['CB', 'CB', 'CB'], ['RWB', 'CM', 'CM', 'LWB'], ['CAM'], ['ST', 'ST']],
    depth: [0.05, 0.18, 0.34, 0.48, 0.58],
    strength: { def: 6, mid: 8, atk: 8 },
    weakness: {
      label: 'Behind the wing-backs',
      detail: 'Wing-backs caught high leave both flanks open for the counter-attack.',
    },
  },
  {
    key: '3-4-2-1',
    rows: [[0.5], [0.25, 0.5, 0.75], [0.15, 0.38, 0.62, 0.85], [0.3, 0.7], [0.5]],
    roles: [['GK'], ['CB', 'CB', 'CB'], ['RWB', 'CM', 'CM', 'LWB'], ['SS', 'SS'], ['ST']],
    depth: [0.05, 0.18, 0.34, 0.48, 0.58],
    strength: { def: 6, mid: 8, atk: 8 },
    weakness: {
      label: 'Stretched midfield',
      detail: 'A diagonal ball between the midfield line and the two shadow strikers splits the shape.',
    },
  },
  {
    key: '3-1-4-2',
    rows: [[0.5], [0.25, 0.5, 0.75], [0.5], [0.15, 0.38, 0.62, 0.85], [0.3, 0.7]],
    roles: [['GK'], ['CB', 'CB', 'CB'], ['DM'], ['RWB', 'CM', 'CM', 'LWB'], ['ST', 'ST']],
    depth: [0.05, 0.18, 0.3, 0.44, 0.56],
    strength: { def: 6, mid: 8, atk: 8 },
    weakness: {
      label: 'Behind the single pivot',
      detail: 'One DM cannot screen both central-midfield lanes — runners slip in behind.',
    },
  },
  {
    key: '3-3-3-1',
    rows: [[0.5], [0.25, 0.5, 0.75], [0.25, 0.5, 0.75], [0.25, 0.5, 0.75], [0.5]],
    roles: [['GK'], ['CB', 'CB', 'CB'], ['CM', 'CM', 'CM'], ['RW', 'AM', 'LW'], ['ST']],
    depth: [0.05, 0.18, 0.32, 0.46, 0.58],
    strength: { def: 5, mid: 8, atk: 8 },
    weakness: {
      label: 'Open flanks',
      detail: 'No wing-backs means a centre-back gets dragged wide to cover the channel.',
    },
  },
  // ── 5-back ────────────────────────────────────────────────────────
  {
    key: '5-3-2',
    rows: [[0.5], [0.1, 0.28, 0.5, 0.72, 0.9], [0.25, 0.5, 0.75], [0.3, 0.7]],
    roles: [['GK'], ['RWB', 'CB', 'CB', 'CB', 'LWB'], ['CM', 'CM', 'CM'], ['ST', 'ST']],
    depth: [0.05, 0.16, 0.34, 0.5],
    strength: { def: 10, mid: 7, atk: 5 },
    weakness: {
      label: 'Only three in midfield',
      detail: 'Diagonal runners between the midfield three and the back five can create a 2v2 in the box.',
    },
  },
  {
    key: '5-4-1',
    rows: [[0.5], [0.1, 0.28, 0.5, 0.72, 0.9], [0.15, 0.38, 0.62, 0.85], [0.5]],
    roles: [['GK'], ['RWB', 'CB', 'CB', 'CB', 'LWB'], ['RM', 'CM', 'CM', 'LM'], ['ST']],
    depth: [0.05, 0.16, 0.34, 0.5],
    strength: { def: 10, mid: 8, atk: 3 },
    weakness: {
      label: 'Compact but passive',
      detail: 'The block sits deep — press high and force the mistake before the five-back locks in.',
    },
  },
  {
    key: '5-2-3',
    rows: [[0.5], [0.1, 0.28, 0.5, 0.72, 0.9], [0.3, 0.7], [0.2, 0.5, 0.8]],
    roles: [['GK'], ['RWB', 'CB', 'CB', 'CB', 'LWB'], ['CM', 'CM'], ['RW', 'ST', 'LW']],
    depth: [0.05, 0.16, 0.34, 0.5],
    strength: { def: 9, mid: 5, atk: 8 },
    weakness: {
      label: 'Two-man midfield gap',
      detail: 'Only two central midfielders — runners between them and the back five are hard to track.',
    },
  },
]

export const FORMATION_MAP: Record<string, Formation> = Object.fromEntries(
  FORMATIONS.map((f) => [f.key, f]),
)

export const FORMATION_KEYS: string[] = FORMATIONS.map((f) => f.key)

export function getFormation(key: string): Formation {
  return FORMATION_MAP[key] ?? FORMATION_MAP['4-3-3']
}
