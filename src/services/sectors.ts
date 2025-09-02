import { prisma } from '../server/db/prisma'
import { z } from 'zod'
import { createSectorSchema, updateSectorSchema } from '../validations'

const coordinateSchema = z.object({ lat: z.number(), lng: z.number() })
const sectorSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['Poda', 'Corte de pasto']),
  status: z.enum(['pendiente', 'en proceso', 'completado']),
  path: z.array(coordinateSchema),
  direccion: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
})

export type SectorDTO = z.infer<typeof sectorSchema>

function mapStatusToUi(status: string): SectorDTO['status'] {
  if (status === 'en_proceso') return 'en proceso'
  if (status === 'pendiente' || status === 'completado') return status
  return 'pendiente'
}

function mapTypeToUi(type: string): SectorDTO['type'] {
  return type === 'Corte_de_pasto' ? 'Corte de pasto' : 'Poda'
}

export async function listSectors(): Promise<SectorDTO[]> {
  const rows = await prisma.sector.findMany({ orderBy: { name: 'asc' } })
  const mapped = rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: mapTypeToUi(r.type as unknown as string),
    status: mapStatusToUi(r.status as unknown as string),
    path: (r.path as unknown as { lat: number; lng: number }[]) ?? [],
    direccion: r.direccion ?? undefined,
    observaciones: r.observaciones ?? undefined,
  }))
  // valida y limpia
  return mapped.map((m) => sectorSchema.parse(m))
}

function mapStatusToDb(status: SectorDTO['status']): 'pendiente' | 'en_proceso' | 'completado' {
  return status === 'en proceso' ? 'en_proceso' : status
}

function mapTypeToDb(type: SectorDTO['type']): 'Poda' | 'Corte_de_pasto' {
  return type === 'Corte de pasto' ? 'Corte_de_pasto' : 'Poda'
}

export async function createSector(input: unknown): Promise<SectorDTO> {
  const data = createSectorSchema.parse(input)
  const row = await prisma.sector.create({
    data: {
      id: (data as { id?: string }).id ?? undefined,
      name: data.name,
      type: mapTypeToDb(data.type),
      status: mapStatusToDb(data.status),
      path: data.path as unknown as object,
      direccion: data.direccion ?? null,
      observaciones: data.observaciones ?? null,
    }
  })

  // Crear tarea 1:1 asociada al sector recién creado (pendiente, sin iniciar)
  try {
    // Asegurar trabajador "Sin asignar"
    let unassigned = await prisma.worker.findFirst({ where: { name: 'Sin asignar' } })
    if (!unassigned) {
      unassigned = await prisma.worker.create({ data: { name: 'Sin asignar', observaciones: null } })
    }
    // Crear tarea base (status pendiente). Usamos la fecha de hoy como startDate base.
    const today = new Date()
    await prisma.task.create({
      data: {
        sectorId: row.id,
        sectorName: row.name,
        type: row.type === 'Corte_de_pasto' ? 'Corte de pasto' : 'Poda',
        status: 'pendiente',
        startDate: new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())),
        endDate: null,
        assignedWorkerId: unassigned.id,
        assignedWorkerName: unassigned.name,
        observations: null,
      }
    })
  } catch (e) {
    // No interrumpir la creación del sector si falla la tarea; loguear en servidor
    console.error('No se pudo crear la tarea inicial del sector', e)
  }
  return {
    id: row.id,
    name: row.name,
    type: mapTypeToUi(row.type as unknown as string),
    status: mapStatusToUi(row.status as unknown as string),
    path: row.path as unknown as { lat: number; lng: number }[],
    direccion: row.direccion ?? undefined,
    observaciones: row.observaciones ?? undefined,
  }
}

export async function updateSector(input: unknown): Promise<SectorDTO> {
  const data = updateSectorSchema.parse(input)
  const row = await prisma.sector.update({
    where: { id: data.id },
    data: {
      name: data.name ?? undefined,
      type: data.type ? mapTypeToDb(data.type) : undefined,
      status: data.status ? mapStatusToDb(data.status) : undefined,
      path: (data as { path?: { lat: number; lng: number }[] }).path ?? undefined,
      direccion: data.direccion ?? undefined,
      observaciones: data.observaciones ?? undefined,
    }
  })
  return {
    id: row.id,
    name: row.name,
    type: mapTypeToUi(row.type as unknown as string),
    status: mapStatusToUi(row.status as unknown as string),
    path: row.path as unknown as { lat: number; lng: number }[],
    direccion: row.direccion ?? undefined,
    observaciones: row.observaciones ?? undefined,
  }
}

export async function deleteSector(id: string): Promise<{ ok: true }> {
  // Al eliminar un sector, eliminamos en cascada sus tareas asociadas
  await prisma.task.deleteMany({ where: { sectorId: id } })
  await prisma.sector.delete({ where: { id } })
  return { ok: true }
}


