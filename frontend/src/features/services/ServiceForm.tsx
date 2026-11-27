import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Service, ServiceInput } from '../../api/services'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import FormField from '../../components/FormField'
import { fileToDataUrl } from '../../lib/image'
import ServiceTile from './ServiceTile'

interface ServiceFormProps {
  initial?: Service
  onSubmit: (input: ServiceInput) => Promise<void>
  onCancel: () => void
}

export default function ServiceForm({ initial, onSubmit, onCancel }: ServiceFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [price, setPrice] = useState(initial ? String(initial.price) : '')
  const [quantity, setQuantity] = useState(initial ? String(initial.quantity) : '')
  const [barcode, setBarcode] = useState(initial?.barcode ?? '')
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePicture(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // lets the admin pick the same file again after removing it
    if (!file) return
    setError(null)
    try {
      setImageUrl(await fileToDataUrl(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read the picture.')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const priceNum = Number(price)
    const qtyNum = Number(quantity)
    if (!name.trim()) return setError('Enter a service name.')
    if (!Number.isFinite(priceNum) || priceNum <= 0) return setError('Price must be greater than 0.')
    if (!Number.isInteger(qtyNum) || qtyNum < 0) return setError('Availability must be a whole number, 0 or more.')
    const code = barcode.replace(/\s/g, '')
    if (code && !/^\d{8,14}$/.test(code)) return setError('A barcode has 8 to 14 digits.')

    setBusy(true)
    try {
      await onSubmit({ name: name.trim(), price: priceNum, quantity: qtyNum, barcode: code || null, imageUrl })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the service.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <Alert kind="error">{error}</Alert>}
      <div className="flex items-center gap-4">
        <ServiceTile name={name || 'Service'} src={imageUrl} className="h-20 w-20 shrink-0 rounded-lg border border-line" textClass="text-2xl" />
        <div>
          <p className="text-sm font-semibold">Picture</p>
          <p className="text-sm text-steel">PNG, JPEG or WebP. It is shrunk before it is saved.</p>
          <div className="mt-2 flex gap-2">
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold hover:bg-chrome focus-within:ring-2 focus-within:ring-ink">
              {imageUrl ? 'Change' : 'Choose picture'}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handlePicture} />
            </label>
            {imageUrl && (
              <Button variant="secondary" size="sm" onClick={() => setImageUrl(null)}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
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
      <FormField
        label="Barcode"
        inputMode="numeric"
        placeholder="Optional"
        hint="Scan the code printed on the item, or leave it empty and one is created for you."
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
      />
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
