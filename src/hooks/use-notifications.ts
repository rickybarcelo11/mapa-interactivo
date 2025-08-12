import { toast } from 'sonner'

export const useNotifications = () => {
  // Notificaciones de éxito
  const showSuccess = (message: string, options?: { duration?: number }) => {
    toast.success(message, {
      duration: options?.duration || 4000,
      className: 'bg-green-600 text-white border-green-700',
    })
  }

  // Notificaciones de error
  const showError = (message: string, options?: { duration?: number }) => {
    toast.error(message, {
      duration: options?.duration || 6000,
      className: 'bg-red-600 text-white border-red-700',
    })
  }

  // Notificaciones de información
  const showInfo = (message: string, options?: { duration?: number }) => {
    toast.info(message, {
      duration: options?.duration || 4000,
      className: 'bg-blue-600 text-white border-blue-700',
    })
  }

  // Notificaciones de advertencia
  const showWarning = (message: string, options?: { duration?: number }) => {
    toast.warning(message, {
      duration: options?.duration || 5000,
      className: 'bg-yellow-600 text-white border-yellow-700',
    })
  }

  // Notificaciones de carga
  const showLoading = (message: string) => {
    return toast.loading(message, {
      className: 'bg-slate-600 text-white border-slate-700',
    })
  }

  // Notificaciones de promesas
  const showPromise = <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    })
  }

  // Notificaciones específicas para sectores
  const showSectorCreated = (sectorName: string) => {
    showSuccess(`Sector "${sectorName}" creado exitosamente!`)
  }

  const showSectorUpdated = (sectorName: string) => {
    showSuccess(`Sector "${sectorName}" actualizado exitosamente!`)
  }

  const showSectorDeleted = (sectorName: string) => {
    showInfo(`Sector "${sectorName}" eliminado exitosamente!`)
  }

  // Notificaciones específicas para tareas
  const showTaskCreated = (taskName: string) => {
    showSuccess(`Tarea "${taskName}" creada exitosamente!`)
  }

  const showTaskUpdated = (taskName: string) => {
    showSuccess(`Tarea "${taskName}" actualizada exitosamente!`)
  }

  const showTaskDeleted = (taskName: string) => {
    showInfo(`Tarea "${taskName}" eliminada exitosamente!`)
  }

  const showTaskFinished = (taskName: string) => {
    showSuccess(`Tarea "${taskName}" marcada como completada!`)
  }

  // Notificaciones específicas para trabajadores
  const showWorkerCreated = (workerName: string) => {
    showSuccess(`Trabajador "${workerName}" agregado exitosamente!`)
  }

  const showWorkerUpdated = (workerName: string) => {
    showSuccess(`Trabajador "${workerName}" actualizado exitosamente!`)
  }

  const showWorkerDeleted = (workerName: string) => {
    showInfo(`Trabajador "${workerName}" eliminado exitosamente!`)
  }

  const showWorkerHasActiveTasks = (workerName: string) => {
    showWarning(`El trabajador "${workerName}" tiene tareas activas y no puede ser eliminado.`)
  }

  // Notificaciones específicas para árboles
  const showTreeCreated = (treeSpecies: string, address: string) => {
    showSuccess(`Árbol "${treeSpecies}" en ${address} agregado exitosamente!`)
  }

  const showTreeUpdated = (treeSpecies: string, address: string) => {
    showSuccess(`Árbol "${treeSpecies}" en ${address} actualizado exitosamente!`)
  }

  const showTreeDeleted = (treeSpecies: string, address: string) => {
    showInfo(`Árbol "${treeSpecies}" en ${address} eliminado exitosamente!`)
  }

  // Notificaciones de funcionalidades simuladas
  const showSimulatedFeature = (featureName: string) => {
    showInfo(`${featureName} (funcionalidad simulada - se implementará en el backend)`)
  }

  // Notificaciones de validación
  const showValidationError = (message: string) => {
    showError(`Error de validación: ${message}`)
  }

  const showRequiredFieldsError = () => {
    showError('Por favor, completa todos los campos obligatorios.')
  }

  // Notificaciones de confirmación
  const showConfirmDelete = (itemName: string, onConfirm: () => void) => {
    toast(
      `¿Eliminar ${itemName}? Esta acción no se puede deshacer.`,
      {
        duration: 0, // No se auto-cierra
        action: {
          label: 'Eliminar',
          onClick: () => {
            onConfirm()
            toast.dismiss()
          }
        },
        cancel: {
          label: 'Cancelar',
          onClick: () => toast.dismiss()
        }
      }
    )
  }

  return {
    // Métodos básicos
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    showPromise,
    
    // Métodos específicos por entidad
    showSectorCreated,
    showSectorUpdated,
    showSectorDeleted,
    showTaskCreated,
    showTaskUpdated,
    showTaskDeleted,
    showTaskFinished,
    showWorkerCreated,
    showWorkerUpdated,
    showWorkerDeleted,
    showWorkerHasActiveTasks,
    showTreeCreated,
    showTreeUpdated,
    showTreeDeleted,
    
    // Métodos de utilidad
    showSimulatedFeature,
    showValidationError,
    showRequiredFieldsError,
    showConfirmDelete,
  }
}
