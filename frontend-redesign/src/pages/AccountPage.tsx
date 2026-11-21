import { Link } from 'react-router-dom'
import Button, { buttonClass } from '../components/Button'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../features/auth/AuthContext'
import { initials } from '../lib/format'

export default function AccountPage() {
  const { user, logout } = useAuth()
  if (!user) return null
  const display = user.name || user.email

  return (
    <>
      <PageHeader title="My account" />
      <div className="max-w-xl overflow-hidden rounded-xl border border-line bg-white">
        <div className="flex items-center gap-4 border-b border-line p-6">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-ink font-display text-3xl text-signal">
            {initials(display)}
          </span>
          <div>
            <p className="text-xl font-semibold">{display}</p>
            <p className="text-steel">{user.role || 'Customer'}</p>
          </div>
        </div>
        <dl className="divide-y divide-line text-sm">
          <div className="flex justify-between px-6 py-3">
            <dt className="text-steel">Email</dt>
            <dd className="font-semibold">{user.email || '-'}</dd>
          </div>
          <div className="flex justify-between px-6 py-3">
            <dt className="text-steel">Account number</dt>
            <dd className="font-semibold tabular-nums">{user.id ?? '-'}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-3 border-t border-line p-6">
          <Link to="/orders" className={buttonClass('primary')}>
            View my orders
          </Link>
          <Button variant="secondary" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>
    </>
  )
}
