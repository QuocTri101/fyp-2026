import { Link } from 'react-router-dom'
import { buttonClass } from '../components/Button'
import { useAuth } from '../features/auth/AuthContext'
import PriceBoard from '../features/services/PriceBoard'
import { useServices } from '../features/services/useServices'

export default function HomePage() {
  const { user } = useAuth()
  const { services, loading } = useServices()
  const featured = services.slice(0, 5)

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h1 className="text-6xl leading-[0.92] sm:text-7xl lg:text-8xl">
            Your car, back on the road sooner.
          </h1>
          <p className="mt-5 max-w-prose text-lg text-steel">
            Pick a service, place your order and track it from your account. Prices are listed up front.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/services" className={buttonClass('primary')}>
              Browse services
            </Link>
            {user ? (
              <Link to="/orders" className={buttonClass('secondary')}>
                My orders
              </Link>
            ) : (
              <Link to="/register" className={buttonClass('secondary')}>
                Create an account
              </Link>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="h-72 animate-pulse rounded-xl bg-chrome" aria-label="Loading prices" />
          ) : featured.length > 0 ? (
            <PriceBoard services={featured} />
          ) : (
            <div className="rounded-xl border border-dashed border-line p-8 text-steel">
              No services yet. An admin can add the first one under Manage services.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 border-t border-line pt-10 sm:grid-cols-3">
        {[
          ['Choose', 'Pick from the catalog. Each service shows its price and how many are available.'],
          ['Order', 'Place the order in one form. The total is calculated before you confirm.'],
          ['Follow up', 'Edit or cancel your orders any time from My orders.'],
        ].map(([title, text]) => (
          <div key={title}>
            <h2 className="text-3xl">{title}</h2>
            <p className="mt-1 text-steel">{text}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
