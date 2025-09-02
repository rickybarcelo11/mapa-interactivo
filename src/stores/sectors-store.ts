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
  initialized: boolean
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
  initialized: false,
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
      addSector: async (sectorData) => {
        set({ loading: true })
        try {
          const validatedData = validateCreateSector(sectorData)
          const { createSectorApi } = await import('../services/provider')
          const created = await createSectorApi(validatedData as unknown as SectorPolygon)
          const finalValidatedSector = validateSector(created)
          set((state) => ({
            sectors: [...state.sectors, finalValidatedSector],
            error: null,
            _filteredSectorsCache: null,
            loading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? `Error al crear sector: ${error.message}` : 'Error inesperado al crear sector', loading: false })
        }
      },

      updateSector: async (sectorData) => {
        set({ loading: true })
        try {
          const validatedData = validateUpdateSector(sectorData)
          const { updateSectorApi } = await import('../services/provider')
          const updated = await updateSectorApi(validatedData as unknown as SectorPolygon & { id: string })
          const finalValidatedSector = validateSector(updated)
          set((state) => {
            const sectorIndex = state.sectors.findIndex(s => s.id === finalValidatedSector.id)
            if (sectorIndex === -1) throw new Error('Sector no encontrado')
            const newSectors = [...state.sectors]
            newSectors[sectorIndex] = finalValidatedSector
            return {
              sectors: newSectors,
              selectedSector: state.selectedSector?.id === finalValidatedSector.id ? finalValidatedSector : state.selectedSector,
              error: null,
              _filteredSectorsCache: null,
              loading: false
            }
          })
        } catch (error) {
          set({ error: error instanceof Error ? `Error al actualizar sector: ${error.message}` : 'Error inesperado al actualizar sector', loading: false })
        }
      },

      deleteSector: async (id) => {
        set({ loading: true })
        try {
          const { deleteSectorApi } = await import('../services/provider')
          await deleteSectorApi(id)
          set((state) => ({
            sectors: state.sectors.filter(s => s.id !== id),
            selectedSector: state.selectedSector?.id === id ? null : state.selectedSector,
            error: null,
            _filteredSectorsCache: null,
            loading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? `Error al eliminar sector: ${error.message}` : 'Error inesperado al eliminar sector', loading: false })
        }
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
        const { initialized } = get()
        if (initialized) return
        set({ loading: true, error: null, initialized: true })
        try {
          const { getSectors } = await import('../services/provider')
          const data = await getSectors()
          const validated = data.map((s) => validateSector(s))
          set({ sectors: validated, loading: false, error: null, _filteredSectorsCache: null })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Error al inicializar sectores', loading: false, initialized: false })
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
