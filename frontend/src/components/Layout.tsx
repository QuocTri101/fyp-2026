import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'

const navLink = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium ${isActive ? 'text-blue-700' : 'text-slate-600 hover:text-slate-900'}`

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-lg font-semibold text-slate-900">
              Car Service
            </Link>
            <nav className="flex gap-4">
              <NavLink to="/" end className={navLink}>
                Home
              </NavLink>
              {/* Next steps: Services, My bookings, Admin */}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <NavLink to="/account" className={navLink}>
                  {user.name || user.email}
                </NavLink>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLink}>
                  Log in
                </NavLink>
                <Link
                  to="/register"
                  className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
