import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function NotFound() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-card" style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ fontSize: '5rem', marginBottom: 'var(--space-2)' }}>🔍</div>
        <h1 style={{
          fontSize: 'var(--text-5xl)',
          fontWeight: 800,
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 'var(--space-2)'
        }}>
          404
        </h1>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-8)', lineHeight: 1.6 }}>
          The link you followed may be broken, or the page may have been removed. Let's get you back on track!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-full">
              Back to Dashboard
            </Link>
          ) : (
            <Link to="/" className="btn btn-primary btn-full">
              Back to Homepage
            </Link>
          )}
          <Link to="/login" className="btn btn-secondary btn-full">
            Sign In to Another Account
          </Link>
        </div>
      </div>
    </div>
  )
}
