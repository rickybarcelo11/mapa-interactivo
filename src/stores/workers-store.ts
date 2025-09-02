import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { 
  Worker, 
  WorkerValidated, 
  CreateWorkerData, 
  UpdateWorkerData,
  validateWorker,
  validateCreateWorker,
  validateUpdateWorker
} from '../validations'

interface WorkersState {
  workers: Worker[]
  loading: boolean
  error: string | null
  selectedWorker: Worker | null
  filters: {
    name: string
    hasActiveTasks: boolean | null
  }
}

interface WorkersActions {
  // Acciones básicas
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedWorker: (worker: Worker | null) => void
  
  // Acciones de filtros
  setFilters: (filters: Partial<WorkersState['filters']>) => void
  clearFilters: () => void
  
  // Acciones CRUD con validación
  addWorker: (workerData: CreateWorkerData) => void
  updateWorker: (workerData: UpdateWorkerData) => void
  deleteWorker: (id: string) => void
  
  // Acciones de datos
  setWorkers: (workers: Worker[]) => void
  initializeWorkers: () => void
  
  // Getters computados
  getFilteredWorkers: () => Worker[]
  getWorkerById: (id: string) => Worker | undefined
  getWorkersByName: (name: string) => Worker[]
  getWorkersWithActiveTasks: () => Worker[]
  getWorkersWithoutActiveTasks: () => Worker[]
}

const initialState: WorkersState = {
  workers: [],
  loading: false,
  error: null,
  selectedWorker: null,
  filters: {
    name: '',
    hasActiveTasks: null
  }
}

export const useWorkersStore = create<WorkersState & WorkersActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Acciones básicas
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setSelectedWorker: (worker) => set({ selectedWorker: worker }),

      // Acciones de filtros
      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
      })),
      clearFilters: () => set({ filters: initialState.filters }),

      // Acciones CRUD con validación
      addWorker: async (workerData) => {
        set({ loading: true })
        try {
          const validatedData = validateCreateWorker(workerData)
          const { createWorker } = await import('../services/provider')
          const created = await createWorker(validatedData as unknown as Omit<Worker,'id'>)
          const finalValidatedWorker = validateWorker(created)
          set((state) => ({ workers: [...state.workers, finalValidatedWorker], error: null, loading: false }))
        } catch (error) {
          set({ error: error instanceof Error ? `Error al crear trabajador: ${error.message}` : 'Error inesperado al crear trabajador', loading: false })
        }
      },

      updateWorker: async (workerData) => {
        set({ loading: true })
        try {
          const validatedData = validateUpdateWorker(workerData)
          const { updateWorkerApi } = await import('../services/provider')
          const updated = await updateWorkerApi(validatedData as unknown as Worker & { id: string })
          const finalValidatedWorker = validateWorker(updated)
          set((state) => {
            const workerIndex = state.workers.findIndex(w => w.id === finalValidatedWorker.id)
            if (workerIndex === -1) throw new Error('Trabajador no encontrado')
            const newWorkers = [...state.workers]
            newWorkers[workerIndex] = finalValidatedWorker
            return {
              workers: newWorkers,
              selectedWorker: state.selectedWorker?.id === finalValidatedWorker.id ? finalValidatedWorker : state.selectedWorker,
              error: null,
              loading: false
            }
          })
        } catch (error) {
          set({ error: error instanceof Error ? `Error al actualizar trabajador: ${error.message}` : 'Error inesperado al actualizar trabajador', loading: false })
        }
      },

      deleteWorker: async (id) => {
        set({ loading: true })
        try {
          const { deleteWorkerApi } = await import('../services/provider')
          await deleteWorkerApi(id)
          set((state) => ({
            workers: state.workers.filter(w => w.id !== id),
            selectedWorker: state.selectedWorker?.id === id ? null : state.selectedWorker,
            error: null,
            loading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? `Error al eliminar trabajador: ${error.message}` : 'Error inesperado al eliminar trabajador', loading: false })
        }
      },

      // Acciones de datos
      setWorkers: (workers) => {
        try {
          // Validar todos los trabajadores
          const validatedWorkers = workers.map(worker => validateWorker(worker))
          set({ workers: validatedWorkers, error: null })
        } catch (error) {
          if (error instanceof Error) {
            set({ error: `Error al establecer trabajadores: ${error.message}` })
          } else {
            set({ error: 'Error inesperado al establecer trabajadores' })
          }
        }
      },

      initializeWorkers: async () => {
        set({ loading: true, error: null })
        try {
          const { getWorkers } = await import('../services/provider')
          const data = await getWorkers()
          const validated = data.map((w) => validateWorker(w))
          set({ workers: validated, loading: false, error: null })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Error al inicializar trabajadores', loading: false })
        }
      },

      // Getters computados
      getFilteredWorkers: () => {
        const { workers, filters } = get()
        
        return workers.filter(worker => {
          const nameMatch = !filters.name || 
            worker.name.toLowerCase().includes(filters.name.toLowerCase())
          
          let activeTasksMatch = true
          if (filters.hasActiveTasks !== null) {
            // Aquí podrías implementar la lógica para verificar si tiene tareas activas
            // Por ahora, asumimos que todos los trabajadores no tienen tareas activas
            const hasActiveTasks = false // Placeholder - se implementará con la lógica de tareas
            activeTasksMatch = hasActiveTasks === filters.hasActiveTasks
          }
          
          return nameMatch && activeTasksMatch
        })
      },

      getWorkerById: (id) => {
        const { workers } = get()
        return workers.find(w => w.id === id)
      },

      getWorkersByName: (name) => {
        const { workers } = get()
        return workers.filter(w => 
          w.name.toLowerCase().includes(name.toLowerCase())
        )
      },

      getWorkersWithActiveTasks: () => {
        const { workers } = get()
        // Placeholder - se implementará con la lógica de tareas
        return workers.filter(w => false) // Por ahora, ninguno tiene tareas activas
      },

      getWorkersWithoutActiveTasks: () => {
        const { workers } = get()
        // Placeholder - se implementará con la lógica de tareas
        return workers.filter(w => true) // Por ahora, todos no tienen tareas activas
      }
    }),
    {
      name: 'workers-store'
    }
  )
)
