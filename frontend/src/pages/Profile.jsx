import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { authAPI, usersAPI, uploadsAPI } from '../api/endpoints'

export default function Profile() {
  const { user, updateUser, logout } = useAuth()

  // Profile fields state
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [address, setAddress] = useState({
    line1: user?.address?.line1 || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postal_code: user?.address?.postal_code || '',
    country: user?.address?.country || 'US',
  })

  // Status & errors
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  // Avatar upload
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Password change state
  const [passForm, setPassForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [passSuccess, setPassSuccess] = useState('')
  const [passError, setPassError] = useState('')
  const [passLoading, setPassLoading] = useState(false)

  // Login history
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)

  // Account deletion modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const { data } = await usersAPI.loginHistory(10)
      setHistory(data.history || [])
    } catch {
      // fail silently or show standard state
    } finally {
      setHistoryLoading(false)
    }
  }

  // Update profile handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileSuccess('')
    setProfileError('')

    try {
      const payload = {
        full_name: fullName,
        phone: phone || undefined,
        address: address.line1 ? address : undefined,
      }
      const { data } = await authAPI.updateMe(payload)
      updateUser(data)
      setProfileSuccess('Profile updated successfully.')
    } catch (err) {
      setProfileError(err.response?.data?.detail || 'Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  // Avatar upload handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 2MB
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image size must be less than 2MB.')
      return
    }

    setUploading(true)
    setUploadError('')
    try {
      const { data: uploadData } = await uploadsAPI.uploadImage(file)
      // Save avatar URL to profile
      const { data: userData } = await authAPI.updateMe({
        avatar_url: uploadData.url
      })
      updateUser(userData)
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Avatar upload failed.')
    } finally {
      setUploading(false)
    }
  }

  // Password change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPassError('')
    setPassSuccess('')

    if (passForm.new_password !== passForm.confirm_password) {
      setPassError('New passwords do not match.')
      return
    }

    // Front-end strength check (mirrors backend strict regex requirements)
    const hasUpper = /[A-Z]/.test(passForm.new_password)
    const hasLower = /[a-z]/.test(passForm.new_password)
    const hasDigit = /\d/.test(passForm.new_password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(passForm.new_password)

    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      setPassError('Password must contain upper, lower, digit, and special character.')
      return
    }

    setPassLoading(true)
    try {
      const { data } = await usersAPI.changePassword({
        current_password: passForm.current_password,
        new_password: passForm.new_password,
      })
      setPassSuccess(data.message || 'Password updated. Logging out...')
      setTimeout(() => {
        logout()
      }, 2000)
    } catch (err) {
      setPassError(err.response?.data?.detail || 'Failed to change password.')
    } finally {
      setPassLoading(false)
    }
  }

  // Soft delete account handler
  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await usersAPI.deleteAccount()
      logout()
    } catch (err) {
      setDeleting(false)
      setShowDeleteModal(false)
      alert(err.response?.data?.detail || 'Failed to deactivate account.')
    }
  }

  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Manage your personal settings, password, and active login sessions.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 'var(--space-8)',
        alignItems: 'start'
      }}>
        {/* Left Side: General Info & Password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {/* Avatar & Profile Card */}
          <div className="card animate-fade-in-up">
            <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-6)' }}>General Details</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
              <div className="avatar avatar-lg" style={{
                position: 'relative',
                background: user?.avatar_url ? 'transparent' : 'var(--accent-light)',
                border: '2px solid var(--border)'
              }}>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  (user?.full_name?.[0] || '?').toUpperCase()
                )}
                {uploading && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.6)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div className="spinner" />
                  </div>
                )}
              </div>

              <div>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  {uploading ? 'Uploading…' : 'Upload Image'}
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} disabled={uploading} />
                </label>
                {uploadError && <p style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>{uploadError}</p>}
                <p className="form-hint" style={{ marginTop: 'var(--space-1)' }}>JPG, PNG, or WebP. Max 2MB.</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="auth-form">
              {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}
              {profileError && <div className="alert alert-error">{profileError}</div>}

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input className="form-input" value={user?.email || ''} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" required value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" placeholder="+1234567890" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>

              {/* Collapsible shipping address */}
              <div style={{ marginTop: 'var(--space-2)' }}>
                <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>Shipping Address (Optional)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <input className="form-input" placeholder="Street line 1" value={address.line1} onChange={e => setAddress({ ...address, line1: e.target.value })} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    <input className="form-input" placeholder="City" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
                    <input className="form-input" placeholder="State" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    <input className="form-input" placeholder="Postal code" value={address.postal_code} onChange={e => setAddress({ ...address, postal_code: e.target.value })} />
                    <input className="form-input" placeholder="Country" value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={profileLoading} style={{ marginTop: 'var(--space-2)' }}>
                {profileLoading ? <span className="spinner" /> : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          {user?.provider_type === 'email' && (
            <div className="card animate-fade-in-up">
              <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-6)' }}>Update Password</h3>
              <form onSubmit={handlePasswordChange} className="auth-form">
                {passSuccess && <div className="alert alert-success">{passSuccess}</div>}
                {passError && <div className="alert alert-error">{passError}</div>}

                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input type="password" required className="form-input" value={passForm.current_password} onChange={e => setPassForm({ ...passForm, current_password: e.target.value })} />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" required className="form-input" value={passForm.new_password} onChange={e => setPassForm({ ...passForm, new_password: e.target.value })} />
                  <p className="form-hint">Must be at least 8 chars and contain uppercase, lowercase, digit, and a special character.</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" required className="form-input" value={passForm.confirm_password} onChange={e => setPassForm({ ...passForm, confirm_password: e.target.value })} />
                </div>

                <button type="submit" className="btn btn-primary" disabled={passLoading}>
                  {passLoading ? <span className="spinner" /> : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Sessions & Deactivate */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {/* Login History */}
          <div className="card animate-fade-in-up">
            <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-6)' }}>Recent Session Log</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
              Audit list of the last logins on your account. If you spot unauthorized sessions, change your password immediately.
            </p>

            {historyLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 50 }} />)}
              </div>
            ) : history.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No logs recorded.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {history.map(item => (
                  <div key={item.id} style={{
                    padding: 'var(--space-4)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-sm)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                      <span style={{ fontWeight: 600, color: item.status === 'success' ? 'var(--success)' : 'var(--danger)' }}>
                        {item.status === 'success' ? 'Successful Sign In' : 'Failed attempt'}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', wordBreak: 'break-all' }}>
                      IP: <code style={{ color: 'var(--accent)' }}>{item.ip_address}</code> | {item.user_agent}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Deactivation Card */}
          <div className="card animate-fade-in-up" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <h3 style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: 'var(--space-2)' }}>Danger Zone</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
              Temporarily deactivate your account. You can request activation through support, but active refresh tokens will be cleared immediately.
            </p>
            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
              Deactivate Account
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 'var(--space-4)'
        }}>
          <div className="card animate-fade-in-up" style={{ maxWidth: '400px', width: '100%' }}>
            <h3 style={{ fontWeight: 600, color: 'var(--danger)', marginBottom: 'var(--space-3)' }}>Are you sure?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)', lineHeight: 1.5 }}>
              This will deactivate your session. You will be automatically signed out and your account status will be flagged as deactivated.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? <span className="spinner" /> : 'Yes, Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
