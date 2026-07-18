import { getFormation } from '../data/formations'

interface FormationPitchProps {
  homeFormation: string
  awayFormation: string
  homeTeam: string
  awayTeam: string
}

// Pitch coordinate space (matches a ~105x68 pitch ratio).
const W = 105
const H = 68
// Keep each formation inside its own half — the deepest line reaches ~0.48
// of the pitch so the two attacks meet at the halfway line without colliding.
const DEPTH_SCALE = 0.88

interface PlacedPlayer {
  x: number
  y: number
  role: string
}

// Lay a formation out on one side of the pitch.
// `side` = 'home' places players from the left goal-line rightwards;
// `side` = 'away' mirrors them from the right goal-line leftwards.
function placeFormation(key: string, side: 'home' | 'away'): PlacedPlayer[] {
  const f = getFormation(key)
  const players: PlacedPlayer[] = []
  f.rows.forEach((row, r) => {
    const depth = f.depth[r] * DEPTH_SCALE
    row.forEach((yFrac, i) => {
      const x = side === 'home' ? depth * W : W - depth * W
      const y = yFrac * H
      players.push({ x, y, role: f.roles[r][i] })
    })
  })
  return players
}

export function FormationPitch({
  homeFormation,
  awayFormation,
  homeTeam,
  awayTeam,
}: FormationPitchProps) {
  const home = placeFormation(homeFormation, 'home')
  const away = placeFormation(awayFormation, 'away')

  return (
    <div className="pitch-wrap">
      <svg
        className="pitch-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${homeTeam} ${homeFormation} versus ${awayTeam} ${awayFormation}`}
      >
        {/* Turf */}
        <rect x="0" y="0" width={W} height={H} className="pitch-turf" />
        {/* Mow stripes */}
        {Array.from({ length: 7 }, (_, i) => (
          <rect
            key={i}
            x={(W / 7) * i}
            y="0"
            width={W / 7}
            height={H}
            className={i % 2 === 0 ? 'pitch-stripe-a' : 'pitch-stripe-b'}
          />
        ))}

        {/* Markings */}
        <g className="pitch-lines">
          <rect x="1" y="1" width={W - 2} height={H - 2} rx="0.5" />
          <line x1={W / 2} y1="1" x2={W / 2} y2={H - 1} />
          <circle cx={W / 2} cy={H / 2} r="9" />
          <circle cx={W / 2} cy={H / 2} r="0.6" className="pitch-dot" />
          {/* Left box */}
          <rect x="1" y={H / 2 - 12} width="14" height="24" />
          <rect x="1" y={H / 2 - 5.5} width="5" height="11" />
          {/* Right box */}
          <rect x={W - 15} y={H / 2 - 12} width="14" height="24" />
          <rect x={W - 6} y={H / 2 - 5.5} width="5" height="11" />
        </g>

        {/* Away players (render first so home sits on top near halfway) */}
        {away.map((p, i) => (
          <g key={`a-${i}`} className="player player-away">
            <circle cx={p.x} cy={p.y} r="2.9" />
            <text x={p.x} y={p.y + 0.9} className="player-label">
              {p.role}
            </text>
          </g>
        ))}

        {/* Home players */}
        {home.map((p, i) => (
          <g key={`h-${i}`} className="player player-home">
            <circle cx={p.x} cy={p.y} r="2.9" />
            <text x={p.x} y={p.y + 0.9} className="player-label">
              {p.role}
            </text>
          </g>
        ))}
      </svg>

      <div className="pitch-legend">
        <span className="legend-item">
          <span className="legend-dot legend-home" />
          {homeTeam} · {homeFormation}
        </span>
        <span className="legend-item">
          <span className="legend-dot legend-away" />
          {awayTeam} · {awayFormation}
        </span>
      </div>
    </div>
  )
}
