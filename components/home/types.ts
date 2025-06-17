export type SectorStatus = "pendiente" | "en proceso" | "completado"
export type SectorType = "Poda" | "Corte de pasto"

export interface SectorPolygon {
  id: string
  name: string
  status: SectorStatus
  type: SectorType
  path: { lat: number; lng: number }[] // Coordenadas para el polígono
  direccion?: string
  observaciones?: string
}
