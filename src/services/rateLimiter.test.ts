import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('throttle', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('lets a burst up to capacity through immediately', async () => {
    const { throttle } = await import('./rateLimiter')
    const results = await Promise.all(
      Array.from({ length: 9 }, () => throttle()),
    )
    expect(results).toHaveLength(9)
  })

  it('queues requests beyond capacity until the next refill', async () => {
    const { throttle } = await import('./rateLimiter')
    for (let i = 0; i < 9; i++) await throttle()

    let resolved = false
    throttle().then(() => {
      resolved = true
    })

    await vi.advanceTimersByTimeAsync(1000)
    expect(resolved).toBe(false)

    await vi.advanceTimersByTimeAsync(6000)
    expect(resolved).toBe(true)
  })
})
