import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cached, clearApiCache } from './cache'

beforeEach(() => {
  clearApiCache()
  localStorage.clear()
})

describe('cached', () => {
  it('calls the loader once for repeated hits on the same key', async () => {
    const loader = vi.fn().mockResolvedValue('value')
    const a = await cached('k1', 1000, loader)
    const b = await cached('k1', 1000, loader)
    expect(a).toBe('value')
    expect(b).toBe('value')
    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('dedupes concurrent identical requests into one loader call', async () => {
    let resolve!: (v: string) => void
    const pending = new Promise<string>((r) => {
      resolve = r
    })
    const loader = vi.fn(() => pending)

    const p1 = cached('k2', 1000, loader)
    const p2 = cached('k2', 1000, loader)
    resolve('shared')

    expect(await p1).toBe('shared')
    expect(await p2).toBe('shared')
    expect(loader).toHaveBeenCalledTimes(1)
  })

  it('does not cache a rejected loader', async () => {
    const loader = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce('recovered')

    await expect(cached('k3', 1000, loader)).rejects.toThrow('boom')
    expect(await cached('k3', 1000, loader)).toBe('recovered')
    expect(loader).toHaveBeenCalledTimes(2)
  })

  describe('with fake timers', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('refetches once the TTL has expired', async () => {
      const loader = vi.fn().mockResolvedValue('v')
      await cached('k4', 1000, loader)
      vi.setSystemTime(Date.now() + 2000)
      await cached('k4', 1000, loader)
      expect(loader).toHaveBeenCalledTimes(2)
    })
  })
})
