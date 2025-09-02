"use client"

import { memo, useEffect, useMemo, useRef } from "react"
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

  const positions = useMemo<LatLngExpression[]>(() => {
    return (path ?? []).map((p) => [p.lat, p.lng]) as LatLngExpression[]
  }, [path])

  useEffect(() => {
    if (!mapRef.current || positions.length === 0) return
    const L = require("leaflet")
    const doFit = () => {
      const bounds = L.latLngBounds(positions as any)
      // Deja que Leaflet elija el mejor zoom posible, pero permite acercar bastante
      mapRef.current.fitBounds(bounds, { padding: [24, 24], maxZoom: 19 })
    }
    doFit()
    // Reintentar tras un tick por si el contenedor cambió de tamaño
    const t = setTimeout(doFit, 50)
    return () => clearTimeout(t)
  }, [positions])

  return (
    <div className={className} style={{ width: "100%", height: height ?? "100%", pointerEvents: "none", borderRadius: 8, overflow: "hidden", zIndex: 10 }}>
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


