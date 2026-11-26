import { ean13Modules } from '../lib/ean13'

const QUIET = 9 // blank modules each side, as the EAN-13 standard requires
const BAR_HEIGHT = 46
const TEXT_ROOM = 12

interface BarcodeProps {
  code: string
  /** Width is set by the parent (for example "w-40"); the height follows. */
  className?: string
}

/** An EAN-13 barcode as SVG. Codes that are not a valid EAN-13 are shown as plain digits. */
export default function Barcode({ code, className = 'w-40' }: BarcodeProps) {
  const modules = ean13Modules(code)
  if (!modules) return <span className="font-mono text-sm tabular-nums">{code}</span>

  // Merge neighbouring black modules into one rectangle each.
  const bars: { x: number; width: number }[] = []
  for (let i = 0; i < modules.length; i++) {
    if (modules[i] !== '1') continue
    const last = bars[bars.length - 1]
    if (last && last.x + last.width === i) last.width += 1
    else bars.push({ x: i, width: 1 })
  }

  const width = modules.length + QUIET * 2
  const height = BAR_HEIGHT + TEXT_ROOM
  const textY = height - 2

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label={`Barcode ${code}`}
      fontFamily="'Public Sans', sans-serif"
      fontSize="9"
    >
      <rect width={width} height={height} fill="#fff" />
      {bars.map((b) => (
        <rect key={b.x} x={QUIET + b.x} y={2} width={b.width} height={BAR_HEIGHT - 2} fill="#14202B" />
      ))}
      {/* first digit sits in the left margin, then six digits under each half */}
      <text x={QUIET / 2} y={textY} textAnchor="middle" fill="#14202B">{code[0]}</text>
      <text x={QUIET + 24} y={textY} textAnchor="middle" textLength={40} lengthAdjust="spacing" fill="#14202B">
        {code.slice(1, 7)}
      </text>
      <text x={QUIET + 71} y={textY} textAnchor="middle" textLength={40} lengthAdjust="spacing" fill="#14202B">
        {code.slice(7)}
      </text>
    </svg>
  )
}
