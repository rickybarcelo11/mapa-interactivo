import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { 
  Task, 
  TaskValidated, 
  CreateTaskData, 
  UpdateTaskData,
  FinishTaskData,
  validateTask,
  validateCreateTask,
  validateUpdateTask,
  validateFinishTask,
  validateTaskDates
} from '../validations'

interface TasksState {
  tasks: Task[]
  loading: boolean
  error: string | null
  selectedTask: Task | null
  filters: {
    text: string
    status: string
    type: string
    sectorId: string
    workerId: string
    dateRange: {
      from: Date | null
      to: Date | null
    } | null
  }
}

interface TasksActions {
  // Acciones básicas
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedTask: (task: Task | null) => void
  
  // Acciones de filtros
  setFilters: (filters: Partial<TasksState['filters']>) => void
  clearFilters: () => void
  
  // Acciones CRUD con validación
  addTask: (taskData: CreateTaskData) => void
  updateTask: (taskData: UpdateTaskData) => void
  deleteTask: (id: string) => void
  finishTask: (finishData: FinishTaskData) => void
  startTask: (data: { id: string; startDate: string }) => void
  
  // Acciones de datos
  setTasks: (tasks: Task[]) => void
  initializeTasks: () => void
  
  // Getters computados
  getFilteredTasks: () => Task[]
  getTaskById: (id: string) => Task | undefined
  getTasksByStatus: (status: string) => Task[]
  getTasksByWorker: (workerId: string) => Task[]
  getTasksBySector: (sectorId: string) => Task[]
  getActiveTasks: () => Task[]
  getCompletedTasks: () => Task[]
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  selectedTask: null,
  filters: {
    text: '',
    status: 'todos',
    type: 'todos',
    sectorId: 'todos',
    workerId: 'todos',
    dateRange: null
  }
}

export const useTasksStore = create<TasksState & TasksActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Acciones básicas
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setSelectedTask: (task) => set({ selectedTask: task }),

      // Acciones de filtros
      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
      })),
      clearFilters: () => set({ filters: initialState.filters }),

      // Acciones CRUD con validación
      addTask: async (taskData) => {
        set({ loading: true })
        try {
          const validatedData = validateCreateTask(taskData)
          if (validatedData.endDate && !validateTaskDates(validatedData.startDate, validatedData.endDate)) {
            throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
          }
          const { createTaskApi } = await import('../services/provider')
          const created = await createTaskApi(validatedData)
          const finalValidatedTask = validateTask(created)
          set((state) => ({ tasks: [...state.tasks, finalValidatedTask], error: null, loading: false }))
        } catch (error) {
          set({ error: error instanceof Error ? `Error al crear tarea: ${error.message}` : 'Error inesperado al crear tarea', loading: false })
        }
      },

      updateTask: async (taskData) => {
        set({ loading: true })
        try {
          const validatedData = validateUpdateTask(taskData)
          const { updateTaskApi } = await import('../services/provider')
          const updated = await updateTaskApi(validatedData)
          const finalValidatedTask = validateTask(updated)
          set((state) => {
            const taskIndex = state.tasks.findIndex(t => t.id === finalValidatedTask.id)
            if (taskIndex === -1) throw new Error('Tarea no encontrada')
            const newTasks = [...state.tasks]
            newTasks[taskIndex] = finalValidatedTask
            return {
              tasks: newTasks,
              selectedTask: state.selectedTask?.id === finalValidatedTask.id ? finalValidatedTask : state.selectedTask,
              error: null,
              loading: false
            }
          })
          // Actualización optimista del estado del sector en el store local
          try {
            const { useSectorsStore } = await import('./sectors-store')
            const sectorsApi = useSectorsStore.getState()
            const local = sectorsApi.sectors.map(s => s.id === finalValidatedTask.sectorId ? { ...s, status: finalValidatedTask.status } as any : s)
            sectorsApi.setSectors(local as any)
          } catch {}
          // refrescar sectores para reflejar estado sincronizado
          try {
            const { getSectors } = await import('../services/provider')
            const sectors = await getSectors()
            const { useSectorsStore } = await import('./sectors-store')
            useSectorsStore.getState().setSectors(sectors as any)
          } catch {}
        } catch (error) {
          set({ error: error instanceof Error ? `Error al actualizar tarea: ${error.message}` : 'Error inesperado al actualizar tarea', loading: false })
        }
      },

      deleteTask: async (id) => {
        set({ loading: true })
        try {
          const { deleteTaskApi } = await import('../services/provider')
          await deleteTaskApi(id)
          set((state) => ({
            tasks: state.tasks.filter(t => t.id !== id),
            selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
            error: null,
            loading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? `Error al eliminar tarea: ${error.message}` : 'Error inesperado al eliminar tarea', loading: false })
        }
      },

      finishTask: async (finishData) => {
        set({ loading: true })
        try {
          const validatedData = validateFinishTask(finishData)
          const { finishTaskApi } = await import('../services/provider')
          const updated = await finishTaskApi(validatedData)
          const finalValidatedTask = validateTask(updated)
          set((state) => {
            const taskIndex = state.tasks.findIndex(t => t.id === finalValidatedTask.id)
            if (taskIndex === -1) throw new Error('Tarea no encontrada')
            const newTasks = [...state.tasks]
            newTasks[taskIndex] = finalValidatedTask
            return {
              tasks: newTasks,
              selectedTask: state.selectedTask?.id === finalValidatedTask.id ? finalValidatedTask : state.selectedTask,
              error: null,
              loading: false
            }
          })
          // Actualización optimista del estado del sector en el store local
          try {
            const { useSectorsStore } = await import('./sectors-store')
            const sectorsApi = useSectorsStore.getState()
            const local = sectorsApi.sectors.map(s => s.id === finalValidatedTask.sectorId ? { ...s, status: finalValidatedTask.status } as any : s)
            sectorsApi.setSectors(local as any)
          } catch {}
          // refrescar sectores para reflejar estado sincronizado
          try {
            const { getSectors } = await import('../services/provider')
            const sectors = await getSectors()
            const { useSectorsStore } = await import('./sectors-store')
            useSectorsStore.getState().setSectors(sectors as any)
          } catch {}
        } catch (error) {
          set({ error: error instanceof Error ? `Error al finalizar tarea: ${error.message}` : 'Error inesperado al finalizar tarea', loading: false })
        }
      },

      startTask: async ({ id, startDate }) => {
        set({ loading: true })
        try {
          const { startTaskApi } = await import('../services/provider')
          const updated = await startTaskApi({ id, startDate })
          const finalValidatedTask = validateTask(updated)
          set((state) => {
            const taskIndex = state.tasks.findIndex(t => t.id === finalValidatedTask.id)
            if (taskIndex === -1) throw new Error('Tarea no encontrada')
            const newTasks = [...state.tasks]
            newTasks[taskIndex] = finalValidatedTask
            return {
              tasks: newTasks,
              selectedTask: state.selectedTask?.id === finalValidatedTask.id ? finalValidatedTask : state.selectedTask,
              error: null,
              loading: false
            }
          })
          // refrescar sectores para reflejar estado sincronizado
          try {
            const { getSectors } = await import('../services/provider')
            const sectors = await getSectors()
            const { useSectorsStore } = await import('./sectors-store')
            useSectorsStore.getState().setSectors(sectors as any)
          } catch {}
        } catch (error) {
          set({ error: error instanceof Error ? `Error al iniciar tarea: ${error.message}` : 'Error inesperado al iniciar tarea', loading: false })
        }
      },

      // Acciones de datos
      setTasks: (tasks) => {
        try {
          // Validar todas las tareas
          const validatedTasks = tasks.map(task => validateTask(task))
          set({ tasks: validatedTasks, error: null })
        } catch (error) {
          if (error instanceof Error) {
            set({ error: `Error al establecer tareas: ${error.message}` })
          } else {
            set({ error: 'Error inesperado al establecer tareas' })
          }
        }
      },

      initializeTasks: async () => {
        set({ loading: true, error: null })
        try {
          const { getTasks } = await import('../services/provider')
          const data = await getTasks()
          const validated = data.map((t) => validateTask(t))
          set({ tasks: validated, loading: false, error: null })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Error al inicializar tareas', loading: false })
        }
      },

      // Getters computados
      getFilteredTasks: () => {
        const { tasks, filters } = get()
        
        return tasks.filter(task => {
          const textMatch = !filters.text || 
            task.type.toLowerCase().includes(filters.text.toLowerCase()) ||
            task.sectorName.toLowerCase().includes(filters.text.toLowerCase()) ||
            task.assignedWorkerName.toLowerCase().includes(filters.text.toLowerCase())
          
          const statusMatch = filters.status === 'todos' || 
            task.status === filters.status
          
          const typeMatch = filters.type === 'todos' || 
            task.type === filters.type
          
          const sectorMatch = filters.sectorId === 'todos' || 
            task.sectorId === filters.sectorId
          
          const workerMatch = filters.workerId === 'todos' || 
            task.assignedWorkerId === filters.workerId
          
          let dateMatch = true
          if (filters.dateRange) {
            const taskDate = new Date(task.startDate)
            if (filters.dateRange.from && taskDate < filters.dateRange.from) {
              dateMatch = false
            }
            if (filters.dateRange.to && taskDate > filters.dateRange.to) {
              dateMatch = false
            }
          }
          
          return textMatch && statusMatch && typeMatch && sectorMatch && workerMatch && dateMatch
        })
      },

      getTaskById: (id) => {
        const { tasks } = get()
        return tasks.find(t => t.id === id)
      },

      getTasksByStatus: (status) => {
        const { tasks } = get()
        return tasks.filter(t => t.status === status)
      },

      getTasksByWorker: (workerId) => {
        const { tasks } = get()
        return tasks.filter(t => t.assignedWorkerId === workerId)
      },

      getTasksBySector: (sectorId) => {
        const { tasks } = get()
        return tasks.filter(t => t.sectorId === sectorId)
      },

      getActiveTasks: () => {
        const { tasks } = get()
        return tasks.filter(t => t.status !== 'completado')
      },

      getCompletedTasks: () => {
        const { tasks } = get()
        return tasks.filter(t => t.status === 'completado')
      }
    }),
    {
      name: 'tasks-store'
    }
  )
)
