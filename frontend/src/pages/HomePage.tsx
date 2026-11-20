import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { Roles, hasRole } from '../features/auth/roles'

const primary =
  'rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700'
const secondary =
  'rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100'

export default function HomePage() {
  const { user } = useAuth()
  const isAdmin = !!user && hasRole(user.role, [Roles.Admin])

  return (
    <section className="py-8">
      <h1 className="text-3xl font-bold">Car Service</h1>
      <p className="mt-2 max-w-xl text-slate-600">
        Browse car services, book an appointment and follow its status.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/services" className={primary}>
          Browse services
        </Link>
        {user && (
          <Link to="/orders" className={secondary}>
            {isAdmin ? 'All orders' : 'My orders'}
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin/services" className={secondary}>
            Manage services
          </Link>
        )}
        {!user && (
          <>
            <Link to="/login" className={secondary}>
              Log in
            </Link>
            <Link to="/register" className={secondary}>
              Create an account
            </Link>
          </>
        )}
      </div>
    </section>
  )
}
