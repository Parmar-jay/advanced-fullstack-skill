/** Redirect non-admin users to dashboard */
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'

export default function AdminRoute({ children }) {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) return <LoadingSpinner fullPage />

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
