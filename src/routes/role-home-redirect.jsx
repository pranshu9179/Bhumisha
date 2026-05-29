import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/use-current-user'

export function RoleHomeRedirect() {
  const user = useCurrentUser()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={`/${user.role}`} replace />
}
