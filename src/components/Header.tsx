interface HeaderProps {
  title: string
  subtitle: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="dashboard-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="header-actions">
        <button type="button" className="btn-secondary">
          Export
        </button>
        <button type="button" className="btn-primary">
          + New Match
        </button>
      </div>
    </header>
  )
}
