import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

const APP_NAME = import.meta.env.VITE_APP_NAME || 'MyApp'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(13,13,26,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      height: 'var(--nav-height)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '100%',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          fontSize: 'var(--text-xl)', fontWeight: 800,
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {APP_NAME}
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'btn btn-ghost' : 'btn btn-ghost'
            }
            style={({ isActive }) => ({ color: isActive ? 'var(--accent)' : undefined })}
          >
            Home
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className="btn btn-ghost"
                style={({ isActive }) => ({ color: isActive ? 'var(--accent)' : undefined })}
              >
                Dashboard
              </NavLink>

              {user?.role === 'admin' && (
                <NavLink
                  to="/admin"
                  className="btn btn-ghost"
                  style={({ isActive }) => ({ color: isActive ? 'var(--accent)' : undefined })}
                >
                  Admin
                </NavLink>
              )}

              <NavLink
                to="/profile"
                className="btn btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                <div className="avatar avatar-sm" style={{
                  background: user?.avatar_url ? 'transparent' : 'var(--accent-light)',
                }}>
                  {user?.avatar_url
                    ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                    : (user?.full_name?.[0] || '?').toUpperCase()
                  }
                </div>
                <span style={{ color: 'var(--text-primary)' }}>
                  {user?.full_name?.split(' ')[0] || 'Profile'}
                </span>
              </NavLink>

              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-ghost">Sign In</NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">Get Started</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
