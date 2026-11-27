import { initials } from '../../lib/format'

interface ServiceTileProps {
  name: string
  /** The service's photo. Without one, the initials on a yellow tile stand in. */
  src?: string | null
  className?: string
  textClass?: string
}

export default function ServiceTile({ name, src, className = '', textClass = 'text-5xl' }: ServiceTileProps) {
  if (src) return <img src={src} alt="" loading="lazy" className={`object-cover ${className}`} />
  return (
    <div
      aria-hidden
      className={`grid place-items-center bg-signal font-display font-bold text-ink ${textClass} ${className}`}
    >
      {initials(name)}
    </div>
  )
}
