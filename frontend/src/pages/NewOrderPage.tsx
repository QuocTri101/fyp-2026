import { useNavigate, useSearchParams } from 'react-router-dom'
import { notificationsApi } from '../api/notifications'
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

    // The order is placed. Emailing the QR code is a bonus, so a failure here must not look like
    // a failed order. (The API answers "order placed" without the new id, so the newest order is used.)
    let notice = 'Order placed.'
    try {
      const mine = await ordersApi.listForClient(user.id)
      const newest = mine.reduce((a, b) => (b.id > a.id ? b : a))
      notice = `Order placed. ${await notificationsApi.sendOrderConfirmation(newest.id)}`
    } catch {
      notice = 'Order placed. The confirmation email could not be sent. You can send it again from the QR code in My orders.'
    }
    navigate('/orders', { state: { notice } })
  }

  return (
    <>
      <PageHeader title="New order" description="Choose a service and a quantity. We email you a QR code to show on the day." />
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
