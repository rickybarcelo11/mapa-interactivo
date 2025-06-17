"use client"

import { Button } from "@/components/ui/button"
import { Settings2 } from "lucide-react"

interface ToolsFabProps {
  onOpenTools: () => void
}

export default function ToolsFab({ onOpenTools }: ToolsFabProps) {
  return (
    <Button
      variant="default"
      size="lg"
      className="fixed bottom-8 right-8 rounded-full shadow-lg w-16 h-16 bg-sky-500 hover:bg-sky-600"
      onClick={onOpenTools}
      aria-label="Abrir panel de herramientas"
    >
      <Settings2 className="h-7 w-7" />
    </Button>
  )
}
