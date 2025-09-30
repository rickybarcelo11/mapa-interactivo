import { z } from 'zod'
import { SECTOR_TYPES, SECTOR_STATUSES } from '@/src/utils/status'

// Esquema base para coordenadas geográficas
export const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90, "Latitud debe estar entre -90 y 90"),
  lng: z.number().min(-180).max(180, "Longitud debe estar entre -180 y 180")
})

// Esquema para el polígono del sector
export const sectorPolygonSchema = z.object({
  id: z.string().optional(), // Opcional para creación
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d\-\.]+$/, "El nombre solo puede contener letras, números, espacios, guiones y puntos"),
  type: z.enum([...SECTOR_TYPES] as ["Poda", "Corte de pasto"], {
    errorMap: () => ({ message: "El tipo debe ser 'Poda' o 'Corte de pasto'" })
  }),
  status: z.enum([...SECTOR_STATUSES] as ["pendiente", "en proceso", "completado"], {
    errorMap: () => ({ message: "El estado debe ser 'pendiente', 'en proceso' o 'completado'" })
  }),
  path: z.array(coordinateSchema)
    .min(3, "El polígono debe tener al menos 3 puntos")
    .max(100, "El polígono no puede tener más de 100 puntos"),
  direccion: z.string()
    .max(200, "La dirección no puede exceder 200 caracteres")
    .optional(),
  observaciones: z.string()
    .max(1000, "Las observaciones no pueden exceder 1000 caracteres")
    .optional()
})

// Esquema para crear un nuevo sector (sin ID)
export const createSectorSchema = sectorPolygonSchema.omit({ id: true })

// Esquema para actualizar un sector existente
export const updateSectorSchema = sectorPolygonSchema.partial().extend({
  id: z.string("El ID del sector es requerido para actualización")
})

// Esquema para filtros de sectores
export const sectorFiltersSchema = z.object({
  name: z.string().optional(),
  type: z.enum(["todos", ...SECTOR_TYPES] as ["todos", "Poda", "Corte de pasto"]).optional(),
  status: z.enum(["todos", ...SECTOR_STATUSES] as ["todos", "pendiente", "en proceso", "completado"]).optional(),
  direccion: z.string().optional()
})

// Esquema para validar datos de formulario de sector
export const sectorFormSchema = z.object({
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d\-\.]+$/, "El nombre solo puede contener letras, números, espacios, guiones y puntos"),
  type: z.enum([...SECTOR_TYPES] as ["Poda", "Corte de pasto"], {
    errorMap: () => ({ message: "El tipo debe ser 'Poda' o 'Corte de pasto'" })
  }),
  status: z.enum([...SECTOR_STATUSES] as ["pendiente", "en proceso", "completado"], {
    errorMap: () => ({ message: "El estado debe ser 'pendiente', 'en proceso' o 'completado'" })
  }),
  direccion: z.string()
    .max(200, "La dirección no puede exceder 200 caracteres")
    .optional(),
  observaciones: z.string()
    .max(1000, "Las observaciones no pueden exceder 1000 caracteres")
    .optional()
})

// Tipos inferidos de los esquemas
export type SectorPolygonValidated = z.infer<typeof sectorPolygonSchema>
export type CreateSectorData = z.infer<typeof createSectorSchema>
export type UpdateSectorData = z.infer<typeof updateSectorSchema>
export type SectorFilters = z.infer<typeof sectorFiltersSchema>
export type SectorFormData = z.infer<typeof sectorFormSchema>

// Función helper para validar sector
export const validateSector = (data: unknown): SectorPolygonValidated => {
  return sectorPolygonSchema.parse(data)
}

// Función helper para validar creación de sector
export const validateCreateSector = (data: unknown): CreateSectorData => {
  return createSectorSchema.parse(data)
}

// Función helper para validar actualización de sector
export const validateUpdateSector = (data: unknown): UpdateSectorData => {
  return updateSectorSchema.parse(data)
}

// Función helper para validar filtros
export const validateSectorFilters = (data: unknown): SectorFilters => {
  return sectorFiltersSchema.parse(data)
}

// Función helper para validar formulario
export const validateSectorForm = (data: unknown): SectorFormData => {
  return sectorFormSchema.parse(data)
}
