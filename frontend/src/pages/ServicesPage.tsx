import { Link } from 'react-router-dom'
import { formatPrice } from '../lib/format'
import Alert from '../components/Alert'
import { useServices } from '../features/services/useServices'

/** Public catalog (SRV-2). No login needed. */
export default function ServicesPage() {
  const { services, loading, error } = useServices()

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Our services</h1>

      {error && <Alert kind="error">{error}</Alert>}
      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {!loading && !error && services.length === 0 && (
        <p className="text-sm text-slate-500">No services have been added yet.</p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <li key={s.id} className="rounded-md border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">{s.name}</h2>
            <p className="mt-1 text-lg text-blue-700">{formatPrice(s.price)}</p>
            <Link
              to={`/orders/new?service=${s.id}`}
              className="mt-3 inline-block rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Order
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
