const KEY = 'carservice.token'

// localStorage can throw (private mode, blocked storage), so every access is guarded.
export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(KEY)
    } catch {
      return null
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(KEY, token)
    } catch {
      /* ignore: the user simply stays signed in for this tab only */
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  },
}
