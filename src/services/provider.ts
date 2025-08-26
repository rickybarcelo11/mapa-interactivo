import type { Worker, SectorPolygon, Task } from '../types'

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'

export async function getWorkers(): Promise<Worker[]> {
  if (USE_MOCKS) {
    const { workersData } = await import('../data/workers.data')
    return workersData as Worker[]
  }
  const res = await fetch('/api/workers', { cache: 'no-store' })
  if (!res.ok) throw new Error('No se pudieron obtener trabajadores')
  return (await res.json()) as Worker[]
}

export async function getSectors(): Promise<SectorPolygon[]> {
  if (USE_MOCKS) {
    const { sectorsData } = await import('../data/sectors.data')
    return sectorsData as SectorPolygon[]
  }
  const res = await fetch('/api/sectores', { cache: 'no-store' })
  if (!res.ok) throw new Error('No se pudieron obtener sectores')
  return (await res.json()) as SectorPolygon[]
}

export async function getTasks(): Promise<Task[]> {
  if (USE_MOCKS) {
    const { tasksData } = await import('../data/tasks.data')
    return tasksData as Task[]
  }
  const res = await fetch('/api/tareas', { cache: 'no-store' })
  if (!res.ok) throw new Error('No se pudieron obtener tareas')
  return (await res.json()) as Task[]
}


