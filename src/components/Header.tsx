interface HeaderProps {
  title: string
  subtitle: string
  onExport: () => void
  onNewMatch: () => void
  onRefresh: () => void
  configured: boolean
  loading: boolean
}

export function Header({
  title,
  subtitle,
  onExport,
  onNewMatch,
  onRefresh,
  configured,
  loading,
}: HeaderProps) {
  const status = !configured ? 'offline' : loading ? 'syncing' : 'live'
  const label = !configured ? 'No API key' : loading ? 'Syncing…' : 'Live data'

  return (
    <header className="dashboard-header">
      <div>
        <div className="header-title-row">
          <h2>{title}</h2>
          <span className={`data-badge data-badge-${status}`} title={label}>
            <span className="data-dot" />
            {label}
          </span>
        </div>
        <p>{subtitle}</p>
      </div>
      <div className="header-actions">
        {configured && (
          <button
            type="button"
            className="btn-icon"
            onClick={onRefresh}
            title="Refresh live data"
            aria-label="Refresh live data"
            disabled={loading}
          >
            ↻
          </button>
        )}
        <button type="button" className="btn-secondary" onClick={onExport}>
          Export
        </button>
        <button type="button" className="btn-primary" onClick={onNewMatch}>
          + New Match
        </button>
      </div>
    </header>
  )
}
