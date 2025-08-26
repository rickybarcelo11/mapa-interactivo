import { listStreetSections, listIndividualTrees } from '../../../src/services/trees'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const [streets, trees] = await Promise.all([
      listStreetSections(),
      listIndividualTrees(),
    ])
    return new Response(JSON.stringify({ streets, trees }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al obtener arbolado', error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}


