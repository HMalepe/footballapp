import { describe, it, expect } from 'vitest'
import { FORMATION_KEYS, FORMATION_MAP, getFormation } from './formations'

describe('formation data', () => {
  it('has at least the ten prompt-allowed formations', () => {
    expect(FORMATION_KEYS.length).toBeGreaterThanOrEqual(10)
  })

  it('every formation fields 11 players with aligned roles and depth', () => {
    FORMATION_KEYS.forEach((key) => {
      const f = FORMATION_MAP[key]
      const count = f.rows.reduce((n, row) => n + row.length, 0)
      expect(count, `${key} player count`).toBe(11)
      expect(f.depth.length, `${key} depth rows`).toBe(f.rows.length)
      f.rows.forEach((row, i) => {
        expect(f.roles[i].length, `${key} row ${i} roles`).toBe(row.length)
      })
    })
  })

  it('every formation carries a strength profile and a weakness', () => {
    FORMATION_KEYS.forEach((key) => {
      const f = FORMATION_MAP[key]
      expect(f.strength.def).toBeGreaterThan(0)
      expect(f.weakness.label.length).toBeGreaterThan(0)
      expect(f.weakness.detail.length).toBeGreaterThan(0)
    })
  })
})

describe('getFormation', () => {
  it('returns the requested formation when it exists', () => {
    expect(getFormation('3-5-2').key).toBe('3-5-2')
  })

  it('falls back to 4-3-3 for an unknown key', () => {
    expect(getFormation('9-9-9').key).toBe('4-3-3')
  })
})
