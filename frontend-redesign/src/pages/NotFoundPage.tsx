import { Link } from 'react-router-dom'
import { buttonClass } from '../components/Button'

export default function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <p className="font-display text-9xl font-bold leading-none">404</p>
      <p className="mt-4 text-steel">This page does not exist or has moved.</p>
      <Link to="/" className={`${buttonClass('primary')} mt-6`}>
        Go to the home page
      </Link>
    </div>
  )
}
