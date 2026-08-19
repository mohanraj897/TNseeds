import { Store, LogOut, User, ExternalLink, ShieldCheck, Wifi, WifiOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function DealerNavbar({ connected, onQuickLogin }) {
  const { user, logout } = useAuth()

  return (
    <nav className="dealer-navbar">
      <div className="container nav-inner">
        <div className="brand-badge">
          <div className="brand-icon">
            <Store size={22} />
          </div>
          <div>
            <div style={{ lineHeight: 1.1, fontSize: '1.2rem', fontWeight: 800 }}>AgriCart Dealer</div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500 }}>Store Inventory & Operations</div>
          </div>
        </div>

        <div className="nav-links">
          {/* Socket status */}
          <span className={`status-pill ${connected ? 'online' : 'offline'}`}>
            {connected ? <><Wifi size={12}/> Live Sync</> : <><WifiOff size={12}/> Offline</>}
          </span>

          {/* Quick Nav back to Clients */}
          <a 
            href="http://localhost:5173" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="nav-btn btn-secondary"
            title="Open Vite Farmer Client"
          >
            Farmer Client <ExternalLink size={14} />
          </a>

          <a 
            href="http://localhost:3000" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="nav-btn btn-secondary"
            title="Open Next.js Client"
          >
            Next Client <ExternalLink size={14} />
          </a>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                <User size={16} color="#10B981" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFF' }}>{user.storeName || user.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{user.email}</div>
                </div>
              </div>

              <button className="nav-btn btn-ghost" onClick={logout} title="Logout">
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <button className="nav-btn btn-primary" onClick={onQuickLogin}>
              <ShieldCheck size={16} /> Dealer Demo Login
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
