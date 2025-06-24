import type { StreetWithSections, IndividualTree } from "../types"

export const streetsData: StreetWithSections[] = [
  {
    id: "street1",
    name: "Avenida de los Robles",
    sections: [
      {
        id: "section1",
        addressRange: "1200-1300",
        sidewalkSide: "Ambas",
        predominantSpecies: "Roble",
        treeCount: 15,
        generalStatus: "Bueno"
      }
    ]
  }
]

export const individualTreesData: IndividualTree[] = [
  {
    id: "tree1",
    species: "Roble",
    status: "Sano",
    streetName: "Avenida de los Robles",
    streetNumber: "1200",
    sidewalk: "Norte",
    location: { lat: -34.6037, lng: -58.3816 },
    plantingDate: "2020-03-15",
    lastPruningDate: "2023-12-01",
    observations: "Árbol saludable, crecimiento normal"
  }
]
