import { useState } from 'react'
import { servicesApi } from '../api/services'
import type { Service, ServiceInput } from '../api/services'
import Alert from '../components/Alert'
import ServiceForm from '../features/services/ServiceForm'
import { useServices } from '../features/services/useServices'
import { formatPrice } from '../lib/format'

/** Admin CRUD for the service catalog (SRV-1). Route is guarded by RequireAuth(Admin). */
export default function AdminServicesPage() {
  const { services, loading, error, reload } = useServices()
  const [editing, setEditing] = useState<Service | 'new' | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function save(values: ServiceInput) {
    if (editing === null) return
    const message =
      editing === 'new'
        ? await servicesApi.create(values)
        : await servicesApi.update({ ...editing, ...values })
    setEditing(null)
    setActionError(null)
    setNotice(message)
    await reload()
  }

  async function remove(service: Service) {
    if (!window.confirm(`Delete "${service.name}"?`)) return
    setNotice(null)
    setActionError(null)
    try {
      setNotice(await servicesApi.remove(service))
      await reload()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not delete the service.')
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage services</h1>
        {editing === null && (
          <button
            type="button"
            onClick={() => {
              setNotice(null)
              setEditing('new')
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add service
          </button>
        )}
      </div>

      <div className="mb-4 space-y-2">
        {notice && <Alert kind="success">{notice}</Alert>}
        {actionError && <Alert kind="error">{actionError}</Alert>}
        {error && <Alert kind="error">{error}</Alert>}
      </div>

      {editing !== null && (
        <ServiceForm
          key={editing === 'new' ? 'new' : editing.id}
          initial={editing === 'new' ? undefined : editing}
          onSubmit={save}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {!loading && !error && services.length === 0 && (
        <p className="text-sm text-slate-500">No services yet. Use "Add service" to create one.</p>
      )}

      {services.length > 0 && (
        <table className="w-full overflow-hidden rounded-md border border-slate-200 bg-white text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Price</th>
              <th className="px-4 py-2 font-medium">Quantity</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {services.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2">{s.name}</td>
                <td className="px-4 py-2">{formatPrice(s.price)}</td>
                <td className="px-4 py-2">{s.quantity}</td>
                <td className="space-x-2 px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setNotice(null)
                      setEditing(s)
                    }}
                    className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(s)}
                    className="rounded-md border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
