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
      addWorker: (workerData) => {
        try {
          // Validar datos de entrada
          const validatedData = validateCreateWorker(workerData)
          
          // Crear nuevo trabajador con ID único
          const newWorker: Worker = {
            ...validatedData,
            id: `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }
          
          // Validar el trabajador completo
          const finalValidatedWorker = validateWorker(newWorker)
          
          set((state) => ({
            workers: [...state.workers, finalValidatedWorker],
            error: null
          }))
        } catch (error) {
          if (error instanceof Error) {
            set({ error: `Error al crear trabajador: ${error.message}` })
          } else {
            set({ error: 'Error inesperado al crear trabajador' })
          }
        }
      },

      updateWorker: (workerData) => {
        try {
          // Validar datos de actualización
          const validatedData = validateUpdateWorker(workerData)
          
          set((state) => {
            const workerIndex = state.workers.findIndex(w => w.id === validatedData.id)
            if (workerIndex === -1) {
              throw new Error('Trabajador no encontrado')
            }
            
            // Crear trabajador actualizado
            const updatedWorker: Worker = {
              ...state.workers[workerIndex],
              ...validatedData
            }
            
            // Validar el trabajador actualizado
            const finalValidatedWorker = validateWorker(updatedWorker)
            
            const newWorkers = [...state.workers]
            newWorkers[workerIndex] = finalValidatedWorker
            
            return {
              workers: newWorkers,
              selectedWorker: state.selectedWorker?.id === validatedData.id 
                ? finalValidatedWorker 
                : state.selectedWorker,
              error: null
            }
          })
        } catch (error) {
          if (error instanceof Error) {
            set({ error: `Error al actualizar trabajador: ${error.message}` })
          } else {
            set({ error: 'Error inesperado al actualizar trabajador' })
          }
        }
      },

      deleteWorker: (id) => {
        set((state) => ({
          workers: state.workers.filter(w => w.id !== id),
          selectedWorker: state.selectedWorker?.id === id ? null : state.selectedWorker,
          error: null
        }))
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

      initializeWorkers: () => {
        set({ loading: true, error: null })
        
        try {
          // Importar datos de ejemplo
          const { workersData } = require('../../data/workers.data')
          
          // Validar todos los trabajadores
          const validatedWorkers = workersData.map((worker: any) => validateWorker(worker))
          
          set({ 
            workers: validatedWorkers, 
            loading: false, 
            error: null 
          })
        } catch (error) {
          if (error instanceof Error) {
            set({ 
              error: `Error al inicializar trabajadores: ${error.message}`, 
              loading: false 
            })
          } else {
            set({ 
              error: 'Error inesperado al inicializar trabajadores', 
              loading: false 
            })
          }
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
