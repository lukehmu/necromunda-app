import { useMemo } from 'react'
import { encode } from 'uqr'

/**
 * QR code as a single SVG path. Always dark modules on a light ground, in both
 * themes: phone cameras read that far more reliably than inverted codes.
 */
export const QrCode = ({
  value,
  label,
  size = 176,
}: {
  value: string
  label: string
  size?: number
}) => {
  const { path, modules } = useMemo(() => {
    const { data, size: count } = encode(value, { border: 2, ecc: 'M' })
    let d = ''
    data.forEach((row, y) => {
      row.forEach((dark, x) => {
        if (dark) d += `M${x} ${y}h1v1h-1z`
      })
    })
    return { path: d, modules: count }
  }, [value])

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${modules} ${modules}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className="rounded-[2px]"
    >
      <rect width={modules} height={modules} fill="#f1f0ec" />
      <path d={path} fill="#1b1a18" />
    </svg>
  )
}
