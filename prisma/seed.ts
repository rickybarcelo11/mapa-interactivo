import { PrismaClient, Status, SectorType } from '@prisma/client'
import { workersData } from '../src/data/workers.data'
import { sectorsData } from '../src/data/sectors.data'
import { tasksData } from '../src/data/tasks.data'

const prisma = new PrismaClient()

async function main() {
  // Workers
  await prisma.worker.deleteMany()
  await prisma.worker.createMany({
    data: workersData.map(w => ({ id: w.id, name: w.name, observaciones: w.observaciones ?? null }))
  })

  // Sectors
  await prisma.task.deleteMany()
  await prisma.sector.deleteMany()

  await Promise.all(sectorsData.map(s =>
    prisma.sector.create({
      data: {
        id: s.id,
        name: s.name,
        type: s.type === 'Poda' ? SectorType.Poda : SectorType.Corte_de_pasto,
        status: s.status === 'pendiente' ? Status.pendiente : s.status === 'en proceso' ? Status.en_proceso : Status.completado,
        path: s.path as unknown as object,
        direccion: s.direccion ?? null,
        observaciones: s.observaciones ?? null,
      }
    })
  ))

  // Tasks
  const sectorIds = new Set(sectorsData.map(s => s.id))
  const tasksToCreate = tasksData.filter(t => sectorIds.has(t.sectorId))
  await Promise.all(tasksToCreate.map(t =>
    prisma.task.create({
      data: {
        id: t.id,
        sectorId: t.sectorId,
        sectorName: t.sectorName,
        type: t.type,
        status: t.status === 'pendiente' ? Status.pendiente : t.status === 'en proceso' ? Status.en_proceso : Status.completado,
        startDate: new Date(t.startDate + 'T00:00:00.000Z'),
        endDate: t.endDate ? new Date(t.endDate + 'T00:00:00.000Z') : null,
        assignedWorkerId: t.assignedWorkerId,
        assignedWorkerName: t.assignedWorkerName,
        observations: t.observations || null,
      }
    })
  ))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })


