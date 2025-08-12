import { z } from 'zod'

// Esquema para coordenadas geográficas (reutilizado de sector-schemas)
export const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90, "Latitud debe estar entre -90 y 90"),
  lng: z.number().min(-180).max(180, "Longitud debe estar entre -180 y 180")
})

// Esquema para lados de acera
export const sidewalkSideSchema = z.enum(["Norte", "Sur", "Este", "Oeste", "Ambas", "Ninguna"], {
  errorMap: () => ({ message: "Debe seleccionar un lado de acera válido" })
})

// Esquema para estado del árbol
export const treeStatusSchema = z.enum([
  "Sano", 
  "Enfermo", 
  "Necesita Poda", 
  "Seco", 
  "Recién Plantado", 
  "Malo"
], {
  errorMap: () => ({ message: "Debe seleccionar un estado válido del árbol" })
})

// Esquema para estado general de sección
export const generalStatusSchema = z.enum([
  "Bueno", 
  "Regular", 
  "Malo", 
  "Necesita Intervención"
], {
  errorMap: () => ({ message: "Debe seleccionar un estado general válido" })
})

// Esquema para fechas (formato ISO string)
export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe estar en formato YYYY-MM-DD")
  .refine((date) => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, "La fecha debe ser válida")

// Esquema para árboles individuales
export const individualTreeSchema = z.object({
  id: z.string().optional(), // Opcional para creación
  species: z.string()
    .min(2, "La especie debe tener al menos 2 caracteres")
    .max(100, "La especie no puede exceder 100 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]+$/, "La especie solo puede contener letras, espacios, guiones y puntos"),
  status: treeStatusSchema,
  streetName: z.string()
    .min(2, "El nombre de la calle debe tener al menos 2 caracteres")
    .max(200, "El nombre de la calle no puede exceder 200 caracteres"),
  streetNumber: z.string()
    .min(1, "El número de calle es requerido")
    .max(20, "El número de calle no puede exceder 20 caracteres"),
  sidewalk: sidewalkSideSchema.optional(),
  location: coordinateSchema.optional(),
  plantingDate: dateSchema.optional(),
  lastPruningDate: dateSchema.optional(),
  observations: z.string()
    .max(1000, "Las observaciones no pueden exceder 1000 caracteres")
    .optional()
})

// Esquema para secciones de árboles
export const treeSectionSchema = z.object({
  id: z.string().optional(),
  addressRange: z.string()
    .min(1, "El rango de direcciones es requerido")
    .max(50, "El rango de direcciones no puede exceder 50 caracteres"),
  sidewalkSide: sidewalkSideSchema,
  predominantSpecies: z.string()
    .min(2, "La especie predominante debe tener al menos 2 caracteres")
    .max(100, "La especie predominante no puede exceder 100 caracteres"),
  treeCount: z.number()
    .int("El conteo de árboles debe ser un número entero")
    .min(0, "El conteo de árboles no puede ser negativo")
    .max(1000, "El conteo de árboles no puede exceder 1000"),
  generalStatus: generalStatusSchema
})

// Esquema para calles con secciones
export const streetWithSectionsSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(2, "El nombre de la calle debe tener al menos 2 caracteres")
    .max(200, "El nombre de la calle no puede exceder 200 caracteres"),
  sections: z.array(treeSectionSchema)
    .min(1, "Debe tener al menos una sección")
    .max(100, "No puede tener más de 100 secciones")
})

// Esquema para crear un nuevo árbol (sin ID)
export const createTreeSchema = individualTreeSchema.omit({ id: true })

// Esquema para actualizar un árbol existente
export const updateTreeSchema = individualTreeSchema.partial().extend({
  id: z.string("El ID del árbol es requerido para actualización")
})

// Esquema para filtros de árboles
export const treeFiltersSchema = z.object({
  species: z.string().optional(),
  status: z.enum(["todos"]).or(treeStatusSchema).optional(),
  address: z.string().optional(),
  freeText: z.string().optional()
})

// Esquema para formulario de árbol
export const treeFormSchema = z.object({
  species: z.string()
    .min(2, "La especie debe tener al menos 2 caracteres")
    .max(100, "La especie no puede exceder 100 caracteres"),
  status: treeStatusSchema,
  streetName: z.string()
    .min(2, "El nombre de la calle debe tener al menos 2 caracteres")
    .max(200, "El nombre de la calle no puede exceder 200 caracteres"),
  streetNumber: z.string()
    .min(1, "El número de calle es requerido")
    .max(20, "El número de calle no puede exceder 20 caracteres"),
  sidewalk: sidewalkSideSchema.optional(),
  plantingDate: dateSchema.optional(),
  lastPruningDate: dateSchema.optional(),
  observations: z.string().max(1000, "Las observaciones no pueden exceder 1000 caracteres").optional()
})

// Tipos inferidos de los esquemas
export type IndividualTreeValidated = z.infer<typeof individualTreeSchema>
export type TreeSectionValidated = z.infer<typeof treeSectionSchema>
export type StreetWithSectionsValidated = z.infer<typeof streetWithSectionsSchema>
export type CreateTreeData = z.infer<typeof createTreeSchema>
export type UpdateTreeData = z.infer<typeof updateTreeSchema>
export type TreeFilters = z.infer<typeof treeFiltersSchema>
export type TreeFormData = z.infer<typeof treeFormSchema>

// Función helper para validar árbol individual
export const validateIndividualTree = (data: unknown): IndividualTreeValidated => {
  return individualTreeSchema.parse(data)
}

// Función helper para validar creación de árbol
export const validateCreateTree = (data: unknown): CreateTreeData => {
  return createTreeSchema.parse(data)
}

// Función helper para validar actualización de árbol
export const validateUpdateTree = (data: unknown): UpdateTreeData => {
  return updateTreeSchema.parse(data)
}

// Función helper para validar filtros
export const validateTreeFilters = (data: unknown): TreeFilters => {
  return treeFiltersSchema.parse(data)
}

// Función helper para validar formulario
export const validateTreeForm = (data: unknown): TreeFormData => {
  return treeFormSchema.parse(data)
}

// Función helper para validar sección de árbol
export const validateTreeSection = (data: unknown): TreeSectionValidated => {
  return treeSectionSchema.parse(data)
}

// Función helper para validar calle con secciones
export const validateStreetWithSections = (data: unknown): StreetWithSectionsValidated => {
  return streetWithSectionsSchema.parse(data)
}

// Validación de fechas de árbol
export const validateTreeDates = (plantingDate?: string, lastPruningDate?: string): boolean => {
  if (!plantingDate || !lastPruningDate) return true // Si alguna fecha es opcional, es válido
  
  const planting = new Date(plantingDate)
  const pruning = new Date(lastPruningDate)
  
  return pruning >= planting
}
