import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import Alert from '../components/Alert'
import AuthShell from '../components/AuthShell'
import Button from '../components/Button'
import FormField from '../components/FormField'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phoneNumber: '', address: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    setBusy(true)
    try {
      await authApi.register({ ...form, name: form.name.trim(), email: form.email.trim() })
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the account.')
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Create an account"
      subtitle="It takes a minute."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-ink underline decoration-signal decoration-2 underline-offset-2">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert kind="error">{error}</Alert>}
        <FormField label="Full name" autoComplete="name" required value={form.name} onChange={set('name')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Phone" type="tel" autoComplete="tel" required value={form.phoneNumber} onChange={set('phoneNumber')} />
          <FormField label="Email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
        </div>
        <FormField label="Address" autoComplete="street-address" required value={form.address} onChange={set('address')} />
        <FormField label="Password" type="password" autoComplete="new-password" required hint="At least 6 characters." value={form.password} onChange={set('password')} />
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Creating...' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  )
}
