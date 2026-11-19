export interface TokenUser {
  name: string
  email: string
  role: string
  /** Milliseconds since epoch, or null when the token has no expiry (current AuthApi behaviour). */
  expiresAt: number | null
}

// ASP.NET may write claims with short names or with the long schema URIs.
const NAME_KEYS = ['unique_name', 'name', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
const EMAIL_KEYS = ['email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
const ROLE_KEYS = ['role', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role']

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function pick(payload: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = payload[key]
    const first = Array.isArray(value) ? value[0] : value
    if (typeof first === 'string') return first
  }
  return ''
}

/** Reads the claims for display and route guarding only. The server still validates the token. */
export function parseToken(token: string): TokenUser | null {
  try {
    const payload = JSON.parse(decodeBase64Url(token.split('.')[1])) as Record<string, unknown>
    return {
      name: pick(payload, NAME_KEYS),
      email: pick(payload, EMAIL_KEYS),
      role: pick(payload, ROLE_KEYS),
      expiresAt: typeof payload.exp === 'number' ? payload.exp * 1000 : null,
    }
  } catch {
    return null
  }
}
