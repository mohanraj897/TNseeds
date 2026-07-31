import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, User, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import AgriLogo from './AgriLogo'
import './Navbar.css'

export default function Navbar({ onAddSeed }) {
  const { user, logout, isDealer } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo-link">
          <AgriLogo />
        </Link>

        {/* Desktop Actions */}
        <div className="navbar-actions desktop-only">
          {user ? (
            <>
              <div className="user-chip">
                <User size={14} />
                <span>{user.name}</span>
                <span className={`role-pill ${isDealer ? 'dealer' : 'farmer'}`}>
                  {isDealer ? 'Dealer' : 'Farmer'}
                </span>
              </div>
              {isDealer && (
                <button className="btn btn-primary btn-sm" onClick={onAddSeed}>
                  <Plus size={16} /> Add Seed
                </button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register as Dealer</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="menu-toggle mobile-only" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {user ? (
            <>
              <div className="mobile-user-info">
                <User size={16} />
                <span>{user.name}</span>
                <span className={`role-pill ${isDealer ? 'dealer' : 'farmer'}`}>
                  {isDealer ? 'Dealer' : 'Farmer'}
                </span>
              </div>
              {isDealer && (
                <button className="btn btn-primary btn-full" onClick={() => { onAddSeed(); setMenuOpen(false) }}>
                  <Plus size={16} /> Add New Seed
                </button>
              )}
              <button className="btn btn-ghost btn-full" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-full" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-full" onClick={() => setMenuOpen(false)}>Register as Dealer</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
