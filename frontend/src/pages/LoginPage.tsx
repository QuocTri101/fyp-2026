import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import type { Location } from 'react-router-dom'
import Alert from '../components/Alert'
import FormField from '../components/FormField'
import { useAuth } from '../features/auth/AuthContext'

interface LocationState {
  from?: Location
  registered?: boolean
}

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const state = useLocation().state as LocationState | null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      const from = state?.from
      navigate(from ? `${from.pathname}${from.search}` : '/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">Log in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {state?.registered && <Alert kind="success">Account created. You can log in now.</Alert>}
        {error && <Alert kind="error">{error}</Alert>}

        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        No account?{' '}
        <Link to="/register" className="text-blue-700 hover:underline">
          Register
        </Link>
      </p>
    </section>
  )
}
