import type { ReactNode } from 'react'

interface FeedStateProps {
  configured: boolean
  loading: boolean
  error: string | null
  empty: boolean
  children: ReactNode
}

// Renders the right placeholder for a live feed, or the children once real
// data is available. Nothing is ever shown from bundled/sample data.
export function FeedState({
  configured,
  loading,
  error,
  empty,
  children,
}: FeedStateProps) {
  if (!configured) {
    return (
      <div className="feed-state">
        <span className="feed-state-icon">🔌</span>
        <p className="feed-state-title">No API key configured</p>
        <p className="feed-state-text">
          Add your API-Football key to <code>.env.local</code> to load live
          data. See the README for setup.
        </p>
      </div>
    )
  }
  if (loading) {
    return (
      <div className="feed-state">
        <span className="feed-spinner" />
        <p className="feed-state-text">Loading live data…</p>
      </div>
    )
  }
  if (error) {
    return (
      <div className="feed-state">
        <span className="feed-state-icon">⚠️</span>
        <p className="feed-state-title">Couldn’t load live data</p>
        <p className="feed-state-text">{error}</p>
      </div>
    )
  }
  if (empty) {
    return (
      <div className="feed-state">
        <span className="feed-state-icon">📭</span>
        <p className="feed-state-text">No data available for this selection.</p>
      </div>
    )
  }
  return <>{children}</>
}
