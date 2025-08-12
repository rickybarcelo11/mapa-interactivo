import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { 
  SectorPolygon, 
  SectorPolygonValidated, 
  CreateSectorData, 
  UpdateSectorData,
  validateSector,
  validateCreateSector,
  validateUpdateSector
} from '../validations'

interface SectorsState {
  sectors: SectorPolygon[]
  loading: boolean
  error: string | null
  selectedSector: SectorPolygon | null
  filters: {
    name: string
    type: string
    status: string
    direccion: string
  }
}

interface SectorsActions {
  // Acciones básicas
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedSector: (sector: SectorPolygon | null) => void
  
  // Acciones de filtros
  setFilters: (filters: Partial<SectorsState['filters']>) => void
  clearFilters: () => void
  
  // Acciones CRUD con validación
  addSector: (sectorData: CreateSectorData) => void
  updateSector: (sectorData: UpdateSectorData) => void
  deleteSector: (id: string) => void
  
  // Acciones de datos
  setSectors: (sectors: SectorPolygon[]) => void
  initializeSectors: () => void
  
  // Getters computados
  getFilteredSectors: () => SectorPolygon[]
  getSectorById: (id: string) => SectorPolygon | undefined
  getSectorsByType: (type: string) => SectorPolygon[]
  getSectorsByStatus: (status: string) => SectorPolygon[]
}

const initialState: SectorsState = {
  sectors: [],
  loading: false,
  error: null,
  selectedSector: null,
  filters: {
    name: '',
    type: 'todos',
    status: 'todos',
    direccion: ''
  }
}

export const useSectorsStore = create<SectorsState & SectorsActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Acciones básicas
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setSelectedSector: (sector) => set({ selectedSector: sector }),

      // Acciones de filtros
      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
      })),
      clearFilters: () => set({ filters: initialState.filters }),

      // Acciones CRUD con validación
      addSector: (sectorData) => {
        try {
          // Validar datos de entrada
          const validatedData = validateCreateSector(sectorData)
          
          // Crear nuevo sector con ID único
          const newSector: SectorPolygon = {
            ...validatedData,
            id: `sector-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }
          
          // Validar el sector completo
          const finalValidatedSector = validateSector(newSector)
          
          set((state) => ({
            sectors: [...state.sectors, finalValidatedSector],
            error: null
          }))
        } catch (error) {
          if (error instanceof Error) {
            set({ error: `Error al crear sector: ${error.message}` })
          } else {
            set({ error: 'Error inesperado al crear sector' })
          }
        }
      },

      updateSector: (sectorData) => {
        try {
          // Validar datos de actualización
          const validatedData = validateUpdateSector(sectorData)
          
          set((state) => {
            const sectorIndex = state.sectors.findIndex(s => s.id === validatedData.id)
            if (sectorIndex === -1) {
              throw new Error('Sector no encontrado')
            }
            
            // Crear sector actualizado
            const updatedSector: SectorPolygon = {
              ...state.sectors[sectorIndex],
              ...validatedData
            }
            
            // Validar el sector actualizado
            const finalValidatedSector = validateSector(updatedSector)
            
            const newSectors = [...state.sectors]
            newSectors[sectorIndex] = finalValidatedSector
            
            return {
              sectors: newSectors,
              selectedSector: state.selectedSector?.id === validatedData.id 
                ? finalValidatedSector 
                : state.selectedSector,
              error: null
            }
          })
        } catch (error) {
          if (error instanceof Error) {
            set({ error: `Error al actualizar sector: ${error.message}` })
          } else {
            set({ error: 'Error inesperado al actualizar sector' })
          }
        }
      },

      deleteSector: (id) => {
        set((state) => ({
          sectors: state.sectors.filter(s => s.id !== id),
          selectedSector: state.selectedSector?.id === id ? null : state.selectedSector,
          error: null
        }))
      },

      // Acciones de datos
      setSectors: (sectors) => {
        try {
          // Validar todos los sectores
          const validatedSectors = sectors.map(sector => validateSector(sector))
          set({ sectors: validatedSectors, error: null })
        } catch (error) {
          if (error instanceof Error) {
            set({ error: `Error al establecer sectores: ${error.message}` })
          } else {
            set({ error: 'Error inesperado al establecer sectores' })
          }
        }
      },

      initializeSectors: () => {
        set({ loading: true, error: null })
        
        try {
          // Importar datos de ejemplo
          const { sectorsData } = require('../../data/sectors.data')
          
          // Validar todos los sectores
          const validatedSectors = sectorsData.map((sector: any) => validateSector(sector))
          
          set({ 
            sectors: validatedSectors, 
            loading: false, 
            error: null 
          })
        } catch (error) {
          if (error instanceof Error) {
            set({ 
              error: `Error al inicializar sectores: ${error.message}`, 
              loading: false 
            })
          } else {
            set({ 
              error: 'Error inesperado al inicializar sectores', 
              loading: false 
            })
          }
        }
      },

      // Getters computados
      getFilteredSectors: () => {
        const { sectors, filters } = get()
        
        return sectors.filter(sector => {
          const nameMatch = !filters.name || 
            sector.name.toLowerCase().includes(filters.name.toLowerCase())
          
          const typeMatch = filters.type === 'todos' || 
            sector.type === filters.type
          
          const statusMatch = filters.status === 'todos' || 
            sector.status === filters.status
          
          const direccionMatch = !filters.direccion || 
            (sector.direccion && sector.direccion.toLowerCase().includes(filters.direccion.toLowerCase()))
          
          return nameMatch && typeMatch && statusMatch && direccionMatch
        })
      },

      getSectorById: (id) => {
        const { sectors } = get()
        return sectors.find(s => s.id === id)
      },

      getSectorsByType: (type) => {
        const { sectors } = get()
        return sectors.filter(s => s.type === type)
      },

      getSectorsByStatus: (status) => {
        const { sectors } = get()
        return sectors.filter(s => s.status === status)
      }
    }),
    {
      name: 'sectors-store'
    }
  )
)
