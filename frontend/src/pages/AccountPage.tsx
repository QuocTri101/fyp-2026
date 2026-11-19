import { useAuth } from '../features/auth/AuthContext'

export default function AccountPage() {
  const { user } = useAuth()
  if (!user) return null // RequireAuth already redirects; this keeps TypeScript happy.

  const rows: [string, string][] = [
    ['Name', user.name],
    ['Email', user.email],
    ['Role', user.role],
  ]

  return (
    <section className="max-w-md">
      <h1 className="mb-4 text-2xl font-bold">My account</h1>
      <dl className="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between px-4 py-3 text-sm">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-medium">{value || '-'}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
