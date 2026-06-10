import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api/endpoints'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm]     = useState({ full_name: '', email: '', username: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate = () => {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Full name is required'
    if (!form.email.trim())     errs.email     = 'Email is required'
    if (form.password.length < 8) errs.password = 'At least 8 characters'
    if (!/[A-Z]/.test(form.password)) errs.password = 'Include an uppercase letter'
    if (!/[a-z]/.test(form.password)) errs.password = 'Include a lowercase letter'
    if (!/\d/.test(form.password))    errs.password = 'Include a number'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await authAPI.signup({
        full_name: form.full_name,
        email: form.email,
        username: form.username || undefined,
        password: form.password,
      })
      navigate('/verify-email', { state: { email: form.email } })
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ id, label, type = 'text', placeholder, autoComplete }) => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <input
        id={id} name={id} type={type}
        className={`form-input ${errors[id] ? 'error' : ''}`}
        placeholder={placeholder}
        value={form[id]}
        onChange={handle}
        autoComplete={autoComplete}
      />
      {errors[id] && <span className="form-error">{errors[id]}</span>}
    </div>
  )

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <h1>{import.meta.env.VITE_APP_NAME || 'MyApp'}</h1>
          <p>Create your free account</p>
        </div>

        {serverError && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-5)' }}>
            {serverError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Field id="full_name" label="Full Name" placeholder="Jane Doe" autoComplete="name" />
            <Field id="username"  label="Username (optional)" placeholder="jane_doe" />
          </div>

          <Field id="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Field id="password" label="Password" type="password" placeholder="••••••••" autoComplete="new-password" />
            <Field id="confirm"  label="Confirm" type="password" placeholder="••••••••" autoComplete="new-password" />
          </div>

          <div className="form-hint" style={{ marginTop: '-var(--space-2)' }}>
            Password must be 8+ chars, with uppercase, lowercase, and a number.
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
