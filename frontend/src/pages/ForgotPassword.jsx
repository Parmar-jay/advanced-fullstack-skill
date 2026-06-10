import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api/endpoints'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 'var(--space-4)' }}>✉️</div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
            Check your email
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>
            If <strong style={{ color: 'var(--text-primary)' }}>{email}</strong> is registered,
            you'll receive a reset code shortly.
          </p>
          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={() => navigate('/reset-password', { state: { email } })}
          >
            Enter Reset Code
          </button>
          <div className="auth-footer">
            <Link to="/login">← Back to sign in</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Reset Password</h1>
          <p>Enter your email to receive a reset code</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Send Reset Code'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">← Back to sign in</Link>
        </div>
      </div>
    </div>
  )
}
