import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { invoicesApi } from '../api/invoices'
import type { Invoice } from '../api/invoices'
import { notificationsApi } from '../api/notifications'
import Alert from '../components/Alert'
import Button, { buttonClass } from '../components/Button'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../features/auth/AuthContext'
import { Roles, hasRole } from '../features/auth/roles'
import { useInvoices } from '../features/invoices/useInvoices'
import { useOrders } from '../features/orders/useOrders'
import ServiceThumb from '../features/services/ServiceThumb'
import { useServices } from '../features/services/useServices'
import PickupCodeDialog from '../features/orders/PickupCodeDialog'
import { formatOrderNo, formatPrice } from '../lib/format'

export default function InvoicesPage() {
  const { user } = useAuth()
  const isAdmin = !!user && hasRole(user.role, [Roles.Admin])
  const { invoices, loading, error } = useInvoices()
  const { orders } = useOrders()
  const { services } = useServices()

  // An invoice keeps only the service name, so its picture is found through the order it came from.
  const serviceByOrder = useMemo(() => {
    const byId = new Map(services.map((s) => [s.id, s]))
    return new Map(orders.map((o) => [o.id, byId.get(o.productId)]))
  }, [orders, services])

  const [notice, setNotice] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [workingId, setWorkingId] = useState<number | null>(null)
  const [showCode, setShowCode] = useState<Invoice | null>(null)

  async function run(invoice: Invoice, action: () => Promise<string | void>) {
    setWorkingId(invoice.id)
    setNotice(null)
    setActionError(null)
    try {
      const message = await action()
      if (message) setNotice(message)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setWorkingId(null)
    }
  }

  const sorted = [...invoices].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))

  return (
    <>
      <PageHeader
        title={isAdmin ? 'All invoices' : 'My invoices'}
        description="Download an invoice as a PDF or have it emailed to you."
      />

      <div className="mb-4 space-y-3">
        {notice && <Alert kind="success" onDismiss={() => setNotice(null)}>{notice}</Alert>}
        {(error || actionError) && <Alert kind="error">{error ?? actionError}</Alert>}
      </div>

      {loading ? (
        <div className="h-48 animate-pulse rounded-xl bg-chrome" />
      ) : sorted.length === 0 ? (
        !error && (
          <div className="rounded-xl border border-dashed border-line p-10 text-center">
            <p className="text-steel">There are no invoices yet. Make one from an order.</p>
            <Link to="/orders" className={`${buttonClass('primary')} mt-4`}>
              Go to orders
            </Link>
          </div>
        )
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-line bg-chrome/60 text-steel">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Invoice</th>
                <th scope="col" className="px-4 py-3 font-semibold">Order</th>
                <th scope="col" className="px-4 py-3 font-semibold">Service</th>
                {isAdmin && <th scope="col" className="px-4 py-3 font-semibold">Customer</th>}
                <th scope="col" className="px-4 py-3 text-right font-semibold">Total</th>
                <th scope="col" className="px-4 py-3 font-semibold">Issued</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sorted.map((i) => (
                <tr key={i.id}>
                  <td className="px-4 py-3 font-semibold tabular-nums">{i.invoiceNumber}</td>
                  <td className="px-4 py-3"><span className="plate">{formatOrderNo(i.orderId)}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ServiceThumb service={serviceByOrder.get(i.orderId)} name={i.serviceName} />
                      <span>{i.serviceName}</span>
                    </div>
                  </td>
                  {isAdmin && <td className="px-4 py-3">{i.customerName}</td>}
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatPrice(i.total)}</td>
                  <td className="px-4 py-3 text-steel">{new Date(i.issuedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={workingId === i.id}
                        onClick={() => run(i, () => invoicesApi.downloadPdf(i))}
                      >
                        Download PDF
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={workingId === i.id}
                        onClick={() => run(i, () => notificationsApi.sendInvoice(i.id))}
                      >
                        {workingId === i.id ? 'Working...' : 'Email'}
                      </Button>
                      {i.pickupCode && (
                        <Button variant="secondary" size="sm" onClick={() => setShowCode(i)}>
                          QR code
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PickupCodeDialog
        open={!!showCode}
        code={showCode?.pickupCode ?? ''}
        title={showCode ? `Order ${formatOrderNo(showCode.orderId)}: ${showCode.serviceName}` : ''}
        onClose={() => setShowCode(null)}
      />
    </>
  )
}
