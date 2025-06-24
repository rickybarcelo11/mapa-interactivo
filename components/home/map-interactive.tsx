"use client"

import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { SectorPolygon } from "@/src/types"

interface MapInteractiveProps {
  sectors: SectorPolygon[]
  onPolygonClick: (sector: SectorPolygon) => void
}

// Helper para convertir lat/lng a [lat, lng] para Leaflet
const toLatLngArray = (path: { lat: number; lng: number }[]) =>
  path.map((p) => [p.lat, p.lng] as [number, number])

export default function MapInteractive({ sectors, onPolygonClick }: MapInteractiveProps) {
  // Centro y zoom inicial (puedes ajustarlo según tus datos)
  const center: [number, number] = [-34.6037, -58.3816]
  const zoom = 14

  return (
    <div className="flex-grow rounded-lg shadow-xl relative overflow-hidden">
      <MapContainer center={center} zoom={zoom} style={{ width: "100%", height: "100%" }} className="absolute inset-0 z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {sectors.map((sector) => (
          <Polygon
            key={sector.id}
            positions={toLatLngArray(sector.path)}
            pathOptions={{
              color:
                sector.status === "pendiente"
                  ? "#ef4444"
                  : sector.status === "en proceso"
                  ? "#eab308"
                  : "#22c55e",
              fillOpacity: 0.5,
            }}
            eventHandlers={{
              click: () => onPolygonClick(sector),
            }}
          />
        ))}
      </MapContainer>
    </div>
  )
}

// Nota: Si usas Next.js, asegúrate de que este componente solo se renderice en el cliente (ya está con "use client").
// Si necesitas ajustar la proyección de coordenadas, puedes hacerlo en toLatLngArray o usando una librería como proj4. 