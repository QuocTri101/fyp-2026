import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Service, ServiceInput } from '../../api/services'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import FormField from '../../components/FormField'

interface ServiceFormProps {
  initial?: Service
  onSubmit: (input: ServiceInput) => Promise<void>
  onCancel: () => void
}

export default function ServiceForm({ initial, onSubmit, onCancel }: ServiceFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [price, setPrice] = useState(initial ? String(initial.price) : '')
  const [quantity, setQuantity] = useState(initial ? String(initial.quantity) : '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const priceNum = Number(price)
    const qtyNum = Number(quantity)
    if (!name.trim()) return setError('Enter a service name.')
    if (!Number.isFinite(priceNum) || priceNum <= 0) return setError('Price must be greater than 0.')
    if (!Number.isInteger(qtyNum) || qtyNum < 0) return setError('Availability must be a whole number, 0 or more.')

    setBusy(true)
    try {
      await onSubmit({ name: name.trim(), price: priceNum, quantity: qtyNum })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the service.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <Alert kind="error">{error}</Alert>}
      <FormField label="Service name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
        <FormField
          label="Availability"
          type="number"
          min="0"
          step="1"
          hint="How many can be ordered."
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving...' : initial ? 'Save changes' : 'Add service'}
        </Button>
      </div>
    </form>
  )
}
