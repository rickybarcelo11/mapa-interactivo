import type { SectorStatus } from "@/src/types"

const statusToColor: Record<SectorStatus, string> = {
  pendiente: "#ef4444",
  "en proceso": "#eab308",
  completado: "#22c55e",
}

export const getSectorColor = (status: SectorStatus): string => statusToColor[status]


