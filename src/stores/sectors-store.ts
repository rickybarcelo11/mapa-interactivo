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
  // Cache para selectores memoizados
  _filteredSectorsCache: {
    key: string
    result: SectorPolygon[]
  } | null
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
  
  // Getters computados optimizados
  getFilteredSectors: () => SectorPolygon[]
  getSectorById: (id: string) => SectorPolygon | undefined
  getSectorsByType: (type: string) => SectorPolygon[]
  getSectorsByStatus: (status: string) => SectorPolygon[]
  
  // Limpiar cache
  _clearCache: () => void
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
  },
  _filteredSectorsCache: null
}

// Función helper para generar clave de cache
const generateCacheKey = (filters: SectorsState['filters']) => {
  return `${filters.name}|${filters.type}|${filters.status}|${filters.direccion}`
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
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          _filteredSectorsCache: null // Limpiar cache al cambiar filtros
        }))
      },
      clearFilters: () => set({ 
        filters: initialState.filters,
        _filteredSectorsCache: null // Limpiar cache al limpiar filtros
      }),

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
            error: null,
            _filteredSectorsCache: null // Limpiar cache al agregar sector
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
          // Validar datos de entrada
          const validatedData = validateUpdateSector(sectorData)
          
          set((state) => {
            const sectorIndex = state.sectors.findIndex(s => s.id === sectorData.id)
            if (sectorIndex === -1) {
              throw new Error('Sector no encontrado')
            }
            
            const updatedSector = { ...state.sectors[sectorIndex], ...validatedData }
            const finalValidatedSector = validateSector(updatedSector)
            
            const newSectors = [...state.sectors]
            newSectors[sectorIndex] = finalValidatedSector
            
            return {
              sectors: newSectors,
              selectedSector: state.selectedSector?.id === sectorData.id ? finalValidatedSector : state.selectedSector,
              error: null,
              _filteredSectorsCache: null // Limpiar cache al actualizar sector
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
          error: null,
          _filteredSectorsCache: null // Limpiar cache al eliminar sector
        }))
      },

      // Acciones de datos
      setSectors: (sectors) => {
        try {
          // Validar todos los sectores
          const validatedSectors = sectors.map(sector => validateSector(sector))
          set({ 
            sectors: validatedSectors, 
            error: null,
            _filteredSectorsCache: null // Limpiar cache al establecer sectores
          })
        } catch (error) {
          if (error instanceof Error) {
            set({ error: `Error al establecer sectores: ${error.message}` })
          } else {
            set({ error: 'Error inesperado al establecer sectores' })
          }
        }
      },

      initializeSectors: async () => {
        set({ loading: true, error: null })
        try {
          const { getSectors } = await import('../services/provider')
          const data = await getSectors()
          const validated = data.map((s: any) => validateSector(s))
          set({ sectors: validated, loading: false, error: null, _filteredSectorsCache: null })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Error al inicializar sectores', loading: false })
        }
      },

      // Getters computados optimizados con cache
      getFilteredSectors: () => {
        const { sectors, filters, _filteredSectorsCache } = get()
        
        // Verificar cache
        const cacheKey = generateCacheKey(filters)
        if (_filteredSectorsCache && _filteredSectorsCache.key === cacheKey) {
          return _filteredSectorsCache.result
        }
        
        // Calcular resultado
        const result = sectors.filter(sector => {
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
        
        // Guardar en cache
        set({ _filteredSectorsCache: { key: cacheKey, result } })
        
        return result
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
      },

      // Limpiar cache
      _clearCache: () => set({ _filteredSectorsCache: null })
    }),
    {
      name: 'sectors-store'
    }
  )
)
