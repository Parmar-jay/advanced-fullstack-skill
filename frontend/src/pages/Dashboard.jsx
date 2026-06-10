import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { itemsAPI, usersAPI } from '../api/endpoints'

export default function Dashboard() {
  const { user } = useAuth()
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [error, setError]     = useState('')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const { data } = await itemsAPI.list({ owner_id: user?.id, per_page: 10 })
      setItems(data.items || [])
    } catch {
      setError('Could not load items.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const { data } = await itemsAPI.create({ title: newTitle, status: 'active' })
      setItems(prev => [data, ...prev])
      setNewTitle('')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create item.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await itemsAPI.delete(id)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {
      setError('Could not delete item.')
    }
  }

  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: 800, margin: '0 auto' }}>
      {/* Welcome Header */}
      <div className="animate-fade-in-up" style={{ marginBottom: 'var(--space-8)' }}>
        <h1 className="page-title">
          Welcome back, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="page-subtitle">Manage your content below.</p>
      </div>

      {/* User Card */}
      <div className="card" style={{ marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div className="avatar avatar-md" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            : (user?.full_name?.[0] || '?').toUpperCase()
          }
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600 }}>{user?.full_name}</p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{user?.email}</p>
        </div>
        <span className={`badge ${user?.role === 'admin' ? 'badge-accent' : 'badge-muted'}`}>
          {user?.role}
        </span>
        <Link to="/profile" className="btn btn-secondary btn-sm">Edit Profile</Link>
      </div>

      {/* Create Item */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-4)' }}>Create Item</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <input
            className="form-input"
            placeholder="Item title…"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={creating} style={{ whiteSpace: 'nowrap' }}>
            {creating ? <span className="spinner" /> : '+ Add'}
          </button>
        </form>
      </div>

      {/* Item List */}
      {error && <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}

      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          My Items {items.length > 0 && <span className="badge badge-muted" style={{ marginLeft: 'var(--space-2)' }}>{items.length}</span>}
        </h3>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
          </div>
        ) : items.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-8)' }}>
            No items yet. Create your first one above!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {items.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-4)',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
              }}>
                <div>
                  <p style={{ fontWeight: 500 }}>{item.title}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <span className={`badge ${item.status === 'active' ? 'badge-success' : 'badge-muted'}`}>
                    {item.status}
                  </span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
