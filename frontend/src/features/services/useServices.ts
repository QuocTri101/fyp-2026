import { useCallback, useEffect, useState } from 'react'
import { servicesApi } from '../../api/services'
import type { Service } from '../../api/services'

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setServices(await servicesApi.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load services.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { services, loading, error, reload }
}
