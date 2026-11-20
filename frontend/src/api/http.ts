import { tokenStorage } from './tokenStorage'

// Empty in development (Vite proxies /api to the gateway). For a deployed build
// set VITE_API_URL, e.g. https://api.example.com
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let unauthorizedHandler: (() => void) | null = null

/** Lets the auth layer sign the user out when the server rejects the token. */
export function onUnauthorized(handler: () => void): void {
  unauthorizedHandler = handler
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const headers: Record<string, string> = { ...extraHeaders }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = tokenStorage.get()
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is the API gateway running?')
  }

  const text = await res.text()
  const data = text ? parseJson(text) : undefined

  if (!res.ok) {
    if (res.status === 401 && token) unauthorizedHandler?.()
    throw new ApiError(res.status, errorMessage(res.status, data))
  }
  return data as T
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

/**
 * The backend answers errors in three shapes:
 *  - { flag, message }              shared Response record
 *  - { title, status, detail }      ProblemDetails (GlobalException)
 *  - { errors: { Field: [..] } }    model validation (400)
 */
function errorMessage(status: number, data: unknown): string {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    if (typeof d.message === 'string' && d.message) return d.message
    if (d.errors && typeof d.errors === 'object') {
      const messages = Object.values(d.errors as Record<string, unknown>)
        .flat()
        .filter((m): m is string => typeof m === 'string')
      if (messages.length) return messages.join(' ')
    }
    if (typeof d.detail === 'string' && d.detail) return d.detail
    if (typeof d.title === 'string' && d.title) return d.title
  }
  if (status === 401) return 'You are not signed in, or your session has expired.'
  if (status === 403) return 'You do not have permission to do this.'
  if (status === 404) return 'Not found.'
  if (status === 503) return 'The service is unavailable. Is the API running?'
  return `Request failed (${status}).`
}

export const http = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    request<T>('GET', path, undefined, headers),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string, body?: unknown) => request<T>('DELETE', path, body),
}
