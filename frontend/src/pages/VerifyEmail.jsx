import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../api/endpoints'
import { useAuth } from '../hooks/useAuth'

export default function VerifyEmail() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const email     = location.state?.email || ''

  const [otp, setOtp]       = useState(Array(6).fill(''))
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown]   = useState(0)

  const refs = useRef([])

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate('/register', { replace: true })
  }, [email, navigate])

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    if (val && idx < 5) refs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = [...otp]
    text.split('').forEach((ch, i) => { next[i] = ch })
    setOtp(next)
    refs.current[Math.min(text.length, 5)]?.focus()
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { setError('Enter all 6 digits'); return }

    setError('')
    setLoading(true)
    try {
      const { data } = await authAPI.verifySignup({ email, otp_code: code })
      login(data)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid code. Please try again.')
      setOtp(Array(6).fill(''))
      refs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    try {
      await authAPI.resendSignupOtp(email)
      setSuccess('New code sent! Check your email.')
      setCooldown(60)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not resend. Please wait.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 'var(--space-4)' }}>📧</div>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          Verify your email
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>
          We sent a 6-digit code to<br />
          <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
        </p>

        {error   && <div className="alert alert-error"   style={{ marginBottom: 'var(--space-5)', textAlign: 'left' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: 'var(--space-5)', textAlign: 'left' }}>{success}</div>}

        <form onSubmit={handleVerify}>
          <div className="otp-grid" style={{ marginBottom: 'var(--space-6)' }}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => refs.current[i] = el}
                className={`otp-input ${digit ? 'filled' : ''}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
              />
            ))}
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Verify Email'}
          </button>
        </form>

        <p style={{ marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Didn't receive it?{' '}
          {cooldown > 0
            ? <span style={{ color: 'var(--text-muted)' }}>Resend in {cooldown}s</span>
            : <button
                onClick={handleResend}
                disabled={resending}
                style={{ color: 'var(--accent)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {resending ? 'Sending…' : 'Resend code'}
              </button>
          }
        </p>

        <div className="auth-footer">
          <Link to="/register">← Back to registration</Link>
        </div>
      </div>
    </div>
  )
}
