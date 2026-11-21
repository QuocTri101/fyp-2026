/** A single figure with a label, used in summary strips. */
export default function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-sm text-steel">{label}</p>
      <p className="mt-1 font-display text-4xl font-semibold tabular-nums leading-none">{value}</p>
    </div>
  )
}
