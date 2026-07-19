import type { Odds } from '../data/types'

export interface ImpliedProbs {
  home: number
  draw: number
  away: number
}

// Convert decimal odds to de-vigged implied probabilities (percent, summing
// to ~100). The raw 1/odds figures include the bookmaker's overround, so we
// normalise them back to a true probability distribution.
export function impliedProbabilities(o: Odds): ImpliedProbs {
  const raw = [1 / o.home, 1 / o.draw, 1 / o.away]
  const sum = raw[0] + raw[1] + raw[2] || 1
  return {
    home: Math.round((raw[0] / sum) * 100),
    draw: Math.round((raw[1] / sum) * 100),
    away: Math.round((raw[2] / sum) * 100),
  }
}

export type Direction = 'shortened' | 'lengthened' | 'same'

// Direction of a single price. Decimal odds falling = shorter price = the
// market thinks it's more likely (money came in); rising = drifting.
export function priceDirection(prev: number, curr: number): Direction {
  const delta = curr - prev
  if (Math.abs(delta) < 0.01) return 'same'
  return delta < 0 ? 'shortened' : 'lengthened'
}

export interface OddsMovement {
  home: Direction
  draw: Direction
  away: Direction
  changed: boolean
}

export function oddsMovement(prev: Odds, curr: Odds): OddsMovement {
  const home = priceDirection(prev.home, curr.home)
  const draw = priceDirection(prev.draw, curr.draw)
  const away = priceDirection(prev.away, curr.away)
  return {
    home,
    draw,
    away,
    changed: [home, draw, away].some((d) => d !== 'same'),
  }
}
