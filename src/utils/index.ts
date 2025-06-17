import type { TreeSection } from "@/types"

export const getConsolidatedValue = (values: string[]): string => {
  const uniqueValues = [...new Set(values.filter((v) => v))]
  if (uniqueValues.length === 0) return "N/A"
  if (uniqueValues.length === 1) return uniqueValues[0]
  return uniqueValues.slice(0, 2).join(", ") + (uniqueValues.length > 2 ? "..." : "")
}

type StreetOrientation = "N/S" | "E/W" | "AmbasOnly" | "Mixed_Unsupported"

export const getStreetOrientation = (sections: TreeSection[]): StreetOrientation => {
  const sides = new Set(sections.map((s) => s.sidewalkSide))
  const hasNorth = sides.has("Norte")
  const hasSouth = sides.has("Sur")
  const hasEast = sides.has("Este")
  const hasWest = sides.has("Oeste")

  if (hasNorth || hasSouth) return "N/S"
  if (hasEast || hasWest) return "E/W"

  return "AmbasOnly"
}
