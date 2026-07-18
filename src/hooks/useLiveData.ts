import { useEffect, useState } from 'react'
import { isLiveEnabled } from '../services/config'

export interface LiveData<T> {
  data: T
  loading: boolean
  error: string | null
  // true once live API data has successfully loaded; false while on fallback.
  isLive: boolean
}

// Runs `fetcher` when a live API key is configured, otherwise stays on
// `fallback`. The fallback is always returned as `data`, so consumers never
// have to handle an empty/undefined state — the UI works with or without a key.
export function useLiveData<T>(
  fetcher: () => Promise<T>,
  fallback: T,
): LiveData<T> {
  const [state, setState] = useState<LiveData<T>>({
    data: fallback,
    loading: isLiveEnabled(),
    error: null,
    isLive: false,
  })

  useEffect(() => {
    if (!isLiveEnabled()) return

    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))

    fetcher()
      .then((data) => {
        if (cancelled) return
        // Guard against an empty live payload wiping out the UI.
        const usable = Array.isArray(data) ? data.length > 0 : data != null
        setState({
          data: usable ? data : fallback,
          loading: false,
          error: null,
          isLive: usable,
        })
      })
      .catch((e: Error) => {
        if (cancelled) return
        setState({ data: fallback, loading: false, error: e.message, isLive: false })
      })

    return () => {
      cancelled = true
    }
    // fetcher is expected to be a stable module-level function.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}
