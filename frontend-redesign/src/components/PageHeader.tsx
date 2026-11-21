import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl sm:text-5xl">{title}</h1>
        {description && <p className="mt-1 max-w-prose text-steel">{description}</p>}
      </div>
      {actions}
    </div>
  )
}
