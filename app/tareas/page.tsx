import AppShell from "@/components/layout/app-shell"
import TasksView from "@/views/tasks-view"
import { Suspense } from "react"

export default function TareasPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-4 text-slate-400">Cargando...</div>}>
        <TasksView />
      </Suspense>
    </AppShell>
  )
}
