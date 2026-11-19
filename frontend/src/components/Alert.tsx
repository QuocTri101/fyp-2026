import type { ReactNode } from 'react'

const styles = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-green-200 bg-green-50 text-green-800',
}

export default function Alert({
  kind,
  children,
}: {
  kind: keyof typeof styles
  children: ReactNode
}) {
  return (
    <p role="alert" className={`rounded-md border px-3 py-2 text-sm ${styles[kind]}`}>
      {children}
    </p>
  )
}
