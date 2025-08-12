import { z } from 'zod'

// Esquema para trabajadores
export const workerSchema = z.object({
  id: z.string().optional(), // Opcional para creación
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"),
  observaciones: z.string()
    .max(1000, "Las observaciones no pueden exceder 1000 caracteres")
    .optional()
})

// Esquema para crear un nuevo trabajador (sin ID)
export const createWorkerSchema = workerSchema.omit({ id: true })

// Esquema para actualizar un trabajador existente
export const updateWorkerSchema = workerSchema.partial().extend({
  id: z.string("El ID del trabajador es requerido para actualización")
})

// Esquema para filtros de trabajadores
export const workerFiltersSchema = z.object({
  name: z.string().optional(),
  hasActiveTasks: z.boolean().optional()
})

// Esquema para formulario de trabajador
export const workerFormSchema = z.object({
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"),
  observaciones: z.string()
    .max(1000, "Las observaciones no pueden exceder 1000 caracteres")
    .optional()
})

// Esquema para verificar si un trabajador puede ser eliminado
export const workerDeletionSchema = z.object({
  workerId: z.string("El ID del trabajador es requerido"),
  hasActiveTasks: z.boolean("Debe especificar si el trabajador tiene tareas activas")
})

// Tipos inferidos de los esquemas
export type WorkerValidated = z.infer<typeof workerSchema>
export type CreateWorkerData = z.infer<typeof createWorkerSchema>
export type UpdateWorkerData = z.infer<typeof updateWorkerSchema>
export type WorkerFilters = z.infer<typeof workerFiltersSchema>
export type WorkerFormData = z.infer<typeof workerFormSchema>
export type WorkerDeletionData = z.infer<typeof workerDeletionSchema>

// Función helper para validar trabajador
export const validateWorker = (data: unknown): WorkerValidated => {
  return workerSchema.parse(data)
}

// Función helper para validar creación de trabajador
export const validateCreateWorker = (data: unknown): CreateWorkerData => {
  return createWorkerSchema.parse(data)
}

// Función helper para validar actualización de trabajador
export const validateUpdateWorker = (data: unknown): UpdateWorkerData => {
  return updateWorkerSchema.parse(data)
}

// Función helper para validar filtros
export const validateWorkerFilters = (data: unknown): WorkerFilters => {
  return workerFiltersSchema.parse(data)
}

// Función helper para validar formulario
export const validateWorkerForm = (data: unknown): WorkerFormData => {
  return workerFormSchema.parse(data)
}

// Función helper para validar eliminación
export const validateWorkerDeletion = (data: unknown): WorkerDeletionData => {
  return workerDeletionSchema.parse(data)
}

// Validación de nombre de trabajador
export const validateWorkerName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100
}
