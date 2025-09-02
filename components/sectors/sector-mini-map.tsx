"use client"

import { memo, useMemo } from "react"

type LatLng = { lat: number; lng: number }

interface SectorMiniMapProps {
  path: LatLng[]
  className?: string
  width?: number
  height?: number
}

// Proyección simple a SVG (equirectangular local) para previsualización rápida
export default memo(function SectorMiniMap({ path, className, width = 320, height = 160 }: SectorMiniMapProps) {
  const { pointsAttr, hasData } = useMemo(() => {
    if (!path || path.length === 0) return { pointsAttr: "", hasData: false }

    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity
    for (const p of path) {
      if (p.lat < minLat) minLat = p.lat
      if (p.lat > maxLat) maxLat = p.lat
      if (p.lng < minLng) minLng = p.lng
      if (p.lng > maxLng) maxLng = p.lng
    }

    // Evitar división por cero en polígonos muy pequeños/degenerados
    const latRange = Math.max(1e-6, maxLat - minLat)
    const lngRange = Math.max(1e-6, maxLng - minLng)

    // Padding del 8% del tamaño
    const padX = 0.08 * width
    const padY = 0.08 * height
    const innerW = width - padX * 2
    const innerH = height - padY * 2

    const toX = (lng: number) => padX + ((lng - minLng) / lngRange) * innerW
    const toY = (lat: number) => padY + ((maxLat - lat) / latRange) * innerH

    const points = path.map(({ lat, lng }) => `${toX(lng)},${toY(lat)}`)
    return { pointsAttr: points.join(" "), hasData: true }
  }, [path, width, height])

  return (
    <div className={className} style={{ width: "100%", height }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" className="rounded-md">
        {/* Fondo sutil */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />
        {hasData ? (
          <polygon
            points={pointsAttr}
            fill="rgba(56,189,248,0.25)" /* sky-400/25 */
            stroke="rgb(56,189,248)"
            strokeWidth={2}
          />
        ) : (
          <text x={width / 2} y={height / 2} textAnchor="middle" fill="#94a3b8" fontSize="14">
            Sin polígono
          </text>
        )}
      </svg>
    </div>
  )
})


