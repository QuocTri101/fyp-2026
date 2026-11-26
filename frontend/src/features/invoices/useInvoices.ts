import { useCallback, useEffect, useState } from 'react'
import { invoicesApi } from '../../api/invoices'
import type { Invoice } from '../../api/invoices'

/** Admins get every invoice, everyone else only their own (the API decides from the sign-in token). */
export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setInvoices(await invoicesApi.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load invoices.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { invoices, loading, error, reload }
}
