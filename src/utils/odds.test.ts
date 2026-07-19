import { describe, it, expect } from 'vitest'
import { impliedProbabilities, priceDirection, oddsMovement } from './odds'

describe('impliedProbabilities', () => {
  it('de-vigs odds into probabilities that sum to ~100', () => {
    const p = impliedProbabilities({ home: 1.8, draw: 3.6, away: 4.5 })
    expect(p.home + p.draw + p.away).toBeGreaterThanOrEqual(99)
    expect(p.home + p.draw + p.away).toBeLessThanOrEqual(101)
    // Shortest price is the most probable.
    expect(p.home).toBeGreaterThan(p.draw)
    expect(p.draw).toBeGreaterThan(p.away)
  })

  it('gives an even split for equal odds', () => {
    const p = impliedProbabilities({ home: 3, draw: 3, away: 3 })
    expect(p).toEqual({ home: 33, draw: 33, away: 33 })
  })
})

describe('priceDirection', () => {
  it('reads a falling price as shortened (backed)', () => {
    expect(priceDirection(2.0, 1.8)).toBe('shortened')
  })
  it('reads a rising price as lengthened (drifting)', () => {
    expect(priceDirection(2.0, 2.4)).toBe('lengthened')
  })
  it('treats tiny changes as unchanged', () => {
    expect(priceDirection(2.0, 2.005)).toBe('same')
  })
})

describe('oddsMovement', () => {
  it('flags whether any price moved', () => {
    const still = oddsMovement(
      { home: 2, draw: 3, away: 4 },
      { home: 2, draw: 3, away: 4 },
    )
    expect(still.changed).toBe(false)

    const moved = oddsMovement(
      { home: 2, draw: 3, away: 4 },
      { home: 1.7, draw: 3.2, away: 4 },
    )
    expect(moved.changed).toBe(true)
    expect(moved.home).toBe('shortened')
    expect(moved.draw).toBe('lengthened')
    expect(moved.away).toBe('same')
  })
})
