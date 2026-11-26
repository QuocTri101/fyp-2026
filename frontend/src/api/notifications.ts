import { ApiError, http } from './http'
import type { ApiResponse } from './types'

const BASE = '/api/notifications'

/** Both calls return the API's message, for example "Confirmation sent to t**@gmail.com." */
async function expectSuccess(request: Promise<ApiResponse>): Promise<string> {
  const res = await request
  if (!res.flag) throw new ApiError(400, res.message)
  return res.message
}

export const notificationsApi = {
  /** Emails the customer their order details and pickup QR code. */
  sendOrderConfirmation: (orderId: number) =>
    expectSuccess(http.post<ApiResponse>(`${BASE}/orders/${orderId}/confirmation`)),

  /** Emails the customer their invoice as a PDF. */
  sendInvoice: (invoiceId: number) =>
    expectSuccess(http.post<ApiResponse>(`${BASE}/invoices/${invoiceId}/email`)),
}
