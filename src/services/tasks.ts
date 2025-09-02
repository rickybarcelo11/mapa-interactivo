import { prisma } from '../server/db/prisma'
import { z } from 'zod'
import { createTaskSchema, updateTaskSchema, finishTaskSchema } from '../validations'

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


