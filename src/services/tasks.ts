import { prisma } from '../server/db/prisma'
import { z } from 'zod'
import { createTaskSchema, updateTaskSchema, finishTaskSchema, startTaskSchema } from '../validations'

const taskSchema = z.object({
  id: z.string(),
  sectorId: z.string(),
  sectorName: z.string(),
  type: z.string(),
  status: z.enum(['pendiente', 'en proceso', 'completado']),
  startDate: z.string(),
  endDate: z.string().nullable(),
  assignedWorkerId: z.string(),
  assignedWorkerName: z.string(),
  observations: z.string().optional().nullable(),
})

export type TaskDTO = z.infer<typeof taskSchema>

function mapStatusToUi(status: string): TaskDTO['status'] {
  if (status === 'en_proceso') return 'en proceso'
  if (status === 'pendiente' || status === 'completado') return status
  return 'pendiente'
}

function toDateString(d: Date | null): string | null {
  if (!d) return null
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export async function listTasks(): Promise<TaskDTO[]> {
  const rows = await prisma.task.findMany({ orderBy: { startDate: 'desc' } })
  const mapped = rows.map((r) => ({
    id: r.id,
    sectorId: r.sectorId,
    sectorName: r.sectorName,
    type: r.type,
    status: mapStatusToUi(r.status as unknown as string),
    startDate: toDateString(r.startDate)!,
    endDate: toDateString(r.endDate),
    assignedWorkerId: r.assignedWorkerId,
    assignedWorkerName: r.assignedWorkerName,
    observations: r.observations ?? undefined,
  }))
  return mapped.map((m) => taskSchema.parse(m))
}

export interface ListTasksPageParams {
  page?: number
  pageSize?: number
  text?: string
  status?: TaskDTO['status'] | 'todos'
  type?: string | 'todos'
  sectorId?: string | 'todos'
  workerId?: string | 'todos'
  dateFrom?: string
  dateTo?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export async function listTasksPage(params: ListTasksPageParams): Promise<PaginatedResponse<TaskDTO>> {
  const page = Math.max(1, Math.floor(params.page ?? 1))
  const pageSize = Math.min(100, Math.max(1, Math.floor(params.pageSize ?? 20)))

  const where: Parameters<typeof prisma.task.findMany>[0]['where'] = {}
  const andConditions: typeof where['AND'] = []

  if (params.text && params.text.trim() !== '') {
    const text = params.text.trim()
    andConditions.push({
      OR: [
        { sectorName: { contains: text, mode: 'insensitive' } },
        { type: { contains: text, mode: 'insensitive' } },
        { assignedWorkerName: { contains: text, mode: 'insensitive' } },
      ]
    })
  }
  if (params.status && params.status !== 'todos') {
    andConditions.push({ status: params.status === 'en proceso' ? 'en_proceso' : params.status })
  }
  if (params.type && params.type !== 'todos') {
    andConditions.push({ type: params.type })
  }
  if (params.sectorId && params.sectorId !== 'todos') {
    andConditions.push({ sectorId: params.sectorId })
  }
  if (params.workerId && params.workerId !== 'todos') {
    andConditions.push({ assignedWorkerId: params.workerId })
  }
  if (params.dateFrom) {
    andConditions.push({ startDate: { gte: new Date(`${params.dateFrom}T00:00:00.000Z`) } })
  }
  if (params.dateTo) {
    andConditions.push({ startDate: { lte: new Date(`${params.dateTo}T23:59:59.999Z`) } })
  }

  if (andConditions.length > 0) where.AND = andConditions

  const total = await prisma.task.count({ where })
  const rows = await prisma.task.findMany({
    where,
    orderBy: { startDate: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  const items = rows.map((r) => taskSchema.parse({
    id: r.id,
    sectorId: r.sectorId,
    sectorName: r.sectorName,
    type: r.type,
    status: mapStatusToUi(r.status as unknown as string),
    startDate: toDateString(r.startDate)!,
    endDate: toDateString(r.endDate),
    assignedWorkerId: r.assignedWorkerId,
    assignedWorkerName: r.assignedWorkerName,
    observations: r.observations ?? undefined,
  }))

  return { items, total, page, pageSize }
}

function mapStatusToDb(status: TaskDTO['status']): 'pendiente' | 'en_proceso' | 'completado' {
  return status === 'en proceso' ? 'en_proceso' : status
}

function toDate(d: string | null | undefined): Date | null | undefined {
  if (d === null || d === undefined) return d
  return new Date(`${d}T00:00:00.000Z`)
}

export async function createTask(input: unknown): Promise<TaskDTO> {
  const data = createTaskSchema.parse(input)
  const row = await prisma.task.create({
    data: {
      id: (data as { id?: string }).id ?? undefined,
      sectorId: data.sectorId,
      sectorName: (data as { sectorName?: string }).sectorName ?? '',
      type: data.type,
      status: mapStatusToDb(data.status),
      startDate: toDate(data.startDate)!,
      endDate: toDate((data as { endDate?: string | null }).endDate ?? null) ?? null,
      assignedWorkerId: data.assignedWorkerId,
      assignedWorkerName: (data as { assignedWorkerName?: string }).assignedWorkerName ?? '',
      observations: (data as { observations?: string | null }).observations ?? null,
    }
  })
  // Sincronizar estado del sector tras creación
  try {
    await prisma.sector.update({ where: { id: row.sectorId }, data: { status: row.status as any } })
  } catch {}
  await prisma.taskHistory.create({
    data: {
      taskId: row.id,
      eventType: 'Created',
      message: `Tarea creada para ${row.sectorName} (tipo: ${row.type})`
    }
  })
  return {
    id: row.id,
    sectorId: row.sectorId,
    sectorName: row.sectorName,
    type: row.type,
    status: mapStatusToUi(row.status as unknown as string),
    startDate: toDateString(row.startDate)!,
    endDate: toDateString(row.endDate),
    assignedWorkerId: row.assignedWorkerId,
    assignedWorkerName: row.assignedWorkerName,
    observations: row.observations ?? undefined,
  }
}

export async function updateTask(input: unknown): Promise<TaskDTO> {
  const data = updateTaskSchema.parse(input)
  const row = await prisma.task.update({
    where: { id: data.id },
    data: {
      sectorId: data.sectorId ?? undefined,
      sectorName: (data as { sectorName?: string }).sectorName ?? undefined,
      type: data.type ?? undefined,
      status: data.status ? mapStatusToDb(data.status) : undefined,
      startDate: data.startDate ? toDate(data.startDate)! : undefined,
      endDate:
        (data as { endDate?: string | null }).endDate !== undefined
          ? toDate((data as { endDate?: string | null }).endDate ?? null) ?? null
          : undefined,
      assignedWorkerId: data.assignedWorkerId ?? undefined,
      assignedWorkerName: (data as { assignedWorkerName?: string }).assignedWorkerName ?? undefined,
      observations: (data as { observations?: string | null }).observations ?? undefined,
    }
  })
  // Sincronizar estado del sector con el de la tarea actualizada
  try {
    await prisma.sector.update({ where: { id: row.sectorId }, data: { status: row.status as any } })
  } catch {}
  await prisma.taskHistory.create({
    data: {
      taskId: row.id,
      eventType: 'Updated',
      message: `Tarea actualizada (tipo: ${row.type}, estado: ${row.status})`
    }
  })
  return {
    id: row.id,
    sectorId: row.sectorId,
    sectorName: row.sectorName,
    type: row.type,
    status: mapStatusToUi(row.status as unknown as string),
    startDate: toDateString(row.startDate)!,
    endDate: toDateString(row.endDate),
    assignedWorkerId: row.assignedWorkerId,
    assignedWorkerName: row.assignedWorkerName,
    observations: row.observations ?? undefined,
  }
}

export async function finishTask(input: unknown): Promise<TaskDTO> {
  const data = finishTaskSchema.parse(input)
  const row = await prisma.task.update({
    where: { id: data.id },
    data: {
      status: 'completado',
      endDate: toDate(data.endDate)!,
    }
  })
  // Marcar sector como completado
  try {
    await prisma.sector.update({ where: { id: row.sectorId }, data: { status: 'completado' } })
  } catch {}
  await prisma.taskHistory.create({
    data: {
      taskId: row.id,
      eventType: 'Finished',
      message: `Tarea finalizada en ${toDateString(row.endDate)}`
    }
  })
  return {
    id: row.id,
    sectorId: row.sectorId,
    sectorName: row.sectorName,
    type: row.type,
    status: mapStatusToUi(row.status as unknown as string),
    startDate: toDateString(row.startDate)!,
    endDate: toDateString(row.endDate),
    assignedWorkerId: row.assignedWorkerId,
    assignedWorkerName: row.assignedWorkerName,
    observations: row.observations ?? undefined,
  }
}

export async function startTask(input: unknown): Promise<TaskDTO> {
  const data = startTaskSchema.parse(input)
  const row = await prisma.task.update({
    where: { id: data.id },
    data: {
      status: 'en_proceso',
      startDate: toDate(data.startDate)!,
    }
  })
  // Marcar sector como en_proceso
  try {
    await prisma.sector.update({ where: { id: row.sectorId }, data: { status: 'en_proceso' } })
  } catch {}
  await prisma.taskHistory.create({
    data: {
      taskId: row.id,
      eventType: 'Started',
      message: `Tarea iniciada en ${toDateString(row.startDate)}`
    }
  })
  return {
    id: row.id,
    sectorId: row.sectorId,
    sectorName: row.sectorName,
    type: row.type,
    status: mapStatusToUi(row.status as unknown as string),
    startDate: toDateString(row.startDate)!,
    endDate: toDateString(row.endDate),
    assignedWorkerId: row.assignedWorkerId,
    assignedWorkerName: row.assignedWorkerName,
    observations: row.observations ?? undefined,
  }
}

export async function deleteTask(id: string): Promise<{ ok: true }> {
  await prisma.task.delete({ where: { id } })
  return { ok: true }
}

export async function listTaskHistory(taskId: string): Promise<{ id: string; eventType: string; message: string; createdAt: string }[]> {
  const rows = await prisma.taskHistory.findMany({ where: { taskId }, orderBy: { createdAt: 'desc' } })
  return rows.map(r => ({ id: r.id, eventType: r.eventType as unknown as string, message: r.message, createdAt: toDateString(r.createdAt as unknown as Date)! }))
}


