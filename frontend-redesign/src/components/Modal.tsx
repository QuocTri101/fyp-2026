import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { CloseIcon } from './icons'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * Uses the browser's native <dialog>: it traps focus, closes on Esc and blocks the page behind it.
 * Children are only rendered while open, so forms start fresh each time.
 */
export default function Modal({ open, title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // A click on the dimmed backdrop targets the dialog element itself.
        if (e.target === ref.current) onClose()
      }}
      className="max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-ink/50"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="text-2xl">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1.5 text-steel hover:bg-chrome hover:text-ink"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="p-5">{open ? children : null}</div>
    </dialog>
  )
}
