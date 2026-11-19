import { ApiError, http } from './http'
import type { ApiResponse, RegisterRequest } from './types'

export const authApi = {
  /** Returns the JWT. The backend puts the token in Response.message. */
  async login(email: string, password: string): Promise<string> {
    const res = await http.post<ApiResponse>('/api/auth/login', { email, password })
    if (!res.flag) throw new ApiError(400, res.message)
    return res.message
  },

  /** Public sign-up always creates a Customer. Admins are created directly in the database. */
  async register(input: RegisterRequest): Promise<void> {
    const res = await http.post<ApiResponse>('/api/auth/register', {
      id: 0,
      role: 'Customer',
      ...input,
    })
    if (!res.flag) throw new ApiError(400, res.message)
  },
}
