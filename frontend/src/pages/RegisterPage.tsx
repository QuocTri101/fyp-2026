import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import type { RegisterRequest } from '../api/types'
import Alert from '../components/Alert'
import FormField from '../components/FormField'
import { useAuth } from '../features/auth/AuthContext'

const emptyForm: RegisterRequest = {
  name: '',
  phoneNumber: '',
  address: '',
  email: '',
  password: '',
}

export default function RegisterPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<RegisterRequest>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const bind = (field: keyof RegisterRequest) => ({
    name: field,
    value: form[field],
    onChange: (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value })),
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authApi.register(form)
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert kind="error">{error}</Alert>}

        <FormField label="Full name" autoComplete="name" required {...bind('name')} />
        <FormField label="Email" type="email" autoComplete="email" required {...bind('email')} />
        <FormField label="Phone number" type="tel" autoComplete="tel" required {...bind('phoneNumber')} />
        <FormField label="Address" autoComplete="street-address" required {...bind('address')} />
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          {...bind('password')}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already registered?{' '}
        <Link to="/login" className="text-blue-700 hover:underline">
          Log in
        </Link>
      </p>
    </section>
  )
}
