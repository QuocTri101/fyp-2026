type Tone = 'neutral' | 'good' | 'warn' | 'bad'

const tones: Record<Tone, string> = {
  neutral: 'border-line bg-chrome text-ink',
  good: 'border-ok/30 bg-ok/10 text-ok',
  warn: 'border-signal-deep/50 bg-signal/25 text-ink',
  bad: 'border-bad/30 bg-bad/10 text-bad',
}

/** Words that mean something per status. Shown as text, not only colour. */
const TONE_FOR: Record<string, Tone> = {
  Confirmed: 'warn',
  Redeemed: 'good',
  Issued: 'warn',
  Paid: 'good',
  Void: 'bad',
}

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[TONE_FOR[status] ?? 'neutral']}`}>
      {status}
    </span>
  )
}
