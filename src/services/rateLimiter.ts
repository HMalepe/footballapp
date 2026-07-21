// Token-bucket limiter shared by every API-Football request, so a page
// load or scope switch that fires several fetches at once can't burst
// past the free plan's "10 requests per minute" cap. A small margin
// below that (9 tokens, refilling one every 6.5s) absorbs clock drift.
const CAPACITY = 9
const REFILL_MS = 6_500

let tokens = CAPACITY
const queue: (() => void)[] = []

setInterval(() => {
  if (tokens < CAPACITY) tokens++
  if (tokens > 0 && queue.length > 0) {
    tokens--
    queue.shift()!()
  }
}, REFILL_MS)

// Resolves immediately if a token is free; otherwise queues until the
// next refill grants one, in FIFO order.
export function throttle(): Promise<void> {
  if (tokens > 0) {
    tokens--
    return Promise.resolve()
  }
  return new Promise((resolve) => queue.push(resolve))
}
