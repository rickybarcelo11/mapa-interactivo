import { prisma } from '../server/db/prisma'
import { z } from 'zod'
import { createWorkerSchema, updateWorkerSchema } from '../validations'

const workerSchema = z.object({
  id: z.string(),
  name: z.string(),
  observaciones: z.string().optional().nullable(),
})

export type WorkerDTO = z.infer<typeof workerSchema>

export async function listWorkers(): Promise<WorkerDTO[]> {
  const rows = await prisma.worker.findMany({ orderBy: { name: 'asc' } })
  return rows.map(r => ({ id: r.id, name: r.name, observaciones: r.observaciones ?? undefined }))
}

export interface ListWorkersPageParams {
  page?: number
  pageSize?: number
  name?: string
  hasActiveTasks?: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export async function listWorkersPage(params: ListWorkersPageParams): Promise<PaginatedResponse<WorkerDTO>> {
  const page = Math.max(1, Math.floor(params.page ?? 1))
  const pageSize = Math.min(100, Math.max(1, Math.floor(params.pageSize ?? 20)))

  const where: Parameters<typeof prisma.worker.findMany>[0]['where'] = {}
  if (params.name && params.name.trim() !== '') {
    where.name = { contains: params.name.trim(), mode: 'insensitive' }
  }

  // Nota: hasActiveTasks requiere join con tasks; lo resolvemos con subconsulta count
  if (params.hasActiveTasks) {
    // No se puede expresar directamente en 'where' sin relación, así que filtramos post-consulta
    const totalAll = await prisma.worker.count({ where })
    const rowsAll = await prisma.worker.findMany({ where, orderBy: { name: 'asc' } })
    const withFlag = await Promise.all(rowsAll.map(async (w) => {
      const activeCount = await prisma.task.count({ where: { assignedWorkerId: w.id, NOT: { status: 'completado' } } })
      return { worker: w, active: activeCount > 0 }
    }))
    const filtered = withFlag.filter(x => x.active).map(x => x.worker)
    const total = filtered.length
    const paged = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
    const items = paged.map(r => ({ id: r.id, name: r.name, observaciones: r.observaciones ?? undefined }))
    return { items, total, page, pageSize }
  }

  const total = await prisma.worker.count({ where })
  const rows = await prisma.worker.findMany({
    where,
    orderBy: { name: 'asc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })
  const items = rows.map(r => ({ id: r.id, name: r.name, observaciones: r.observaciones ?? undefined }))
  return { items, total, page, pageSize }
}

export async function createWorker(input: unknown): Promise<WorkerDTO> {
  const data = createWorkerSchema.parse(input)
  const row = await prisma.worker.create({
    data: {
      // permitimos id externo solo si viene (para compatibilidad con mocks), si no cuid()
      id: (data as { id?: string }).id ?? undefined,
      name: data.name,
      observaciones: data.observaciones ?? null,
    }
  })
  return { id: row.id, name: row.name, observaciones: row.observaciones ?? undefined }
}

export async function updateWorker(input: unknown): Promise<WorkerDTO> {
  const data = updateWorkerSchema.parse(input)
  const row = await prisma.worker.update({
    where: { id: data.id },
    data: {
      name: data.name ?? undefined,
      observaciones: data.observaciones ?? undefined,
    }
  })
  return { id: row.id, name: row.name, observaciones: row.observaciones ?? undefined }
}

export async function deleteWorker(id: string): Promise<{ ok: true }> {
  // Evitar eliminación si tiene tareas asociadas
  const totalTasks = await prisma.task.count({ where: { assignedWorkerId: id } })
  if (totalTasks > 0) {
    throw new Error('No se puede eliminar: el trabajador tiene tareas asociadas')
  }
  await prisma.worker.delete({ where: { id } })
  return { ok: true }
}


