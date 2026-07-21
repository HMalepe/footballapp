import { describe, it, expect } from 'vitest'
import { computeStakes, stakesAsymmetry } from './motivation'

describe('computeStakes', () => {
  it('classifies the top of the table as a title race', () => {
    expect(computeStakes(1, 20).label).toBe('Title race')
    expect(computeStakes(2, 20).label).toBe('Title race')
  })

  it('classifies top-four as Champions League places', () => {
    expect(computeStakes(4, 20).label).toBe('Champions League places')
  })

  it('classifies the bottom of the table as a relegation battle', () => {
    expect(computeStakes(18, 20).label).toBe('Relegation battle')
    expect(computeStakes(20, 20).label).toBe('Relegation battle')
  })

  it('classifies the middle as mid-table', () => {
    expect(computeStakes(11, 20).label).toBe('Mid-table')
  })

  it('handles missing data', () => {
    expect(computeStakes(0, 0).label).toBe('Unknown')
  })
})

describe('stakesAsymmetry', () => {
  it('flags matched stakes as balanced', () => {
    const s = computeStakes(1, 20)
    expect(stakesAsymmetry(s, s)).toMatch(/balanced/)
  })

  it('flags mismatched stakes as asymmetric', () => {
    const top = computeStakes(1, 20)
    const bottom = computeStakes(20, 20)
    expect(stakesAsymmetry(top, bottom)).toMatch(/Asymmetric/)
  })
})
