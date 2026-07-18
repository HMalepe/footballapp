import { useEffect, useState } from 'react'
import { isLiveEnabled } from '../services/config'

export interface Feed<T> {
  data: T | null
  loading: boolean
  error: string | null
  // false when no API key is configured — the UI shows a "connect a key" state.
  configured: boolean
}

// Fetches live data from the API. There is no sample-data fallback: until a
// key is set and a request succeeds, `data` is null and the UI renders the
// appropriate loading / not-configured / error / empty placeholder.
//
// `depsKey` re-runs the fetch whenever it changes (e.g. when the selected
// league/team/season scope changes).
export function useLiveData<T>(fetcher: () => Promise<T>, depsKey = ''): Feed<T> {
  const configured = isLiveEnabled()
  const [state, setState] = useState<Omit<Feed<T>, 'configured'>>({
    data: null,
    loading: configured,
    error: null,
  })

  useEffect(() => {
    if (!configured) return

    let cancelled = false
    setState({ data: null, loading: true, error: null })

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((e: Error) => {
        if (!cancelled) setState({ data: null, loading: false, error: e.message })
      })

    return () => {
      cancelled = true
    }
    // fetcher is recreated per render; depsKey controls when we refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, depsKey])

  return { ...state, configured }
}
