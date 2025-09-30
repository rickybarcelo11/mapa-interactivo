export const toLatLngArray = (path: { lat: number; lng: number }[]) =>
  path.map((p) => [p.lat, p.lng] as [number, number])

export const createDrawingPointDivIcon = () => {
  if (typeof window === "undefined") return undefined as any
  // require dinámico para evitar SSR
  const L = require("leaflet")
  return L.divIcon({
    className: 'drawing-point-marker',
    html: `<div style="
      width: 12px;
      height: 12px;
      background-color: #3b82f6;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  })
}


