import { useState } from 'react'
import { servicesApi } from '../api/services'
import type { Service, ServiceInput } from '../api/services'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Barcode from '../components/Barcode'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import ServiceForm from '../features/services/ServiceForm'
import { useServices } from '../features/services/useServices'
import { formatPrice } from '../lib/format'

export default function AdminServicesPage() {
  const { services, loading, error, reload } = useServices()
  const [notice, setNotice] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState<Service | null>(null)
  const [busy, setBusy] = useState(false)

  const openAdd = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (s: Service) => { setEditing(s); setFormOpen(true) }

  async function handleSave(input: ServiceInput) {
    if (editing) await servicesApi.update({ ...editing, ...input })
    else await servicesApi.create(input)
    setFormOpen(false)
    setNotice(editing ? 'Service updated.' : 'Service added.')
    await reload()
  }

  async function handleDelete() {
    if (!deleting) return
    setBusy(true)
    setActionError(null)
    try {
      await servicesApi.remove(deleting)
      setDeleting(null)
      setNotice('Service deleted.')
      await reload()
    } catch (err) {
      setDeleting(null)
      setActionError(err instanceof Error ? err.message : 'Could not delete the service.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Manage services"
        description="Add, edit or remove what customers can order."
        actions={<Button onClick={openAdd}>Add service</Button>}
      />

      <div className="mb-4 space-y-3">
        {notice && <Alert kind="success" onDismiss={() => setNotice(null)}>{notice}</Alert>}
        {(error || actionError) && <Alert kind="error">{error ?? actionError}</Alert>}
      </div>

      {loading ? (
        <div className="h-48 animate-pulse rounded-xl bg-chrome" />
      ) : services.length === 0 ? (
        !error && (
          <div className="rounded-xl border border-dashed border-line p-10 text-center">
            <p className="text-steel">No services yet.</p>
            <Button className="mt-4" onClick={openAdd}>Add the first service</Button>
          </div>
        )
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line bg-chrome/60 text-steel">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Service</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Price</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Available</th>
                <th scope="col" className="px-4 py-3 font-semibold">Barcode</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {services.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-semibold">{s.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPrice(s.price)}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${s.quantity <= 0 ? 'text-bad' : ''}`}>{s.quantity}</td>
                  <td className="px-4 py-3">
                    {s.barcode ? <Barcode code={s.barcode} className="w-32" /> : <span className="text-steel">Not set. Save the service to create one.</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(s)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleting(s)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={formOpen} title={editing ? 'Edit service' : 'Add service'} onClose={() => setFormOpen(false)}>
        <ServiceForm initial={editing ?? undefined} onSubmit={handleSave} onCancel={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this service?"
        message={deleting ? `"${deleting.name}" will be removed from the catalog.` : ''}
        confirmLabel="Delete service"
        cancelLabel="Keep it"
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}
