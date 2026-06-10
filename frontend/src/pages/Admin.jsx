import { useState, useEffect } from 'react'
import { adminAPI } from '../api/endpoints'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users') // 'users', 'stats', 'audits'
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Users management state
  const [users, setUsers] = useState([])
  const [usersCount, setUsersCount] = useState(0)
  const [usersLoading, setUsersLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [userTotalPages, setUserTotalPages] = useState(1)

  // Audit history state
  const [audits, setAudits] = useState([])
  const [auditsLoading, setAuditsLoading] = useState(true)
  const [auditPage, setAuditPage] = useState(1)
  const [auditTotalPages, setAuditTotalPages] = useState(1)

  // Errors
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'audits') {
      fetchAudits()
    }
  }, [activeTab, userPage, roleFilter, statusFilter, auditPage])

  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      const { data } = await adminAPI.stats()
      setStats(data)
    } catch {
      setError('Failed to load platform stats.')
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const { data } = await adminAPI.listUsers({
        page: userPage,
        per_page: 10,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined
      })
      setUsers(data.users || [])
      setUsersCount(data.total)
      setUserTotalPages(data.total_pages)
    } catch {
      setError('Failed to fetch users list.')
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchAudits = async () => {
    setAuditsLoading(true)
    try {
      const { data } = await adminAPI.loginHistory({
        page: auditPage,
        per_page: 20
      })
      setAudits(data.history || [])
      setAuditTotalPages(data.total_pages)
    } catch {
      setError('Failed to fetch login audits.')
    } finally {
      setAuditsLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setUserPage(1)
    fetchUsers()
  }

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const { data } = await adminAPI.updateUser(userId, { role: newRole })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: data.role } : u))
      fetchStats() // Update stat counts if roles impact stats
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update user role.')
    }
  }

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      const { data } = await adminAPI.updateUser(userId, { account_status: newStatus })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, account_status: data.account_status } : u))
      fetchStats()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update account status.')
    }
  }

  const handleToggleVerified = async (userId, currentVerified) => {
    try {
      const { data } = await adminAPI.updateUser(userId, { is_verified: !currentVerified })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: data.is_verified } : u))
      fetchStats()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update verification status.')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate (soft-delete) this user?')) return
    try {
      await adminAPI.deleteUser(userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, account_status: 'deactivated' } : u))
      fetchStats()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to deactivate user.')
    }
  }

  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: 'var(--space-8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform overview, user management, and global audit logs.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchStats} disabled={statsLoading}>
          Refresh Stats
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-6)' }}>{error}</div>}

      {/* Stats Cards Section */}
      {statsLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 110 }} />)}
        </div>
      ) : (
        stats && (
          <div className="stats-grid animate-fade-in-up">
            <div className="stat-card">
              <div className="stat-value">{stats.total_users}</div>
              <div className="stat-label">Total Registered Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.active_users}</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--info)' }}>{stats.verified_users}</div>
              <div className="stat-label">Verified Email Accounts</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.total_items}</div>
              <div className="stat-label">Total Items Created</div>
            </div>
          </div>
        )
      )}

      {/* Tabs Menu */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        marginBottom: 'var(--space-6)',
        gap: 'var(--space-4)'
      }}>
        <button
          className="btn"
          style={{
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            background: 'none',
            borderBottom: activeTab === 'users' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'users' ? 'var(--accent)' : 'var(--text-secondary)',
            fontWeight: 600,
            paddingBottom: 'var(--space-3)'
          }}
          onClick={() => setActiveTab('users')}
        >
          User Directory
        </button>
        <button
          className="btn"
          style={{
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
            background: 'none',
            borderBottom: activeTab === 'audits' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'audits' ? 'var(--accent)' : 'var(--text-secondary)',
            fontWeight: 600,
            paddingBottom: 'var(--space-3)'
          }}
          onClick={() => setActiveTab('audits')}
        >
          Login Audits
        </button>
      </div>

      {/* Users Tab Panel */}
      {activeTab === 'users' && (
        <div className="card animate-fade-in-up" style={{ padding: 'var(--space-6)' }}>
          {/* Filters Bar */}
          <form onSubmit={handleSearchSubmit} style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-6)'
          }}>
            <input
              className="form-input"
              placeholder="Search by name, email, or username…"
              style={{ flex: 1, minWidth: '240px' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="form-input"
              style={{ width: '150px' }}
              value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setUserPage(1); }}
            >
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <select
              className="form-input"
              style={{ width: '150px' }}
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setUserPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deactivated">Deactivated</option>
            </select>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          {/* Table */}
          {usersLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: 60 }} />)}
            </div>
          ) : users.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-8)' }}>No users found matching requirements.</p>
          ) : (
            <>
              <div className="table-wrapper" style={{ marginBottom: 'var(--space-4)' }}>
                <table>
                  <thead>
                    <tr>
                      <th>User Info</th>
                      <th>OAuth Type</th>
                      <th>Role</th>
                      <th>Verified</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div className="avatar avatar-sm" style={{ background: 'var(--accent-light)' }}>
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                              ) : (
                                (user.full_name?.[0] || '?').toUpperCase()
                              )}
                            </div>
                            <div>
                              <p style={{ fontWeight: 600 }}>{user.full_name}</p>
                              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-muted">{user.provider_type}</span>
                        </td>
                        <td>
                          <select
                            className="form-input"
                            style={{ padding: '2px var(--space-2)', width: '110px', fontSize: 'var(--text-xs)' }}
                            value={user.role}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          >
                            <option value="customer">Customer</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className={`badge ${user.is_verified ? 'badge-success' : 'badge-danger'}`}
                            onClick={() => handleToggleVerified(user.id, user.is_verified)}
                          >
                            {user.is_verified ? 'Verified' : 'Unverified'}
                          </button>
                        </td>
                        <td>
                          <select
                            className={`form-input badge ${
                              user.account_status === 'active' ? 'badge-success' : user.account_status === 'suspended' ? 'badge-warning' : 'badge-danger'
                            }`}
                            style={{ padding: '2px var(--space-2)', width: '120px', fontSize: 'var(--text-xs)', border: 'none' }}
                            value={user.account_status}
                            onChange={(e) => handleUpdateStatus(user.id, e.target.value)}
                          >
                            <option value="active" style={{ background: 'var(--bg-card)', color: 'var(--success)' }}>Active</option>
                            <option value="suspended" style={{ background: 'var(--bg-card)', color: 'var(--warning)' }}>Suspended</option>
                            <option value="deactivated" style={{ background: 'var(--bg-card)', color: 'var(--danger)' }}>Deactivated</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={user.account_status === 'deactivated'}
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Deactivate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Total: {usersCount} Users</span>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={userPage <= 1}
                    onClick={() => setUserPage(prev => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--text-sm)', padding: '0 var(--space-2)' }}>
                    Page {userPage} of {userTotalPages}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={userPage >= userTotalPages}
                    onClick={() => setUserPage(prev => Math.min(prev + 1, userTotalPages))}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Audits Tab Panel */}
      {activeTab === 'audits' && (
        <div className="card animate-fade-in-up" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-4)' }}>Login Audit Trail</h3>

          {auditsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: 50 }} />)}
            </div>
          ) : audits.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No audit events found.</p>
          ) : (
            <>
              <div className="table-wrapper" style={{ marginBottom: 'var(--space-4)' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>User ID</th>
                      <th>IP Address</th>
                      <th>Status</th>
                      <th>User Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audits.map(audit => (
                      <tr key={audit.id}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                          {new Date(audit.created_at).toLocaleString()}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{audit.user_id}</td>
                        <td><code style={{ color: 'var(--accent)' }}>{audit.ip_address}</code></td>
                        <td>
                          <span className={`badge ${audit.success ? 'badge-success' : 'badge-danger'}`}>
                            {audit.success ? 'Success' : 'Failed'}
                          </span>
                        </td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={audit.user_agent}>
                          {audit.user_agent}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={auditPage <= 1}
                  onClick={() => setAuditPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--text-sm)', padding: '0 var(--space-2)' }}>
                  Page {auditPage} of {auditTotalPages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={auditPage >= auditTotalPages}
                  onClick={() => setAuditPage(prev => Math.min(prev + 1, auditTotalPages))}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
