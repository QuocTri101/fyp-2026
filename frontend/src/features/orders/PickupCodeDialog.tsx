import { useState } from 'react'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import QrCode from '../../components/QrCode'
import StatusBadge from '../../components/StatusBadge'
import { formatPickupCode } from '../../lib/format'

interface PickupCodeDialogProps {
  open: boolean
  code: string
  /** For example "Order #0007: Oil change". */
  title: string
  /** Redeemed codes are greyed out: staff will refuse them. */
  redeemed?: boolean
  /** Sends the code by email and returns the confirmation message. */
  onEmail?: () => Promise<string>
  onClose: () => void
}

export default function PickupCodeDialog({ open, code, title, redeemed = false, onEmail, onClose }: PickupCodeDialogProps) {
  return (
    <Modal open={open} title="Pickup code" onClose={onClose}>
      <Body code={code} title={title} redeemed={redeemed} onEmail={onEmail} onClose={onClose} />
    </Modal>
  )
}

function Body({ code, title, redeemed, onEmail, onClose }: Omit<PickupCodeDialogProps, 'open'>) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  async function handleEmail() {
    if (!onEmail) return
    setBusy(true)
    setMessage(null)
    try {
      setMessage({ kind: 'success', text: await onEmail() })
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Could not send the email.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4 text-center">
      <p className="font-semibold">{title}</p>

      <div className={redeemed ? 'opacity-40' : ''}>
        <QrCode value={code} size={220} />
      </div>

      <p className="font-display text-4xl font-semibold tracking-widest">{formatPickupCode(code)}</p>

      {redeemed ? (
        <div className="flex items-center justify-center gap-2 text-sm text-steel">
          <StatusBadge status="Redeemed" /> This code was already used.
        </div>
      ) : (
        <p className="text-sm text-steel">Show this QR code to our staff. If it will not scan, read the code out loud.</p>
      )}

      {message && <Alert kind={message.kind}>{message.text}</Alert>}

      <div className="flex justify-center gap-3 pt-2">
        {onEmail && !redeemed && (
          <Button variant="secondary" onClick={handleEmail} disabled={busy}>
            {busy ? 'Sending...' : 'Email this code'}
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  )
}
