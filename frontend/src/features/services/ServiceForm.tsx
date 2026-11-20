import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Service, ServiceInput } from '../../api/services'
import Alert from '../../components/Alert'
import FormField from '../../components/FormField'

interface ServiceFormProps {
  /** Present when editing, absent when creating. */
  initial?: Service
  onSubmit: (values: ServiceInput) => Promise<void>
  onCancel: () => void
}

export default function ServiceForm({ initial, onSubmit, onCancel }: ServiceFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [price, setPrice] = useState(initial ? String(initial.price) : '')
  const [quantity, setQuantity] = useState(initial ? String(initial.quantity) : '1')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSubmit({ name: name.trim(), price: Number(price), quantity: Number(quantity) })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the service.')
      setSaving(false)
    }
    // On success the parent closes the form, so there is nothing to reset here.
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 space-y-4 rounded-md border border-slate-200 bg-white p-4"
    >
      <h2 className="text-lg font-semibold">{initial ? 'Edit service' : 'New service'}</h2>
      {error && <Alert kind="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          label="Name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField
          label="Price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
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
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save'}
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
