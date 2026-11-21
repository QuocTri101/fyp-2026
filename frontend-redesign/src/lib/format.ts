/**
 * Optional currency for prices. Create frontend/.env with, for example:
 *   VITE_CURRENCY=VND      (or USD, EUR ...)
 * Without it prices show as plain numbers with two decimals.
 */
const CURRENCY = import.meta.env.VITE_CURRENCY as string | undefined

export function formatPrice(value: number): string {
  if (CURRENCY) {
    return value.toLocaleString(undefined, { style: 'currency', currency: CURRENCY })
  }
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

/** #0007 style order number. */
export function formatOrderNo(id: number): string {
  return `#${String(id).padStart(4, '0')}`
}

/** "Tri Quoc" -> "TQ", "tester" -> "T" */
export function initials(text: string): string {
  const parts = text.trim().split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? '?')[0]
  return letters.toUpperCase()
}
