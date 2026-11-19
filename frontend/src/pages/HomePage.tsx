import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <section className="py-8">
      <h1 className="text-3xl font-bold">Car Service</h1>
      <p className="mt-2 max-w-xl text-slate-600">
        Browse car services, book an appointment and follow its status.
      </p>

      {!user && (
        <div className="mt-6 flex gap-3">
          <Link
            to="/login"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Create an account
          </Link>
        </div>
      )}
    </section>
  )
}
