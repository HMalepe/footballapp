import { navItems } from '../data/mockData'

interface SidebarProps {
  activeItem: string
  onNavigate: (id: string) => void
}

export function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">⚽</span>
        <div>
          <h1>Football App</h1>
          <p>Dashboard</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="season-badge">
          <span>2025/26 Season</span>
        </div>
      </div>
    </aside>
  )
}
