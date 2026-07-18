import { describe, it, expect } from 'vitest'
import { escapeCell, toCsv } from './csv'

describe('escapeCell', () => {
  it('leaves plain values untouched', () => {
    expect(escapeCell('Arsenal')).toBe('Arsenal')
    expect(escapeCell(42)).toBe('42')
  })

  it('quotes values containing a comma', () => {
    expect(escapeCell('Real Madrid, CF')).toBe('"Real Madrid, CF"')
  })

  it('escapes embedded quotes by doubling them', () => {
    expect(escapeCell('the "invincibles"')).toBe('"the ""invincibles"""')
  })

  it('quotes values containing a newline', () => {
    expect(escapeCell('a\nb')).toBe('"a\nb"')
  })
})

describe('toCsv', () => {
  it('joins headers and rows with escaping', () => {
    const csv = toCsv(
      ['Team', 'Pts'],
      [
        ['Arsenal', 88],
        ['Aston Villa, FC', 68],
      ],
    )
    expect(csv).toBe('Team,Pts\nArsenal,88\n"Aston Villa, FC",68')
  })
})
