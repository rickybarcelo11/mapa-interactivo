"use client"

import { memo, useEffect, useMemo, useRef, useCallback } from "react"
import { MapContainer, TileLayer, Polygon } from "react-leaflet"
import type { LatLngExpression } from "leaflet"
import "leaflet/dist/leaflet.css"

type LatLng = { lat: number; lng: number }

interface SectorLeafletThumbnailProps {
  path: LatLng[]
  height?: number | undefined
  className?: string
}

export default memo(function SectorLeafletThumbnail({ path, height, className }: SectorLeafletThumbnailProps) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const positions = useMemo<LatLngExpression[]>(() => {
    return (path ?? []).map((p) => [p.lat, p.lng]) as LatLngExpression[]
  }, [path])

  const doFit = useCallback(() => {
    const map = mapRef.current
    if (!map || positions.length === 0) return
    const L = require("leaflet")
    try {
      // Asegurar que Leaflet conozca el tamaño real del contenedor
      if (typeof map.invalidateSize === "function") {
        map.invalidateSize()
      }
      const bounds = L.latLngBounds(positions as any)
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 19 })
    } catch {
      // no-op
    }
  }, [positions])

  // Ajuste inicial y reintentos (cuando se crea el sector por primera vez)
  useEffect(() => {
    if (!mapRef.current || positions.length === 0) return
    doFit()
    const timers = [50, 200, 450].map((ms) => setTimeout(doFit, ms))
    // Al estar listo el mapa y tiles
    if (typeof mapRef.current.whenReady === "function") {
      mapRef.current.whenReady(() => doFit())
    }
    return () => { timers.forEach(clearTimeout) }
  }, [positions, doFit])

  // Re-ajustar al cambiar el tamaño del contenedor (por layout o fuentes)
  useEffect(() => {
    if (!containerRef.current) return
    const ResizeObs = (window as any).ResizeObserver
    if (!ResizeObs) return
    const ro = new ResizeObs(() => doFit())
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [doFit])

  return (
    <div ref={containerRef} className={className} style={{ width: "100%", height: height ?? "100%", pointerEvents: "none", borderRadius: 8, overflow: "hidden", zIndex: 10 }}>
      <MapContainer
        ref={mapRef}
        center={positions.length ? (positions[0] as any) : ([0, 0] as any)}
        zoom={16}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={false}
        whenReady={() => doFit()}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {positions.length > 0 && (
          <Polygon
            positions={positions}
            pathOptions={{ color: "#38bdf8", weight: 2, fillOpacity: 0.35 }}
          />
        )}
      </MapContainer>
    </div>
  )
})


