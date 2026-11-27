import type { Service } from '../../api/services'
import ServiceTile from './ServiceTile'

/** A small square picture for table rows: the photo if there is one, otherwise the initials. */
export default function ServiceThumb({ service, name }: { service?: Service; name: string }) {
  return (
    <ServiceTile
      name={service?.name ?? name}
      src={service?.imageUrl}
      textClass="text-sm"
      className="h-10 w-10 shrink-0 rounded-md border border-line"
    />
  )
}
