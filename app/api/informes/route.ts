import { NextRequest } from 'next/server'
import { prisma } from '../../../src/server/db/prisma'

export const runtime = 'nodejs'

function toDateString(d: Date | null): string | null {
  if (!d) return null
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function mapStatusToUi(status: string): 'pendiente' | 'en proceso' | 'completado' {
  if (status === 'en_proceso') return 'en proceso'
  if (status === 'pendiente' || status === 'completado') return status as any
  return 'pendiente'
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined
    const status = searchParams.get('status') || undefined
    const type = searchParams.get('type') || undefined
    const sectorId = searchParams.get('sectorId') || undefined
    const workerId = searchParams.get('workerId') || undefined

    const where: Parameters<typeof prisma.task.findMany>[0]['where'] = {}
    const andConditions: typeof where['AND'] = []

    if (status && status !== 'todos') {
      andConditions.push({ status: status === 'en proceso' ? 'en_proceso' : (status as any) })
    }
    if (type && type !== 'todos') {
      andConditions.push({ type })
    }
    if (sectorId && sectorId !== 'todos') {
      andConditions.push({ sectorId })
    }
    if (workerId && workerId !== 'todos') {
      andConditions.push({ assignedWorkerId: workerId })
    }
    if (dateFrom) {
      andConditions.push({ startDate: { gte: new Date(`${dateFrom}T00:00:00.000Z`) } })
    }
    if (dateTo) {
      andConditions.push({ startDate: { lte: new Date(`${dateTo}T23:59:59.999Z`) } })
    }
    if (andConditions.length > 0) where.AND = andConditions

    const rows = await prisma.task.findMany({ where })

    const tasks = rows.map((r) => ({
      id: r.id,
      sectorId: r.sectorId,
      sectorName: r.sectorName,
      type: r.type,
      status: mapStatusToUi(r.status as any),
      startDate: toDateString(r.startDate)!,
      endDate: toDateString(r.endDate),
      assignedWorkerId: r.assignedWorkerId,
      assignedWorkerName: r.assignedWorkerName,
      observations: r.observations ?? ''
    }))

    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === 'completado').length
    const pendingTasks = tasks.filter((t) => t.status === 'pendiente').length
    const inProgressTasks = tasks.filter((t) => t.status === 'en proceso').length
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    const typeSet = Array.from(new Set(tasks.map((t) => t.type)))
    const completionByType = typeSet.map((tType) => {
      const tasksOfType = tasks.filter((t) => t.type === tType)
      const completedOfType = tasksOfType.filter((t) => t.status === 'completado').length
      return {
        type: tType,
        total: tasksOfType.length,
        completed: completedOfType,
        percentage: tasksOfType.length > 0 ? (completedOfType / tasksOfType.length) * 100 : 0,
      }
    })

    const sectorCounts = tasks.reduce((acc, t) => {
      acc[t.sectorName] = (acc[t.sectorName] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const activeSectors = Object.entries(sectorCounts)
      .map(([name, taskCount]) => ({ name, taskCount }))
      .sort((a, b) => b.taskCount - a.taskCount)
      .slice(0, 5)

    const tasksByStatusForChart = [
      { name: 'pendiente', value: pendingTasks },
      { name: 'en proceso', value: inProgressTasks },
      { name: 'completado', value: completedTasks },
    ]
    const tasksByTypeForChart = Object.entries(tasks.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))

    const response = {
      filteredTasks: tasks,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      completionPercentage,
      completionByType,
      activeSectors,
      tasksByStatusForChart,
      tasksByTypeForChart,
    }

    return new Response(JSON.stringify(response), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al generar informe', error: message }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}


