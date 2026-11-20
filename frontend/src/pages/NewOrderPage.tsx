import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ordersApi } from '../api/orders'
import type { OrderInput } from '../api/orders'
import Alert from '../components/Alert'
import { useAuth } from '../features/auth/AuthContext'
import OrderForm from '../features/orders/OrderForm'
import { useServices } from '../features/services/useServices'

/** Create an order. Reached from the "Order" button on a service, or from "New order". */
export default function NewOrderPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { services, loading, error } = useServices()

  const preselected = Number(params.get('service')) || undefined

  async function create(values: OrderInput) {
    if (user?.id == null) {
      throw new Error('Your session has no user id. Please log out and log in again.')
    }
    await ordersApi.create(user.id, values)
    navigate('/orders', { replace: true, state: { created: true } })
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">New order</h1>

      {error && <Alert kind="error">{error}</Alert>}
      {loading && <p className="text-sm text-slate-500">Loading...</p>}

      {!loading && !error && services.length === 0 && (
        <p className="text-sm text-slate-500">
          There are no services to order yet.{' '}
          <Link to="/services" className="text-blue-700 hover:underline">
            Back to services
          </Link>
        </p>
      )}

      {!loading && services.length > 0 && (
        <OrderForm
          services={services}
          defaultServiceId={preselected}
          submitLabel="Place order"
          onSubmit={create}
          onCancel={() => navigate(-1)}
        />
      )}
    </section>
  )
}
