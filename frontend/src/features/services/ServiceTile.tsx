import { initials } from '../../lib/format'

/** Placeholder artwork until services get photos: the service's initials on a yellow tile. */
export default function ServiceTile({ name, className = '' }: { name: string; className?: string }) {
  return (
    <div
      aria-hidden
      className={`grid place-items-center bg-signal font-display text-5xl font-bold text-ink ${className}`}
    >
      {initials(name)}
    </div>
  )
}
