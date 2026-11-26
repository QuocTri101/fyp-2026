import { QRCodeSVG } from 'qrcode.react'

interface QrCodeProps {
  value: string
  /** Size in pixels. The SVG stays sharp at any size. */
  size?: number
  className?: string
}

/** White tile with a dark code: scanners need that contrast, so it ignores the page theme. */
export default function QrCode({ value, size = 220, className = '' }: QrCodeProps) {
  return (
    <div className={`inline-block rounded-lg border border-line bg-white p-3 ${className}`}>
      <QRCodeSVG value={value} size={size} level="Q" fgColor="#14202B" bgColor="#FFFFFF" title={`QR code ${value}`} />
    </div>
  )
}
