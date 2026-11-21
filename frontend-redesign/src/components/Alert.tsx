import type { ReactNode } from 'react'
import { AlertIcon, CheckIcon, CloseIcon } from './icons'

const styles = {
  error: 'border-bad/30 bg-bad/5 text-bad',
  success: 'border-ok/30 bg-ok/5 text-ok',
}

interface AlertProps {
  kind: keyof typeof styles
  children: ReactNode
  onDismiss?: () => void
}

export default function Alert({ kind, children, onDismiss }: AlertProps) {
  const Icon = kind === 'error' ? AlertIcon : CheckIcon
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${styles[kind]}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{children}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-m-1 rounded p-1 hover:bg-ink/5"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
