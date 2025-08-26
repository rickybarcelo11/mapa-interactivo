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

export async function createWorker(input: unknown): Promise<WorkerDTO> {
  const data = createWorkerSchema.parse(input)
  const row = await prisma.worker.create({
    data: {
      // permitimos id externo solo si viene (para compatibilidad con mocks), si no cuid()
      id: (data as any).id ?? undefined,
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


