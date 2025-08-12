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
      addTask: (taskData) => {
        try {
          // Validar datos de entrada
          const validatedData = validateCreateTask(taskData)
          
          // Validar fechas si están presentes
          if (validatedData.endDate && !validateTaskDates(validatedData.startDate, validatedData.endDate)) {
            throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
          }
          
          // Crear nueva tarea con ID único
          const newTask: Task = {
            ...validatedData,
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }
          
          // Validar la tarea completa
          const finalValidatedTask = validateTask(newTask)
          
          set((state) => ({
            tasks: [...state.tasks, finalValidatedTask],
            error: null
          }))
        } catch (error) {
          if (error instanceof Error) {
            set({ error: `Error al crear tarea: ${error.message}` })
          } else {
            set({ error: 'Error inesperado al crear tarea' })
          }
        }
      },

      updateTask: (taskData) => {
        try {
          // Validar datos de actualización
          const validatedData = validateUpdateTask(taskData)
          
          set((state) => {
            const taskIndex = state.tasks.findIndex(t => t.id === validatedData.id)
            if (taskIndex === -1) {
              throw new Error('Tarea no encontrada')
            }
            
            // Crear tarea actualizada
            const updatedTask: Task = {
              ...state.tasks[taskIndex],
              ...validatedData
            }
            
            // Validar fechas si están presentes
            if (updatedTask.endDate && !validateTaskDates(updatedTask.startDate, updatedTask.endDate)) {
              throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
            }
            
            // Validar la tarea actualizada
            const finalValidatedTask = validateTask(updatedTask)
            
            const newTasks = [...state.tasks]
            newTasks[taskIndex] = finalValidatedTask
            
            return {
              tasks: newTasks,
              selectedTask: state.selectedTask?.id === validatedData.id 
                ? finalValidatedTask 
                : state.selectedTask,
              error: null
            }
          })
        } catch (error) {
          if (error instanceof Error) {
            set({ error: `Error al actualizar tarea: ${error.message}` })
          } else {
            set({ error: 'Error inesperado al actualizar tarea' })
          }
        }
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter(t => t.id !== id),
          selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
          error: null
        }))
      },

      finishTask: (finishData) => {
        try {
          // Validar datos de finalización
          const validatedData = validateFinishTask(finishData)
          
          set((state) => {
            const taskIndex = state.tasks.findIndex(t => t.id === validatedData.id)
            if (taskIndex === -1) {
              throw new Error('Tarea no encontrada')
            }
            
            const task = state.tasks[taskIndex]
            
            // Validar que la fecha de fin sea posterior a la fecha de inicio
            if (!validateTaskDates(task.startDate, validatedData.endDate)) {
              throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
            }
            
            // Actualizar tarea
            const updatedTask: Task = {
              ...task,
              status: 'completado',
              endDate: validatedData.endDate
            }
            
            // Validar la tarea actualizada
            const finalValidatedTask = validateTask(updatedTask)
            
            const newTasks = [...state.tasks]
            newTasks[taskIndex] = finalValidatedTask
            
            return {
              tasks: newTasks,
              selectedTask: state.selectedTask?.id === validatedData.id 
                ? finalValidatedTask 
                : state.selectedTask,
              error: null
            }
          })
        } catch (error) {
          if (error instanceof Error) {
            set({ error: `Error al finalizar tarea: ${error.message}` })
          } else {
            set({ error: 'Error inesperado al finalizar tarea' })
          }
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

      initializeTasks: () => {
        set({ loading: true, error: null })
        
        try {
          // Importar datos de ejemplo
          const { tasksData } = require('../../data/tasks.data')
          
          // Validar todas las tareas
          const validatedTasks = tasksData.map((task: any) => validateTask(task))
          
          set({ 
            tasks: validatedTasks, 
            loading: false, 
            error: null 
          })
        } catch (error) {
          if (error instanceof Error) {
            set({ 
              error: `Error al inicializar tareas: ${error.message}`, 
              loading: false 
            })
          } else {
            set({ 
              error: 'Error inesperado al inicializar tareas', 
              loading: false 
            })
          }
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
