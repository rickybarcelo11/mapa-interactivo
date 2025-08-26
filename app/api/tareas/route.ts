import { listTasks, createTask, updateTask, deleteTask, finishTask } from '../../../src/services/tasks'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest) {
  try {
    const tasks = await listTasks()
    return new Response(JSON.stringify(tasks), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al obtener tareas', error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const created = await createTask(body)
    return new Response(JSON.stringify(created), { status: 201, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al crear tarea', error: message }), { status: 400, headers: { 'content-type': 'application/json' } })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const updated = await updateTask(body)
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al actualizar tarea', error: message }), { status: 400, headers: { 'content-type': 'application/json' } })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const finished = await finishTask(body)
    return new Response(JSON.stringify(finished), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al finalizar tarea', error: message }), { status: 400, headers: { 'content-type': 'application/json' } })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return new Response(JSON.stringify({ message: 'Falta id' }), { status: 400 })
    const res = await deleteTask(id)
    return new Response(JSON.stringify(res), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al eliminar tarea', error: message }), { status: 400, headers: { 'content-type': 'application/json' } })
  }
}


