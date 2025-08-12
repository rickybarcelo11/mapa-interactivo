import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useSectorsStore } from './sectors-store'
import { useTasksStore } from './tasks-store'
import { useWorkersStore } from './workers-store'

interface AppState {
  // Estado global de la aplicación
  isLoading: boolean
  error: string | null
  currentView: string
  
  // Estadísticas globales
  totalSectors: number
  totalTasks: number
  totalWorkers: number
  completedTasks: number
  pendingTasks: number
  activeTasks: number
}

interface AppActions {
  // Acciones básicas
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setCurrentView: (view: string) => void
  
  // Acciones de inicialización
  initializeApp: () => Promise<void>
  
  // Acciones de estadísticas
  updateStatistics: () => void
  
  // Acciones de limpieza
  clearError: () => void
  resetApp: () => void
}

const initialState: AppState = {
  isLoading: false,
  error: null,
  currentView: 'home',
  totalSectors: 0,
  totalTasks: 0,
  totalWorkers: 0,
  completedTasks: 0,
  pendingTasks: 0,
  activeTasks: 0
}

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Acciones básicas
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setCurrentView: (view) => set({ currentView: view }),

      // Acciones de inicialización
      initializeApp: async () => {
        set({ isLoading: true, error: null })
        
        try {
          // Inicializar todos los stores
          const sectorsStore = useSectorsStore.getState()
          const tasksStore = useTasksStore.getState()
          const workersStore = useWorkersStore.getState()
          
          // Inicializar datos
          sectorsStore.initializeSectors()
          tasksStore.initializeTasks()
          workersStore.initializeWorkers()
          
          // Actualizar estadísticas
          get().updateStatistics()
          
          set({ isLoading: false, error: null })
        } catch (error) {
          if (error instanceof Error) {
            set({ 
              error: `Error al inicializar la aplicación: ${error.message}`, 
              isLoading: false 
            })
          } else {
            set({ 
              error: 'Error inesperado al inicializar la aplicación', 
              isLoading: false 
            })
          }
        }
      },

      // Acciones de estadísticas
      updateStatistics: () => {
        const sectorsStore = useSectorsStore.getState()
        const tasksStore = useTasksStore.getState()
        const workersStore = useWorkersStore.getState()
        
        const sectors = sectorsStore.sectors
        const tasks = tasksStore.tasks
        const workers = workersStore.workers
        
        const completedTasks = tasks.filter(t => t.status === 'completado').length
        const pendingTasks = tasks.filter(t => t.status === 'pendiente').length
        const activeTasks = tasks.filter(t => t.status === 'en proceso').length
        
        set({
          totalSectors: sectors.length,
          totalTasks: tasks.length,
          totalWorkers: workers.length,
          completedTasks,
          pendingTasks,
          activeTasks
        })
      },

      // Acciones de limpieza
      clearError: () => set({ error: null }),
      resetApp: () => set(initialState)
    }),
    {
      name: 'app-store'
    }
  )
)
