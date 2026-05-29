import { Navigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/use-current-user'

export function ProtectedRoute({ role, children }) {
  const user = useCurrentUser()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
