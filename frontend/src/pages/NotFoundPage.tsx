import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="py-8">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Link to="/" className="mt-3 inline-block text-sm text-blue-700 hover:underline">
        Back to home
      </Link>
    </section>
  )
}
