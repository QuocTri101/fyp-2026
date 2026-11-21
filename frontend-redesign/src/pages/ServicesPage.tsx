import { useMemo, useState } from 'react'
import Alert from '../components/Alert'
import PageHeader from '../components/PageHeader'
import SelectField from '../components/SelectField'
import { SearchIcon } from '../components/icons'
import ServiceCard from '../features/services/ServiceCard'
import { useServices } from '../features/services/useServices'

type Sort = 'name' | 'priceAsc' | 'priceDesc'

export default function ServicesPage() {
  const { services, loading, error } = useServices()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('name')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = services.filter((s) => s.name.toLowerCase().includes(q))
    return list.sort((a, b) =>
      sort === 'priceAsc' ? a.price - b.price : sort === 'priceDesc' ? b.price - a.price : a.name.localeCompare(b.name),
    )
  }, [services, query, sort])

  return (
    <>
      <PageHeader title="Services" description="Everything we offer, with prices. Choose one to order it." />

      <div className="mb-6 grid gap-4 sm:grid-cols-[1fr_14rem]">
        <div>
          <label htmlFor="search" className="mb-1.5 block text-sm font-semibold">
            Search
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
            <input
              id="search"
              type="search"
              placeholder="Oil change, brakes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-md border border-line bg-white py-2.5 pl-9 pr-3 text-sm"
            />
          </div>
        </div>
        <SelectField label="Sort by" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          <option value="name">Name</option>
          <option value="priceAsc">Price, low to high</option>
          <option value="priceDesc">Price, high to low</option>
        </SelectField>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-xl bg-chrome" />
          ))}
        </div>
      ) : visible.length === 0 && !error ? (
        <p className="rounded-xl border border-dashed border-line p-10 text-center text-steel">
          {services.length === 0 ? 'No services have been added yet.' : `No services match "${query}".`}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}
    </>
  )
}
