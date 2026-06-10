import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Hero Glow */}
      <div style={{
        position: 'absolute',
        top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '1200px',
        height: '600px',
        background: 'var(--gradient-hero)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Hero Section */}
      <section className="container animate-fade-in" style={{
        position: 'relative',
        zIndex: 1,
        paddingTop: 'var(--space-20)',
        paddingBottom: 'var(--space-16)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-6)'
      }}>
        <span className="badge badge-accent animate-fade-in-up" style={{ padding: '0.4rem 1rem', fontSize: 'var(--text-xs)' }}>
          🔒 SECURE & PRODUCTION READY TEMPLATE
        </span>
        <h1 className="animate-fade-in-up" style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          maxWidth: '850px',
          background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Build General Purpose Apps with{' '}
          <span style={{
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Ironclad Security
          </span>
        </h1>
        <p className="animate-fade-in-up" style={{
          fontSize: 'var(--text-lg)',
          color: 'var(--text-secondary)',
          maxWidth: '640px',
          lineHeight: 1.6
        }}>
          A premium Fullstack Python boilerplate built on FastAPI, MongoDB, and React. Engineered to prevent modern web attacks and speed up development.
        </p>

        <div className="animate-fade-in-up" style={{
          display: 'flex',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-4)',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container" style={{
        position: 'relative',
        zIndex: 1,
        paddingBottom: 'var(--space-20)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
            Fully-Featured Core Boilerplate
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Everything you need to ship secure fullstack apps, pre-configured.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-6)',
        }}>
          {/* Card 1: Auth */}
          <div className="card-glass" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ fontSize: '2rem' }}>🔑</div>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>Robust User Authentication</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
              JWT access & rotating refresh tokens with automatic client refresh interceptors. Multi-channel flows including email OTP signups and Google OAuth.
            </p>
          </div>

          {/* Card 2: Security */}
          <div className="card-glass" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ fontSize: '2rem' }}>🛡️</div>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>Ironclad Security Measures</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
              SlowAPI rate limiting, automatic Bleach XSS sanitation on all requests, secure CORS policies, brute-force login lockouts, and cryptographic hashing.
            </p>
          </div>

          {/* Card 3: Storage */}
          <div className="card-glass" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ fontSize: '2rem' }}>☁️</div>
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>File Uploads & Storage</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
              Optimized image uploads directly integration with Cloudinary. Includes secure fallback storage, and metadata validation on formats and sizes.
            </p>
          </div>
        </div>
      </section>

      {/* Security Details Table Section */}
      <section style={{ background: 'var(--bg-secondary)', padding: 'var(--space-16) 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              Built-In Mitigation Matrix
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Protecting your application and user data against the most common web threats.
            </p>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Attack Type</th>
                  <th>Mitigation Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>NoSQL Injection</td>
                  <td style={{ color: 'var(--text-secondary)' }}>Strict Pydantic type validation combined with Motor parameterized query drivers.</td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Cross-Site Scripting (XSS)</td>
                  <td style={{ color: 'var(--text-secondary)' }}>String request sanitation parsing HTML tags utilizing the robust Python `bleach` module.</td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Brute-Force Logins</td>
                  <td style={{ color: 'var(--text-secondary)' }}>Automatic account lockouts after 5 consecutive failed login attempts within 15 minutes.</td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Token Theft & Replay</td>
                  <td style={{ color: 'var(--text-secondary)' }}>Short-lived access tokens (15 minutes) paired with cryptographic rotating refresh tokens.</td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Clickjacking</td>
                  <td style={{ color: 'var(--text-secondary)' }}>HTTP Headers protection configured with strict `X-Frame-Options: DENY` and CSP.</td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
