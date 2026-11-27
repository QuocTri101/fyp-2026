import { Link } from 'react-router-dom'
import { buttonClass } from '../../components/Button'
import { formatPrice } from '../../lib/format'
import type { Service } from '../../api/services'
import ServiceTile from './ServiceTile'

export default function ServiceCard({ service }: { service: Service }) {
  const soldOut = service.quantity <= 0
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-white">
      <ServiceTile name={service.name} src={service.imageUrl} className="h-40 w-full" />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-2xl leading-tight">{service.name}</h3>
        <p className={`mt-1 text-sm ${soldOut ? 'text-bad' : 'text-steel'}`}>
          {soldOut ? 'Fully booked' : `${service.quantity} available`}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <p className="font-display text-3xl font-semibold tabular-nums">{formatPrice(service.price)}</p>
          {soldOut ? (
            <span className="text-sm text-steel">Unavailable</span>
          ) : (
            <Link
              to={`/orders/new?service=${service.id}`}
              className={buttonClass('primary', 'sm')}
            >
              Order
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
