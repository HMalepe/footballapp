interface HeaderProps {
  title: string
  subtitle: string
  onExport: () => void
  onNewMatch: () => void
}

export function Header({ title, subtitle, onExport, onNewMatch }: HeaderProps) {
  return (
    <header className="dashboard-header">
      <div>
        <h2>{title}</h2>
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
