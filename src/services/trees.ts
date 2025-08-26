import type { StreetWithSections, IndividualTree } from '../types'

export async function listStreetSections(): Promise<StreetWithSections[]> {
  const { streetsData } = await import('../data/trees.data')
  return streetsData as StreetWithSections[]
}

export async function listIndividualTrees(): Promise<IndividualTree[]> {
  const { individualTreesData } = await import('../data/trees.data')
  return individualTreesData as IndividualTree[]
}


