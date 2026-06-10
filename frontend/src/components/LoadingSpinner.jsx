export default function LoadingSpinner({ fullPage = false, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'spinner spinner-lg' : 'spinner'

  if (fullPage) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)',
        zIndex: 9999,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
          <p style={{
            marginTop: 'var(--space-4)',
            color: 'var(--text-secondary)',
            fontSize: 'var(--text-sm)',
          }}>
            Loading…
          </p>
        </div>
      </div>
    )
  }

  return <div className={sizeClass} />
}
