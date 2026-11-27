import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { ordersApi } from '../api/orders'
import type { Order } from '../api/orders'
import type { Service } from '../api/services'
import Alert from '../components/Alert'
import Button from '../components/Button'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../features/auth/AuthContext'
import { Roles, hasRole } from '../features/auth/roles'
import ServiceThumb from '../features/services/ServiceThumb'
import { useServices } from '../features/services/useServices'
import { formatDateTime, formatOrderNo, normalizeCode } from '../lib/format'

const REFRESH_MS = 30_000

/**
 * The technician's screen. Scan the customer's QR code to start a job, then mark it finished when
 * the car is done. Payment is not here: the admin takes it at the counter.
 */
export default function JobsPage() {
  const { user } = useAuth()
  const isAdmin = !!user && hasRole(user.role, [Roles.Admin])
  const { services } = useServices()
  const inputRef = useRef<HTMLInputElement>(null)

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [scanned, setScanned] = useState<Order | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const serviceOf = (id: number) => services.find((s) => s.id === id)
  const nameOf = (o: Order) => serviceOf(o.productId)?.name ?? `Service ${o.productId}`
  const isMine = (o: Order) => !!user && o.technicianId === user.id
  const canFinish = (o: Order) => isAdmin || isMine(o)

  const load = useCallback(async () => {
    try {
      setOrders(await ordersApi.listAll())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the jobs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const timer = window.setInterval(() => void load(), REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [load])

  async function lookup(raw: string) {
    const clean = normalizeCode(raw)
    if (!clean) return
    setError(null)
    setNotice(null)
    setScanned(null)
    if (clean.length !== 8) {
      setError('A pickup code has 8 letters and numbers.')
      return
    }
    setBusyId(0)
    try {
      const order = await ordersApi.findByCode(clean)
      if (order) setScanned(order)
      else setError(`No order has the code "${raw.trim()}". Check it and scan again.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not look up this code.')
    } finally {
      setBusyId(null)
      inputRef.current?.select()
    }
  }

  async function act(order: Order, action: () => Promise<string>) {
    setBusyId(order.id)
    setError(null)
    setNotice(null)
    try {
      setNotice(await action())
      await load()
      if (scanned?.pickupCode) setScanned(await ordersApi.findByCode(scanned.pickupCode))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not work. Try again.')
    } finally {
      setBusyId(null)
    }
  }

  const start = (o: Order) => act(o, () => ordersApi.start(o.pickupCode ?? ''))
  const finish = (o: Order) => act(o, () => ordersApi.finish(o.id))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    void lookup(code)
  }

  const oldestFirst = (a: Order, b: Order) => a.orderDate.localeCompare(b.orderDate)
  const inService = orders
    .filter((o) => o.status === 'InProgress')
    .sort((a, b) => Number(isMine(b)) - Number(isMine(a)) || oldestFirst(a, b))
  const booked = orders.filter((o) => o.status === 'Confirmed').sort(oldestFirst)
  const awaiting = orders.filter((o) => o.status === 'Done').sort(oldestFirst)

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Scan the customer's QR code when they arrive to start the job. Mark it finished when the work is done."
      />

      <form onSubmit={handleSubmit} className="max-w-xl">
        <label htmlFor="scan" className="mb-1.5 block text-sm font-semibold">
          Scan or type the customer's code
        </label>
        <div className="flex gap-3">
          <input
            id="scan"
            ref={inputRef}
            autoComplete="off"
            spellCheck={false}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="7K4M-9QX2"
            className="w-full rounded-md border border-line bg-white px-4 py-3 font-display text-2xl tracking-wide"
          />
          <Button type="submit" disabled={busyId === 0 || !code.trim()}>
            {busyId === 0 ? 'Looking...' : 'Look up'}
          </Button>
        </div>
      </form>

      <div className="mt-6 max-w-xl space-y-4">
        {notice && <Alert kind="success" onDismiss={() => setNotice(null)}>{notice}</Alert>}
        {error && <Alert kind="error" onDismiss={() => setError(null)}>{error}</Alert>}

        {scanned && (
          <section className="overflow-hidden rounded-xl border border-line bg-white" aria-label="Order found">
            <div className={`h-1.5 ${scanned.status === 'Redeemed' ? 'bg-ok' : 'hazard'}`} aria-hidden />
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="plate">{formatOrderNo(scanned.id)}</span>
                <StatusBadge status={scanned.status} />
              </div>
              <div className="flex items-center gap-3">
                <ServiceThumb service={serviceOf(scanned.productId)} name={nameOf(scanned)} />
                <div>
                  <p className="font-display text-3xl font-semibold leading-tight">{nameOf(scanned)}</p>
                  <p className="text-steel">Quantity {scanned.purchaseQuantity}</p>
                </div>
              </div>

              {scanned.status === 'Confirmed' && (
                <Button className="w-full" disabled={busyId === scanned.id} onClick={() => start(scanned)}>
                  {busyId === scanned.id ? 'Working...' : 'Start service'}
                </Button>
              )}
              {scanned.status === 'InProgress' &&
                (canFinish(scanned) ? (
                  <Button className="w-full" disabled={busyId === scanned.id} onClick={() => finish(scanned)}>
                    {busyId === scanned.id ? 'Working...' : 'Mark finished'}
                  </Button>
                ) : (
                  <p className="rounded-lg bg-chrome px-4 py-3 text-sm">
                    Another technician (#{scanned.technicianId}) started this job. Only they can finish it.
                  </p>
                ))}
              {scanned.status === 'Done' && (
                <p className="rounded-lg bg-chrome px-4 py-3 text-sm">
                  The work is finished. Send the customer to the counter to pay.
                </p>
              )}
              {scanned.status === 'Redeemed' && (
                <p className="rounded-lg bg-bad/5 px-4 py-3 text-sm font-semibold text-bad">
                  This order is already paid and closed. Do not start it again.
                </p>
              )}
            </div>
          </section>
        )}
      </div>

      {loading ? (
        <div className="mt-8 h-40 animate-pulse rounded-xl bg-chrome" />
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <JobList title="In service" empty="No job is being worked on." orders={inService} serviceOf={serviceOf}>
            {(o) => (
              <>
                <p className="text-sm text-steel">{isMine(o) ? 'Your job' : `Technician #${o.technicianId}`}</p>
                {canFinish(o) && (
                  <Button size="sm" disabled={busyId === o.id} onClick={() => finish(o)}>
                    {busyId === o.id ? 'Working...' : 'Mark finished'}
                  </Button>
                )}
              </>
            )}
          </JobList>

          <JobList
            title="Booked"
            empty="Nobody is booked right now."
            orders={booked.slice(0, 15)}
            extra={booked.length - 15}
            serviceOf={serviceOf}
          >
            {() => <p className="text-sm text-steel">Waiting for the customer</p>}
          </JobList>

          <JobList title="Waiting for payment" empty="No finished job is waiting." orders={awaiting} serviceOf={serviceOf}>
            {() => <p className="text-sm text-steel">Customer pays at the counter</p>}
          </JobList>
        </div>
      )}
    </>
  )
}

interface JobListProps {
  title: string
  empty: string
  orders: Order[]
  extra?: number
  serviceOf: (productId: number) => Service | undefined
  children: (order: Order) => ReactNode
}

function JobList({ title, empty, orders, extra = 0, serviceOf, children }: JobListProps) {
  return (
    <section aria-label={title}>
      <h2 className="mb-3 font-display text-2xl">
        {title} <span className="text-steel">({orders.length + Math.max(extra, 0)})</span>
      </h2>
      {orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-5 text-sm text-steel">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const service = serviceOf(o.productId)
            const name = service?.name ?? `Service ${o.productId}`
            return (
              <li key={o.id} className="rounded-xl border border-line bg-white p-4">
                <div className="flex items-center gap-3">
                  <ServiceThumb service={service} name={name} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{name}</p>
                    <p className="text-sm text-steel">
                      <span className="plate">{formatOrderNo(o.id)}</span> · Qty {o.purchaseQuantity}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-steel">Booked {formatDateTime(o.orderDate)}</p>
                <div className="mt-3 flex items-center justify-between gap-3">{children(o)}</div>
              </li>
            )
          })}
          {extra > 0 && <li className="text-sm text-steel">And {extra} more booked.</li>}
        </ul>
      )}
    </section>
  )
}
