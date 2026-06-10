import { useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authAPI } from '../api/endpoints'

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefillEmail = location.state?.email || ''

  const [step, setStep] = useState(1) // 1=enter otp, 2=new password
  const [email, setEmail]         = useState(prefillEmail)
  const [otp, setOtp]             = useState(Array(6).fill(''))
  const [newPassword, setNewPw]   = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const refs = useRef([])

  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    if (val && idx < 5) refs.current[idx + 1]?.focus()
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { setError('Enter all 6 digits'); return }
    setError('')
    setLoading(true)
    try {
      await authAPI.verifyOtp(email, code)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPw) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await authAPI.resetPassword({ email, otp_code: otp.join(''), new_password: newPassword })
      navigate('/login', { state: { message: 'Password reset successful. Please sign in.' } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Reset failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>Reset Password</h1>
          <p>{step === 1 ? 'Enter the code from your email' : 'Set your new password'}</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>{error}</div>}

        {step === 1 && (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            {!prefillEmail && (
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">6-digit code</label>
              <div className="otp-grid">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => refs.current[i] = el}
                    className={`otp-input ${digit ? 'filled' : ''}`}
                    type="text" inputMode="numeric" maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => { if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i-1]?.focus() }}
                  />
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Verify Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="auth-form" onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password" className="form-input" placeholder="••••••••"
                value={newPassword} onChange={e => setNewPw(e.target.value)} required
                autoComplete="new-password"
              />
              <span className="form-hint">8+ chars, uppercase, lowercase, number</span>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password" className="form-input" placeholder="••••••••"
                value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login">← Back to sign in</Link>
        </div>
      </div>
    </div>
  )
}
