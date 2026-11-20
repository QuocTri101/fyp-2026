import { useCallback, useEffect, useState } from 'react'
import { ordersApi } from '../../api/orders'
import type { Order } from '../../api/orders'
import { useAuth } from '../auth/AuthContext'
import { Roles, hasRole } from '../auth/roles'

/** Admins get every order, everyone else gets only their own. */
export function useOrders() {
  const { user } = useAuth()
  const isAdmin = !!user && hasRole(user.role, [Roles.Admin])
  const userId = user?.id ?? null

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    if (!isAdmin && userId === null) {
      setOrders([])
      setLoading(false)
      setError('Your session has no user id. Please log out and log in again.')
      return
    }
    setLoading(true)
    try {
      setOrders(isAdmin ? await ordersApi.listAll() : await ordersApi.listForClient(userId!))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load orders.')
    } finally {
      setLoading(false)
    }
  }, [isAdmin, userId])

  useEffect(() => {
    void reload()
  }, [reload])

  return { orders, loading, error, reload, isAdmin }
}
