import { createCacheBuster } from './cache'
import { ApiError, http } from './http'
import type { ApiResponse } from './types'

/**
 * An order as OrderApi stores it. The UI shows it as "order" for now; the ERD may turn it
 * into a booking (time slot, status) in Phase 2.
 */
export interface Order {
  id: number
  productId: number
  clientId: number
  purchaseQuantity: number
  orderDate: string
  /** The text inside the customer's QR code. Set by the server. */
  pickupCode: string | null
  status: OrderStatus
  redeemedAt: string | null
}

/** Confirmed: placed online, service not received yet. Redeemed: staff scanned the QR code. */
export type OrderStatus = 'Confirmed' | 'Redeemed'

/** What the user chooses. The id, client and date are filled in by this module. */
export interface OrderInput {
  productId: number
  purchaseQuantity: number
}

const BASE = '/api/orders'
const cache = createCacheBuster()

async function expectSuccess(request: Promise<ApiResponse>): Promise<string> {
  const res = await request
  if (!res.flag) throw new ApiError(400, res.message)
  cache.bust()
  return res.message
}

/** OrderApi answers 404 when nothing matches. For the UI that is just an empty list. */
async function getList(path: string): Promise<Order[]> {
  try {
    return await http.get<Order[]>(path, cache.headers())
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return []
    throw err
  }
}

export const ordersApi = {
  /** Every order (admin view). */
  listAll: () => getList(BASE),

  /** One customer's orders. */
  listForClient: (clientId: number) => getList(`${BASE}/client/${clientId}`),

  /** Staff: what does this QR code belong to? Null when no order has it. */
  async findByCode(code: string): Promise<Order | null> {
    try {
      return await http.get<Order>(`${BASE}/code/${encodeURIComponent(code)}`, cache.headers())
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 400)) return null
      throw err
    }
  },

  /** Staff: the customer got their service. Works once per code. */
  redeem: (code: string) => expectSuccess(http.post<ApiResponse>(`${BASE}/redeem`, { code })),

  create: (clientId: number, input: OrderInput) =>
    expectSuccess(
      http.post<ApiResponse>(BASE, {
        id: 0,
        clientId,
        orderDate: new Date().toISOString(),
        ...input,
      }),
    ),

  update: (order: Order) => expectSuccess(http.put<ApiResponse>(BASE, order)),

  // OrderApi's DELETE reads the whole object from the body (Phase 2: DELETE /{id}).
  remove: (order: Order) => expectSuccess(http.delete<ApiResponse>(BASE, order)),
}
