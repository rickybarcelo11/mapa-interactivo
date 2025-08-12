import { useState, useCallback } from 'react'
import { z } from 'zod'
import { useNotifications } from './use-notifications'

interface ValidationError {
  field: string
  message: string
}

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>
  onSuccess?: (data: T) => void
  onError?: (errors: ValidationError[]) => void
}

export const useFormValidation = <T>({ 
  schema, 
  onSuccess, 
  onError 
}: UseFormValidationOptions<T>) => {
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const { showValidationError } = useNotifications()

  // Validar datos del formulario
  const validate = useCallback((data: unknown): T | null => {
    setIsValidating(true)
    setErrors([])

    try {
      const validatedData = schema.parse(data)
      setIsValidating(false)
      onSuccess?.(validatedData)
      return validatedData
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        
        setErrors(validationErrors)
        setIsValidating(false)
        
        // Mostrar notificaciones para cada error
        validationErrors.forEach(err => {
          showValidationError(`${err.field}: ${err.message}`)
        })
        
        onError?.(validationErrors)
        return null
      }
      
      // Error inesperado
      const unexpectedError: ValidationError[] = [{
        field: 'general',
        message: 'Error de validación inesperado'
      }]
      
      setErrors(unexpectedError)
      setIsValidating(false)
      showValidationError('Error de validación inesperado')
      onError?.(unexpectedError)
      return null
    }
  }, [schema, onSuccess, onError, showValidationError])

  // Validar un campo específico
  const validateField = useCallback((fieldName: string, value: unknown): boolean => {
    try {
      // Crear un esquema parcial para el campo específico
      const fieldSchema = z.object({
        [fieldName]: schema.shape[fieldName as keyof typeof schema.shape]
      })
      
      fieldSchema.parse({ [fieldName]: value })
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(err => err.path[0] === fieldName)
        if (fieldError) {
          setErrors(prev => [
            ...prev.filter(err => err.field !== fieldName),
            { field: fieldName, message: fieldError.message }
          ])
        }
      }
      return false
    }
  }, [schema])

  // Limpiar errores
  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  // Limpiar error de un campo específico
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => prev.filter(err => err.field !== fieldName))
  }, [])

  // Obtener error de un campo específico
  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return errors.find(err => err.field === fieldName)?.message
  }, [errors])

  // Verificar si hay errores
  const hasErrors = errors.length > 0

  // Verificar si un campo específico tiene error
  const hasFieldError = useCallback((fieldName: string): boolean => {
    return errors.some(err => err.field === fieldName)
  }, [errors])

  return {
    // Estado
    errors,
    isValidating,
    hasErrors,
    
    // Métodos de validación
    validate,
    validateField,
    
    // Métodos de manejo de errores
    clearErrors,
    clearFieldError,
    getFieldError,
    hasFieldError
  }
}

// Hook específico para validación de sectores
export const useSectorValidation = () => {
  const { showValidationError } = useNotifications()
  
  const validateSectorForm = useCallback((data: unknown) => {
    try {
      const { validateSectorForm: validateSchema } = require('../validations/sector-schemas')
      return validateSchema(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          showValidationError(err.message)
        })
      }
      return null
    }
  }, [showValidationError])

  return { validateSectorForm }
}

// Hook específico para validación de tareas
export const useTaskValidation = () => {
  const { showValidationError } = useNotifications()
  
  const validateTaskForm = useCallback((data: unknown) => {
    try {
      const { validateTaskForm: validateSchema } = require('../validations/task-schemas')
      return validateSchema(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          showValidationError(err.message)
        })
      }
      return null
    }
  }, [showValidationError])

  return { validateTaskForm }
}

// Hook específico para validación de trabajadores
export const useWorkerValidation = () => {
  const { showValidationError } = useNotifications()
  
  const validateWorkerForm = useCallback((data: unknown) => {
    try {
      const { validateWorkerForm: validateSchema } = require('../validations/worker-schemas')
      return validateSchema(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          showValidationError(err.message)
        })
      }
      return null
    }
  }, [showValidationError])

  return { validateWorkerForm }
}

// Hook específico para validación de árboles
export const useTreeValidation = () => {
  const { showValidationError } = useNotifications()
  
  const validateTreeForm = useCallback((data: unknown) => {
    try {
      const { validateTreeForm: validateSchema } = require('../validations/tree-schemas')
      return validateSchema(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          showValidationError(err.message)
        })
      }
      return null
    }
  }, [showValidationError])

  return { validateTreeForm }
}
