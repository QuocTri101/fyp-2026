import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { invoicesApi } from '../api/invoices'
import { notificationsApi } from '../api/notifications'
import { ordersApi } from '../api/orders'
import type { Order, OrderInput } from '../api/orders'
import Alert from '../components/Alert'
import Button, { buttonClass } from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import Stat from '../components/Stat'
import StatusBadge from '../components/StatusBadge'
import OrderForm from '../features/orders/OrderForm'
import PickupCodeDialog from '../features/orders/PickupCodeDialog'
import { useOrders } from '../features/orders/useOrders'
import { useInvoices } from '../features/invoices/useInvoices'
import { useServices } from '../features/services/useServices'
import { formatDateTime, formatOrderNo, formatPrice } from '../lib/format'

export default function OrdersPage() {
  const { orders, loading, error, reload, isAdmin } = useOrders()
  const { services } = useServices()
  const { invoices, reload: reloadInvoices } = useInvoices()
  const location = useLocation()

  const [notice, setNotice] = useState<string | null>((location.state as { notice?: string } | null)?.notice ?? null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Order | null>(null)
  const [deleting, setDeleting] = useState<Order | null>(null)
  const [showCode, setShowCode] = useState<Order | null>(null)
  const [busy, setBusy] = useState(false)
  const [invoicingId, setInvoicingId] = useState<number | null>(null)

  const byId = useMemo(() => new Map(services.map((s) => [s.id, s])), [services])
  const invoiceByOrder = useMemo(() => new Map(invoices.map((i) => [i.orderId, i])), [invoices])
  const totalOf = (o: Order) => (byId.get(o.productId)?.price ?? 0) * o.purchaseQuantity
  const nameOf = (o: Order) => byId.get(o.productId)?.name ?? `Service ${o.productId}`
  const sorted = useMemo(() => [...orders].sort((a, b) => b.orderDate.localeCompare(a.orderDate)), [orders])
  const grandTotal = orders.reduce((sum, o) => sum + totalOf(o), 0)

  async function handleUpdate(input: OrderInput) {
    if (!editing) return
    await ordersApi.update({ ...editing, ...input })
    setEditing(null)
    setNotice('Order updated.')
    await reload()
  }

  async function handleDelete() {
    if (!deleting) return
    setBusy(true)
    setActionError(null)
    try {
      await ordersApi.remove(deleting)
      setDeleting(null)
      setNotice('Order cancelled.')
      await reload()
    } catch (err) {
      setDeleting(null)
      setActionError(err instanceof Error ? err.message : 'Could not cancel the order.')
    } finally {
      setBusy(false)
    }
  }

  async function handleMakeInvoice(order: Order) {
    setInvoicingId(order.id)
    setActionError(null)
    try {
      await invoicesApi.createFromOrder(order.id)
      setNotice(`Invoice created for order ${formatOrderNo(order.id)}.`)
      await reloadInvoices()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not create the invoice.')
    } finally {
      setInvoicingId(null)
    }
  }

  return (
    <>
      <PageHeader
        title={isAdmin ? 'All orders' : 'My orders'}
        description={isAdmin ? 'Every customer order.' : 'Orders you have placed. Show the QR code to receive your service.'}
        actions={
          <Link to="/orders/new" className={buttonClass('primary')}>
            New order
          </Link>
        }
      />

      <div className="mb-4 space-y-3">
        {notice && <Alert kind="success" onDismiss={() => setNotice(null)}>{notice}</Alert>}
        {(error || actionError) && <Alert kind="error">{error ?? actionError}</Alert>}
      </div>

      {orders.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <Stat label="Orders" value={String(orders.length)} />
          <Stat label="Total value" value={formatPrice(grandTotal)} />
        </div>
      )}

      {loading ? (
        <div className="h-48 animate-pulse rounded-xl bg-chrome" />
      ) : orders.length === 0 ? (
        !error && (
          <div className="rounded-xl border border-dashed border-line p-10 text-center">
            <p className="text-steel">You have not placed any orders yet.</p>
            <Link to="/services" className={`${buttonClass('primary')} mt-4`}>
              Browse services
            </Link>
          </div>
        )
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-line bg-chrome/60 text-steel">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Order</th>
                <th scope="col" className="px-4 py-3 font-semibold">Service</th>
                {isAdmin && <th scope="col" className="px-4 py-3 font-semibold">Customer</th>}
                <th scope="col" className="px-4 py-3 text-right font-semibold">Qty</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sorted.map((o) => {
                const redeemed = o.status === 'Redeemed'
                const invoice = invoiceByOrder.get(o.id)
                return (
                  <tr key={o.id}>
                    <td className="px-4 py-3"><span className="plate">{formatOrderNo(o.id)}</span></td>
                    <td className="px-4 py-3 font-semibold">{nameOf(o)}</td>
                    {isAdmin && <td className="px-4 py-3 tabular-nums">#{o.clientId}</td>}
                    <td className="px-4 py-3 text-right tabular-nums">{o.purchaseQuantity}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatPrice(totalOf(o))}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-steel">{formatDateTime(o.orderDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={!o.pickupCode}
                          title={o.pickupCode ? undefined : 'This order has no code yet. Edit and save it once to get one.'}
                          onClick={() => setShowCode(o)}
                        >
                          QR code
                        </Button>
                        {invoice ? (
                          <Link to="/invoices" className={buttonClass('secondary', 'sm')}>Invoice</Link>
                        ) : (
                          <Button variant="secondary" size="sm" disabled={invoicingId === o.id} onClick={() => handleMakeInvoice(o)}>
                            {invoicingId === o.id ? 'Making...' : 'Make invoice'}
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={redeemed}
                          title={redeemed ? 'A redeemed order cannot be changed.' : undefined}
                          onClick={() => setEditing(o)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={redeemed}
                          title={redeemed ? 'A redeemed order cannot be cancelled.' : undefined}
                          onClick={() => setDeleting(o)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <PickupCodeDialog
        open={!!showCode}
        code={showCode?.pickupCode ?? ''}
        title={showCode ? `Order ${formatOrderNo(showCode.id)}: ${nameOf(showCode)}` : ''}
        redeemed={showCode?.status === 'Redeemed'}
        onEmail={showCode ? () => notificationsApi.sendOrderConfirmation(showCode.id) : undefined}
        onClose={() => setShowCode(null)}
      />

      <Modal open={!!editing} title={editing ? `Edit order ${formatOrderNo(editing.id)}` : ''} onClose={() => setEditing(null)}>
        {editing && (
          <OrderForm
            services={services}
            initial={{ productId: editing.productId, purchaseQuantity: editing.purchaseQuantity }}
            submitLabel="Save changes"
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Cancel this order?"
        message={deleting ? `Order ${formatOrderNo(deleting.id)} will be removed. This cannot be undone.` : ''}
        confirmLabel="Cancel order"
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}
