import { createCacheBuster } from './cache'
import { ApiError, http } from './http'
import type { ApiResponse } from './types'

export type InvoiceStatus = 'Issued' | 'Paid' | 'Void'

export interface Invoice {
  id: number
  invoiceNumber: string
  orderId: number
  clientId: number
  customerName: string
  customerEmail: string
  customerAddress: string
  serviceName: string
  unitPrice: number
  quantity: number
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  issuedAt: string
  status: InvoiceStatus
  /** Copied from the order when the invoice was made. Null for orders from before QR codes. */
  pickupCode: string | null
}

const BASE = '/api/invoices'
const cache = createCacheBuster()

export const invoicesApi = {
  /** Admins get every invoice, everyone else only their own. */
  async list(): Promise<Invoice[]> {
    try {
      return await http.get<Invoice[]>(BASE, cache.headers())
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return []
      throw err
    }
  },

  /** One invoice per order. The API refuses a second one and says so in the message. */
  async createFromOrder(orderId: number): Promise<string> {
    const res = await http.post<ApiResponse>(`${BASE}/from-order/${orderId}`)
    if (!res.flag) throw new ApiError(400, res.message)
    cache.bust()
    return res.message
  },

  /** Admin: Issued, Paid or Void. */
  async setStatus(invoiceId: number, status: InvoiceStatus): Promise<string> {
    const res = await http.put<ApiResponse>(`${BASE}/${invoiceId}/status`, { status })
    if (!res.flag) throw new ApiError(400, res.message)
    cache.bust()
    return res.message
  },

  /** Downloads the PDF through the browser's normal save flow. */
  async downloadPdf(invoice: Invoice): Promise<void> {
    const blob = await http.getBlob(`${BASE}/${invoice.id}/pdf`)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${invoice.invoiceNumber}.pdf`
    link.click()
    URL.revokeObjectURL(url)
  },
}
