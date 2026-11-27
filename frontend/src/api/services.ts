import { createCacheBuster } from './cache'
import { ApiError, http } from './http'
import type { ApiResponse } from './types'

/**
 * A car service in the catalog. Today this maps 1:1 to ProductApi's ProductDTO
 * (the UI says "service", the API still says "product"). Phase 2 renames it in the backend.
 */
export interface Service {
  id: number
  name: string
  quantity: number
  price: number
  /** EAN-13 printed on the item. The API creates one when the admin leaves it empty. */
  barcode?: string | null
  /** Small photo as a data URL (resized in the browser before upload), or null for the initials tile. */
  imageUrl?: string | null
}

export type ServiceInput = Omit<Service, 'id'>

const BASE = '/api/products'

const cache = createCacheBuster()

/** Writes answer with { flag, message }. Returns the message, or throws if flag is false. */
async function expectSuccess(request: Promise<ApiResponse>): Promise<string> {
  const res = await request
  if (!res.flag) throw new ApiError(400, res.message)
  cache.bust()
  return res.message
}

export const servicesApi = {
  async list(): Promise<Service[]> {
    try {
      return await http.get<Service[]>(BASE, cache.headers())
    } catch (err) {
      // ProductApi answers 404 when the table is empty. For the UI that is just "no services".
      if (err instanceof ApiError && err.status === 404) return []
      throw err
    }
  },

  /** What a barcode scanner does: scan, then look the service up. Null when no service has this code. */
  async findByBarcode(code: string): Promise<Service | null> {
    try {
      return await http.get<Service>(`${BASE}/barcode/${encodeURIComponent(code)}`, cache.headers())
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 400)) return null
      throw err
    }
  },

  create: (input: ServiceInput) => expectSuccess(http.post<ApiResponse>(BASE, { id: 0, ...input })),

  update: (service: Service) => expectSuccess(http.put<ApiResponse>(BASE, service)),

  // ProductApi's DELETE reads the whole object from the body (Phase 2: DELETE /{id}).
  remove: (service: Service) => expectSuccess(http.delete<ApiResponse>(BASE, service)),
}
