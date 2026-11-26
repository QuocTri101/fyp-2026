import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { Roles, hasRole } from '../features/auth/roles'
import { initials } from '../lib/format'
import Button, { buttonClass } from './Button'
import { CloseIcon, MenuIcon } from './icons'

interface NavItem {
  to: string
  label: string
  end?: boolean
}

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 py-1 text-sm font-semibold ${
    isActive ? 'border-signal text-ink' : 'border-transparent text-steel hover:text-ink'
  }`

const mobileLink = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2.5 text-base font-semibold ${
    isActive ? 'bg-chrome text-ink' : 'text-steel hover:bg-chrome hover:text-ink'
  }`

export default function Layout() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const isAdmin = !!user && hasRole(user.role, [Roles.Admin])
  const isStaff = !!user && hasRole(user.role, [Roles.Admin, Roles.Technician])

  // Close the mobile menu after navigating.
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const links: NavItem[] = [
    { to: '/', label: 'Home', end: true },
    { to: '/services', label: 'Services' },
    ...(user ? [{ to: '/orders', label: isAdmin ? 'All orders' : 'My orders' }] : []),
    ...(user ? [{ to: '/invoices', label: 'Invoices' }] : []),
    ...(isStaff ? [{ to: '/staff/counter', label: 'Counter' }] : []),
    ...(isAdmin ? [{ to: '/admin/services', label: 'Manage services' }] : []),
  ]

  const displayName = user ? user.name || user.email : ''

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-white">
        <div className="hazard h-1.5" aria-hidden />
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-ink font-display text-xl font-bold text-signal">
                CS
              </span>
              <span className="font-display text-2xl font-semibold leading-none">Car Service</span>
            </Link>
            <nav className="hidden gap-6 lg:flex" aria-label="Main">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={desktopLink}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <>
                <Link
                  to="/account"
                  className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-chrome"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-ink font-display text-base text-signal">
                    {initials(displayName)}
                  </span>
                  <span className="max-w-[10rem] truncate text-sm font-semibold">{displayName}</span>
                </Link>
                <Button variant="secondary" size="sm" onClick={logout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className={buttonClass('ghost', 'sm')}>
                  Log in
                </Link>
                <Link to="/register" className={buttonClass('primary', 'sm')}>
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="rounded-md p-2 hover:bg-chrome lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {menuOpen && (
          <div id="mobile-menu" className="border-t border-line bg-white px-4 py-3 lg:hidden">
            <nav aria-label="Mobile" className="space-y-1">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={mobileLink}>
                  {l.label}
                </NavLink>
              ))}
              {user && (
                <NavLink to="/account" className={mobileLink}>
                  My account
                </NavLink>
              )}
            </nav>
            <div className="mt-3 flex gap-3 border-t border-line pt-3">
              {user ? (
                <Button variant="secondary" className="flex-1" onClick={logout}>
                  Log out
                </Button>
              ) : (
                <>
                  <Link to="/login" className={`${buttonClass('secondary')} flex-1`}>
                    Log in
                  </Link>
                  <Link to="/register" className={`${buttonClass('primary')} flex-1`}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <Outlet />
      </main>

      <footer className="bg-ink text-white/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm sm:px-6">
          <p className="font-display text-xl text-white">Car Service</p>
          <p>Final-year project, built with ASP.NET Core and React.</p>
        </div>
        <div className="hazard h-1.5" aria-hidden />
      </footer>
    </div>
  )
}
