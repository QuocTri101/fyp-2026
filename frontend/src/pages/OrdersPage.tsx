import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ordersApi } from '../api/orders'
import type { Order, OrderInput } from '../api/orders'
import Alert from '../components/Alert'
import OrderForm from '../features/orders/OrderForm'
import { useOrders } from '../features/orders/useOrders'
import { useServices } from '../features/services/useServices'
import { formatPrice } from '../lib/format'

/** Customers see their own orders, admins see all of them. */
export default function OrdersPage() {
  const { orders, loading, error, reload, isAdmin } = useOrders()
  const { services, error: servicesError } = useServices()
  const created = (useLocation().state as { created?: boolean } | null)?.created

  const [editing, setEditing] = useState<Order | null>(null)
  const [notice, setNotice] = useState<string | null>(created ? 'Order placed successfully.' : null)
  const [actionError, setActionError] = useState<string | null>(null)

  const serviceById = new Map(services.map((s) => [s.id, s]))

  async function save(values: OrderInput) {
    if (editing === null) return
    const message = await ordersApi.update({ ...editing, ...values })
    setEditing(null)
    setActionError(null)
    setNotice(message)
    await reload()
  }

  async function cancelOrder(order: Order) {
    if (!window.confirm(`Cancel order #${order.id}?`)) return
    setNotice(null)
    setActionError(null)
    try {
      setNotice(await ordersApi.remove(order))
      await reload()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not cancel the order.')
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isAdmin ? 'All orders' : 'My orders'}</h1>
        {editing === null && (
          <Link
            to="/orders/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            New order
          </Link>
        )}
      </div>

      <div className="mb-4 space-y-2">
        {notice && <Alert kind="success">{notice}</Alert>}
        {actionError && <Alert kind="error">{actionError}</Alert>}
        {error && <Alert kind="error">{error}</Alert>}
        {servicesError && <Alert kind="error">{servicesError}</Alert>}
      </div>

      {editing !== null && (
        <>
          <h2 className="mb-2 text-lg font-semibold">Edit order #{editing.id}</h2>
          <OrderForm
            key={editing.id}
            services={services}
            initial={{ productId: editing.productId, purchaseQuantity: editing.purchaseQuantity }}
            submitLabel="Save"
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </>
      )}

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="text-sm text-slate-500">
          No orders yet.{' '}
          <Link to="/services" className="text-blue-700 hover:underline">
            Browse services
          </Link>
        </p>
      )}

      {orders.length > 0 && (
        <table className="w-full overflow-hidden rounded-md border border-slate-200 bg-white text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-4 py-2 font-medium">Order</th>
              {isAdmin && <th className="px-4 py-2 font-medium">Customer</th>}
              <th className="px-4 py-2 font-medium">Service</th>
              <th className="px-4 py-2 font-medium">Quantity</th>
              <th className="px-4 py-2 font-medium">Total</th>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((o) => {
              const service = serviceById.get(o.productId)
              return (
                <tr key={o.id}>
                  <td className="px-4 py-2">#{o.id}</td>
                  {isAdmin && <td className="px-4 py-2">#{o.clientId}</td>}
                  <td className="px-4 py-2">{service?.name ?? `Service #${o.productId}`}</td>
                  <td className="px-4 py-2">{o.purchaseQuantity}</td>
                  <td className="px-4 py-2">
                    {service ? formatPrice(service.price * o.purchaseQuantity) : '-'}
                  </td>
                  <td className="px-4 py-2">{new Date(o.orderDate).toLocaleString()}</td>
                  <td className="space-x-2 px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setNotice(null)
                        setEditing(o)
                      }}
                      className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelOrder(o)}
                      className="rounded-md border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </section>
  )
}
