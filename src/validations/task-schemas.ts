import { z } from 'zod'

// Esquema para fechas (formato ISO string)
export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe estar en formato YYYY-MM-DD")
  .refine((date) => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, "La fecha debe ser válida")

// Esquema para tareas
export const taskSchema = z.object({
  id: z.string().optional(), // Opcional para creación
  sectorId: z.string().min(1, "El ID del sector es requerido"),
  sectorName: z.string()
    .min(2, "El nombre del sector debe tener al menos 2 caracteres")
    .max(100, "El nombre del sector no puede exceder 100 caracteres"),
  type: z.string()
    .min(2, "El tipo de tarea debe tener al menos 2 caracteres")
    .max(100, "El tipo de tarea no puede exceder 100 caracteres"),
  status: z.enum(["pendiente", "en proceso", "completado"], {
    errorMap: () => ({ message: "El estado debe ser 'pendiente', 'en proceso' o 'completado'" })
  }),
  startDate: dateSchema,
  endDate: dateSchema.optional().nullable(),
  assignedWorkerId: z.string().min(1, "El ID del trabajador asignado es requerido"),
  assignedWorkerName: z.string()
    .min(2, "El nombre del trabajador debe tener al menos 2 caracteres")
    .max(100, "El nombre del trabajador no puede exceder 100 caracteres"),
  observations: z.string()
    .max(1000, "Las observaciones no pueden exceder 1000 caracteres")
    .optional()
})

// Esquema para crear una nueva tarea (sin ID)
export const createTaskSchema = taskSchema.omit({ id: true })

// Esquema para actualizar una tarea existente
export const updateTaskSchema = taskSchema.partial().extend({
  id: z.string("El ID de la tarea es requerido para actualización")
})

// Esquema para filtros de tareas
export const taskFiltersSchema = z.object({
  text: z.string().optional(),
  status: z.enum(["todos", "pendiente", "en proceso", "completado"]).optional(),
  type: z.enum(["todos"]).or(z.string()).optional(),
  sectorId: z.enum(["todos"]).or(z.string()).optional(),
  workerId: z.enum(["todos"]).or(z.string()).optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional()
  }).optional()
})

// Esquema para formulario de tarea
export const taskFormSchema = z.object({
  sectorId: z.string().min(1, "Debe seleccionar un sector"),
  type: z.string().min(2, "El tipo de tarea debe tener al menos 2 caracteres"),
  status: z.enum(["pendiente", "en proceso", "completado"], {
    errorMap: () => ({ message: "Debe seleccionar un estado válido" })
  }),
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  assignedWorkerId: z.string().min(1, "Debe seleccionar un trabajador"),
  observations: z.string().max(1000, "Las observaciones no pueden exceder 1000 caracteres").optional()
})

// Esquema para finalizar una tarea
export const finishTaskSchema = z.object({
  id: z.string("El ID de la tarea es requerido"),
  endDate: dateSchema
})

// Tipos inferidos de los esquemas
export type TaskValidated = z.infer<typeof taskSchema>
export type CreateTaskData = z.infer<typeof createTaskSchema>
export type UpdateTaskData = z.infer<typeof updateTaskSchema>
export type TaskFilters = z.infer<typeof taskFiltersSchema>
export type TaskFormData = z.infer<typeof taskFormSchema>
export type FinishTaskData = z.infer<typeof finishTaskSchema>

// Función helper para validar tarea
export const validateTask = (data: unknown): TaskValidated => {
  return taskSchema.parse(data)
}

// Función helper para validar creación de tarea
export const validateCreateTask = (data: unknown): CreateTaskData => {
  return createTaskSchema.parse(data)
}

// Función helper para validar actualización de tarea
export const validateUpdateTask = (data: unknown): UpdateTaskData => {
  return updateTaskSchema.parse(data)
}

// Función helper para validar filtros
export const validateTaskFilters = (data: unknown): TaskFilters => {
  return taskFiltersSchema.parse(data)
}

// Función helper para validar formulario
export const validateTaskForm = (data: unknown): TaskFormData => {
  return taskFormSchema.parse(data)
}

// Función helper para validar finalización de tarea
export const validateFinishTask = (data: unknown): FinishTaskData => {
  return finishTaskSchema.parse(data)
}

// Validación de fechas de tarea
export const validateTaskDates = (startDate: string, endDate?: string | null): boolean => {
  if (!endDate) return true // Si no hay fecha de fin, es válido
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return end >= start
}
