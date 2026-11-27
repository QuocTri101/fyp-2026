/** Role names exactly as stored in the database / JWT. */
export const Roles = {
  Admin: 'Admin',
  Customer: 'Customer'
} as const

export function hasRole(userRole: string, allowed: readonly string[]): boolean {
  return allowed.some((r) => r.toLowerCase() === userRole.toLowerCase())
}
