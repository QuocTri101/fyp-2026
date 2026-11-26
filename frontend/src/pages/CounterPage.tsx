import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ordersApi } from '../api/orders'
import type { Order } from '../api/orders'
import { servicesApi } from '../api/services'
import type { Service } from '../api/services'
import Alert from '../components/Alert'
import Barcode from '../components/Barcode'
import Button from '../components/Button'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { useServices } from '../features/services/useServices'
import { formatDateTime, formatOrderNo, formatPickupCode, formatPrice, normalizeCode } from '../lib/format'

type Result = { kind: 'order'; order: Order } | { kind: 'service'; service: Service }

/**
 * The checkout counter. A USB scanner types the code and presses Enter, exactly like a keyboard,
 * so a focused text box is all it needs. Typing the code by hand works the same way.
 */
export default function CounterPage() {
  const { services } = useServices()
  const inputRef = useRef<HTMLInputElement>(null)

  const [code, setCode] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const serviceOf = (id: number) => services.find((s) => s.id === id)

  async function lookup(raw: string) {
    const clean = normalizeCode(raw)
    if (!clean) return
    setBusy(true)
    setError(null)
    setNotice(null)
    setResult(null)
    try {
      // A pickup code has 8 characters; a product barcode has 8 to 14 digits.
      // An 8-digit code could be either, so orders are tried first.
      if (clean.length === 8) {
        const order = await ordersApi.findByCode(clean)
        if (order) return setResult({ kind: 'order', order })
      }
      if (/^\d{8,14}$/.test(clean)) {
        const service = await servicesApi.findByBarcode(clean)
        if (service) return setResult({ kind: 'service', service })
      }
      setError(`Nothing matches "${raw.trim()}". Check the code and scan again.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not look up this code.')
    } finally {
      setBusy(false)
      inputRef.current?.select() // the next scan replaces this one
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    void lookup(code)
  }

  async function handleRedeem(order: Order) {
    if (!order.pickupCode) return
    setBusy(true)
    setError(null)
    try {
      await ordersApi.redeem(order.pickupCode)
      const fresh = await ordersApi.findByCode(order.pickupCode)
      if (fresh) setResult({ kind: 'order', order: fresh })
      setNotice(`Order ${formatOrderNo(order.id)} redeemed.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not redeem the order.')
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  return (
    <>
      <PageHeader
        title="Counter"
        description="Scan a customer's QR code to hand over their service, or scan a product barcode to look it up."
      />

      <form onSubmit={handleSubmit} className="max-w-xl">
        <label htmlFor="scan" className="mb-1.5 block text-sm font-semibold">
          Scan or type a code
        </label>
        <div className="flex gap-3">
          <input
            id="scan"
            ref={inputRef}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="7K4M-9QX2 or 2000000000015"
            className="w-full rounded-md border border-line bg-white px-4 py-3 font-display text-2xl tracking-wide"
          />
          <Button type="submit" disabled={busy || !code.trim()}>
            {busy ? 'Looking...' : 'Look up'}
          </Button>
        </div>
      </form>

      <div className="mt-6 max-w-xl space-y-4">
        {notice && <Alert kind="success" onDismiss={() => setNotice(null)}>{notice}</Alert>}
        {error && <Alert kind="error">{error}</Alert>}

        {result?.kind === 'order' && (
          <OrderResult order={result.order} service={serviceOf(result.order.productId)} busy={busy} onRedeem={handleRedeem} />
        )}
        {result?.kind === 'service' && <ServiceResult service={result.service} />}
      </div>
    </>
  )
}

function OrderResult({
  order,
  service,
  busy,
  onRedeem,
}: {
  order: Order
  service?: Service
  busy: boolean
  onRedeem: (order: Order) => void
}) {
  const redeemed = order.status === 'Redeemed'
  const total = (service?.price ?? 0) * order.purchaseQuantity

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white" aria-label="Order found">
      <div className={`h-1.5 ${redeemed ? 'bg-ok' : 'hazard'}`} aria-hidden />
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="plate">{formatOrderNo(order.id)}</span>
          <StatusBadge status={order.status} />
        </div>

        <div>
          <p className="font-display text-3xl font-semibold leading-tight">{service?.name ?? `Service ${order.productId}`}</p>
          <p className="text-steel">
            Quantity {order.purchaseQuantity}
            {service && ` · Total ${formatPrice(total)}`}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-steel">Customer</dt>
            <dd className="font-semibold tabular-nums">#{order.clientId}</dd>
          </div>
          <div>
            <dt className="text-steel">Ordered</dt>
            <dd className="font-semibold">{formatDateTime(order.orderDate)}</dd>
          </div>
          {order.pickupCode && (
            <div>
              <dt className="text-steel">Code</dt>
              <dd className="font-semibold tracking-widest">{formatPickupCode(order.pickupCode)}</dd>
            </div>
          )}
          {redeemed && order.redeemedAt && (
            <div>
              <dt className="text-steel">Redeemed</dt>
              <dd className="font-semibold">{formatDateTime(order.redeemedAt)}</dd>
            </div>
          )}
        </dl>

        {redeemed ? (
          <p className="rounded-lg bg-bad/5 px-4 py-3 text-sm font-semibold text-bad">
            This code was already used. Do not hand over the service again.
          </p>
        ) : (
          <Button className="w-full" disabled={busy} onClick={() => onRedeem(order)}>
            {busy ? 'Working...' : 'Redeem order'}
          </Button>
        )}
      </div>
    </section>
  )
}

function ServiceResult({ service }: { service: Service }) {
  return (
    <section className="rounded-xl border border-line bg-white p-5" aria-label="Product found">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-3xl font-semibold leading-tight">{service.name}</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{formatPrice(service.price)}</p>
          <p className={`text-sm ${service.quantity <= 0 ? 'text-bad' : 'text-steel'}`}>
            {service.quantity <= 0 ? 'Fully booked' : `${service.quantity} available`}
          </p>
        </div>
        {service.barcode && <Barcode code={service.barcode} className="w-44" />}
      </div>
    </section>
  )
}
