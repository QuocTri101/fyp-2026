import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Service } from '../../api/services'
import type { OrderInput } from '../../api/orders'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import FormField from '../../components/FormField'
import SelectField from '../../components/SelectField'
import { formatPrice } from '../../lib/format'

interface OrderFormProps {
  services: Service[]
  initial?: { productId: number; purchaseQuantity: number }
  submitLabel: string
  onSubmit: (input: OrderInput) => Promise<void>
  onCancel: () => void
}

export default function OrderForm({ services, initial, submitLabel, onSubmit, onCancel }: OrderFormProps) {
  const [productId, setProductId] = useState(initial?.productId ? String(initial.productId) : '')
  const [quantity, setQuantity] = useState(String(initial?.purchaseQuantity ?? 1))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selected = services.find((s) => s.id === Number(productId))
  const qtyNum = Number(quantity)
  const total = selected && Number.isInteger(qtyNum) && qtyNum > 0 ? selected.price * qtyNum : null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!selected) return setError('Choose a service.')
    if (!Number.isInteger(qtyNum) || qtyNum < 1) return setError('Quantity must be at least 1.')
    if (qtyNum > selected.quantity && selected.id !== initial?.productId)
      return setError(`Only ${selected.quantity} available for ${selected.name}.`)

    setBusy(true)
    try {
      await onSubmit({ productId: selected.id, purchaseQuantity: qtyNum })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the order.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <Alert kind="error">{error}</Alert>}
      <SelectField label="Service" value={productId} onChange={(e) => setProductId(e.target.value)}>
        <option value="">Choose a service</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} - {formatPrice(s.price)}
          </option>
        ))}
      </SelectField>
      <FormField label="Quantity" type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />

      <div className="flex items-baseline justify-between rounded-lg bg-chrome px-4 py-3">
        <span className="text-sm text-steel">Total</span>
        <span className="font-display text-3xl font-semibold tabular-nums">{total === null ? '-' : formatPrice(total)}</span>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
