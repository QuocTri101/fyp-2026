import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { Service } from '../../api/services'
import { formatPrice } from '../../lib/format'

/** The workshop price board: one row per service, sliding in once on load. */
export default function PriceBoard({ services }: { services: Service[] }) {
  return (
    <div className="overflow-hidden rounded-xl bg-ink text-white">
      <div className="hazard h-2" aria-hidden />
      <p className="px-5 pb-1 pt-4 font-display text-2xl text-signal">Today's prices</p>
      <ul className="px-5 pb-3">
        {services.map((s, i) => (
          <li
            key={s.id}
            style={{ '--i': i } as CSSProperties}
            className="board-row flex items-baseline gap-3 border-b border-white/10 py-3 last:border-0"
          >
            <span className="font-display text-xl">{s.name}</span>
            <span className="flex-1 border-b border-dotted border-white/25" aria-hidden />
            <span className="font-display text-2xl font-semibold tabular-nums text-signal">
              {formatPrice(s.price)}
            </span>
          </li>
        ))}
      </ul>
      <div className="border-t border-white/10 px-5 py-3 text-sm">
        <Link to="/services" className="font-semibold text-signal hover:underline">
          See all services
        </Link>
      </div>
    </div>
  )
}
