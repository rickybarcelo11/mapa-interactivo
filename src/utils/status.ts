import type { SectorStatus, SectorType } from "@/src/types"

// Normalización de estados (DB <-> UI)
export const mapSectorStatusToUi = (status: string): SectorStatus => {
  if (status === 'en_proceso') return 'en proceso'
  if (status === 'pendiente' || status === 'completado') return status
  return 'pendiente'
}

export const mapSectorStatusToDb = (status: SectorStatus): 'pendiente' | 'en_proceso' | 'completado' => {
  return status === 'en proceso' ? 'en_proceso' : status
}

export const mapSectorTypeToUi = (type: string): SectorType => {
  return type === 'Corte_de_pasto' ? 'Corte de pasto' : 'Poda'
}

export const mapSectorTypeToDb = (type: SectorType): 'Poda' | 'Corte_de_pasto' => {
  return type === 'Corte de pasto' ? 'Corte_de_pasto' : 'Poda'
}

// Listas estandarizadas para selects/UI
export const SECTOR_TYPES: readonly SectorType[] = [
  'Poda',
  'Corte de pasto',
] as const

export const SECTOR_STATUSES: readonly SectorStatus[] = [
  'pendiente',
  'en proceso',
  'completado',
] as const


