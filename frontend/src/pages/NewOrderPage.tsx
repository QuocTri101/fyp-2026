import { useNavigate, useSearchParams } from 'react-router-dom'
import { ordersApi } from '../api/orders'
import type { OrderInput } from '../api/orders'
import Alert from '../components/Alert'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../features/auth/AuthContext'
import OrderForm from '../features/orders/OrderForm'
import { useServices } from '../features/services/useServices'

export default function NewOrderPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { services, loading, error } = useServices()
  const preselected = Number(params.get('service')) || 0

  async function handleSubmit(input: OrderInput) {
    if (user?.id == null) throw new Error('Your session has no user id. Please log out and log in again.')
    await ordersApi.create(user.id, input)
    navigate('/orders', { state: { notice: 'Order placed.' } })
  }

  return (
    <>
      <PageHeader title="New order" description="Choose a service and a quantity." />
      <div className="max-w-xl rounded-xl border border-line bg-white p-6">
        {error && <Alert kind="error">{error}</Alert>}
        {loading ? (
          <div className="h-48 animate-pulse rounded bg-chrome" />
        ) : (
          <OrderForm
            services={services}
            initial={preselected ? { productId: preselected, purchaseQuantity: 1 } : undefined}
            submitLabel="Place order"
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
          />
        )}
      </div>
    </>
  )
}
