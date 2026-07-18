interface HeaderProps {
  title: string
  subtitle: string
  onExport: () => void
  onNewMatch: () => void
  isLive: boolean
  loading: boolean
}

export function Header({
  title,
  subtitle,
  onExport,
  onNewMatch,
  isLive,
  loading,
}: HeaderProps) {
  const status = loading ? 'syncing' : isLive ? 'live' : 'sample'
  const label = loading ? 'Syncing…' : isLive ? 'Live data' : 'Sample data'

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
