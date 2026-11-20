/**
 * The gateway caches GET responses for 60 seconds, keyed on the value of the
 * `eCommerce-Caching-Control` request header (see ocelot.json). After every write we
 * change that value so the next read bypasses the stale cached copy.
 * Create one buster per API module (services, orders).
 */
export function createCacheBuster() {
  let version = 'v0'
  return {
    headers: (): Record<string, string> => ({ 'eCommerce-Caching-Control': version }),
    bust: (): void => {
      version = `v${Date.now()}`
    },
  }
}
