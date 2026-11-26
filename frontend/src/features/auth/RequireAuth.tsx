import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { hasRole } from './roles'

/**
 * Route guard. Use as a layout route:
 *   <Route element={<RequireAuth />}>                      any signed-in user
 *   <Route element={<RequireAuth roles={[Roles.Admin]} />}> admins only
 * This only hides pages. The API enforces the real permissions with [Authorize].
 */
export default function RequireAuth({ roles }: { roles?: readonly string[] }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles && !hasRole(user.role, roles)) return <Navigate to="/" replace />
  return <Outlet />
}
