const APP_NAME = import.meta.env.VITE_APP_NAME || 'MyApp'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: 'var(--space-8) 0',
      marginTop: 'auto',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
      }}>
        <span style={{
          fontWeight: 700,
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {APP_NAME}
        </span>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} {APP_NAME}. Built with FastAPI + React.
        </p>
      </div>
    </footer>
  )
}
