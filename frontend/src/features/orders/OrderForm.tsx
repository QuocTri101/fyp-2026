import { useState } from 'react'
import type { FormEvent } from 'react'
import type { OrderInput } from '../../api/orders'
import type { Service } from '../../api/services'
import Alert from '../../components/Alert'
import FormField from '../../components/FormField'
import SelectField from '../../components/SelectField'
import { formatPrice } from '../../lib/format'

interface OrderFormProps {
  services: Service[]
  /** Values when editing an existing order. */
  initial?: OrderInput
  /** Service to preselect on a new order (from the "Order" button on the services page). */
  defaultServiceId?: number
  submitLabel: string
  onSubmit: (values: OrderInput) => Promise<void>
  onCancel: () => void
}

export default function OrderForm({
  services,
  initial,
  defaultServiceId,
  submitLabel,
  onSubmit,
  onCancel,
}: OrderFormProps) {
  const startId = initial?.productId ?? defaultServiceId
  const [serviceId, setServiceId] = useState(startId ? String(startId) : '')
  const [quantity, setQuantity] = useState(String(initial?.purchaseQuantity ?? 1))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const selected = services.find((s) => String(s.id) === serviceId)
  const total = selected ? selected.price * (Number(quantity) || 0) : null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSubmit({ productId: Number(serviceId), purchaseQuantity: Number(quantity) })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the order.')
      setSaving(false)
    }
    // On success the parent closes the form or leaves the page.
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 max-w-xl space-y-4 rounded-md border border-slate-200 bg-white p-4"
    >
      {error && <Alert kind="error">{error}</Alert>}

      <SelectField
        label="Service"
        name="service"
        required
        value={serviceId}
        onChange={(e) => setServiceId(e.target.value)}
      >
        <option value="">Choose a service...</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} ({formatPrice(s.price)})
          </option>
        ))}
      </SelectField>

      <FormField
        label="Quantity"
        name="quantity"
        type="number"
        min="1"
        step="1"
        required
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      {total !== null && (
        <p className="text-sm text-slate-600">
          Total: <span className="font-semibold text-slate-900">{formatPrice(total)}</span>
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
