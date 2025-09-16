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

export async function getWorkersPage(params: { page?: number; pageSize?: number; name?: string; hasActiveTasks?: boolean }): Promise<{ items: Worker[]; total: number; page: number; pageSize: number }> {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.pageSize) qs.set('pageSize', String(params.pageSize))
  if (params.name) qs.set('name', params.name)
  if (params.hasActiveTasks) qs.set('hasActiveTasks', '1')
  const res = await fetch(`/api/workers?${qs.toString()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('No se pudieron obtener trabajadores paginados')
  return (await res.json()) as any
}

export async function createWorker(data: Omit<Worker, 'id'> & { id?: string }): Promise<Worker> {
  if (USE_MOCKS) {
    throw new Error('createWorker no disponible en modo mocks')
  }
  const res = await fetch('/api/workers', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('No se pudo crear trabajador')
  return (await res.json()) as Worker
}

export async function updateWorkerApi(data: Partial<Worker> & { id: string }): Promise<Worker> {
  if (USE_MOCKS) {
    throw new Error('updateWorker no disponible en modo mocks')
  }
  const res = await fetch('/api/workers', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('No se pudo actualizar trabajador')
  return (await res.json()) as Worker
}

export async function deleteWorkerApi(id: string): Promise<{ ok: true }> {
  if (USE_MOCKS) {
    throw new Error('deleteWorker no disponible en modo mocks')
  }
  const res = await fetch(`/api/workers?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('No se pudo eliminar trabajador')
  return (await res.json()) as { ok: true }
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

export async function getSectorsPage(params: { page?: number; pageSize?: number; name?: string; type?: string; status?: string; direccion?: string }): Promise<{ items: SectorPolygon[]; total: number; page: number; pageSize: number }> {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.pageSize) qs.set('pageSize', String(params.pageSize))
  if (params.name) qs.set('name', params.name)
  if (params.type) qs.set('type', params.type)
  if (params.status) qs.set('status', params.status)
  if (params.direccion) qs.set('direccion', params.direccion)
  const res = await fetch(`/api/sectores?${qs.toString()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('No se pudieron obtener sectores paginados')
  return (await res.json()) as any
}

export async function createSectorApi(data: Omit<SectorPolygon, 'id' | 'path'> & { id?: string; path: SectorPolygon['path'] }): Promise<SectorPolygon> {
  if (USE_MOCKS) throw new Error('createSector no disponible en modo mocks')
  const res = await fetch('/api/sectores', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('No se pudo crear sector')
  return (await res.json()) as SectorPolygon
}

export async function updateSectorApi(data: Partial<SectorPolygon> & { id: string }): Promise<SectorPolygon> {
  if (USE_MOCKS) throw new Error('updateSector no disponible en modo mocks')
  const res = await fetch('/api/sectores', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('No se pudo actualizar sector')
  return (await res.json()) as SectorPolygon
}

export async function deleteSectorApi(id: string): Promise<{ ok: true }> {
  if (USE_MOCKS) throw new Error('deleteSector no disponible en modo mocks')
  const res = await fetch(`/api/sectores?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('No se pudo eliminar sector')
  return (await res.json()) as { ok: true }
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

export async function getTasksPage(params: { page?: number; pageSize?: number; text?: string; status?: string; type?: string; sectorId?: string; workerId?: string; dateFrom?: string; dateTo?: string }): Promise<{ items: Task[]; total: number; page: number; pageSize: number }> {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.pageSize) qs.set('pageSize', String(params.pageSize))
  if (params.text) qs.set('text', params.text)
  if (params.status) qs.set('status', params.status)
  if (params.type) qs.set('type', params.type)
  if (params.sectorId) qs.set('sectorId', params.sectorId)
  if (params.workerId) qs.set('workerId', params.workerId)
  if (params.dateFrom) qs.set('dateFrom', params.dateFrom)
  if (params.dateTo) qs.set('dateTo', params.dateTo)
  const res = await fetch(`/api/tareas?${qs.toString()}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('No se pudieron obtener tareas paginadas')
  return (await res.json()) as any
}

export async function getTaskHistory(taskId: string): Promise<{ id: string; eventType: string; message: string; createdAt: string }[]> {
  const res = await fetch(`/api/tareas?historyTaskId=${encodeURIComponent(taskId)}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('No se pudo obtener historial de tarea')
  return (await res.json()) as any
}

export async function createTaskApi(data: Omit<Task, 'id'> & { id?: string }): Promise<Task> {
  if (USE_MOCKS) throw new Error('createTask no disponible en modo mocks')
  const res = await fetch('/api/tareas', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('No se pudo crear tarea')
  return (await res.json()) as Task
}

export async function updateTaskApi(data: Partial<Task> & { id: string }): Promise<Task> {
  if (USE_MOCKS) throw new Error('updateTask no disponible en modo mocks')
  const res = await fetch('/api/tareas', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('No se pudo actualizar tarea')
  return (await res.json()) as Task
}

export async function finishTaskApi(data: { id: string; endDate: string }): Promise<Task> {
  if (USE_MOCKS) throw new Error('finishTask no disponible en modo mocks')
  const res = await fetch('/api/tareas', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('No se pudo finalizar tarea')
  return (await res.json()) as Task
}

export async function deleteTaskApi(id: string): Promise<{ ok: true }> {
  if (USE_MOCKS) throw new Error('deleteTask no disponible en modo mocks')
  const res = await fetch(`/api/tareas?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('No se pudo eliminar tarea')
  return (await res.json()) as { ok: true }
}

export async function startTaskApi(data: { id: string; startDate: string }): Promise<Task> {
  if (USE_MOCKS) throw new Error('startTask no disponible en modo mocks')
  const res = await fetch('/api/tareas', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
  if (!res.ok) throw new Error('No se pudo iniciar tarea')
  return (await res.json()) as Task
}


