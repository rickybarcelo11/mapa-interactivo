import type { ReportData } from "@/views/reports-view"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ReportSummaryProps {
  reportData: ReportData
}

export default function ReportSummary({ reportData }: ReportSummaryProps) {
  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-50">
      <CardHeader>
        <CardTitle className="text-xl text-sky-400">Resumen Estadístico</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-700 rounded-md">
            <p className="text-sm text-slate-400">Total Tareas</p>
            <p className="text-2xl font-bold text-slate-100">{reportData.totalTasks}</p>
          </div>
          <div className="p-3 bg-slate-700 rounded-md">
            <p className="text-sm text-slate-400">Completadas</p>
            <p className="text-2xl font-bold text-green-400">{reportData.completedTasks}</p>
          </div>
          <div className="p-3 bg-slate-700 rounded-md">
            <p className="text-sm text-slate-400">En Proceso</p>
            <p className="text-2xl font-bold text-yellow-400">{reportData.inProgressTasks}</p>
          </div>
          <div className="p-3 bg-slate-700 rounded-md">
            <p className="text-sm text-slate-400">Pendientes</p>
            <p className="text-2xl font-bold text-red-400">{reportData.pendingTasks}</p>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-slate-200 mb-1">Cumplimiento General</h4>
          <p className="text-3xl font-bold text-sky-300">{reportData.completionPercentage.toFixed(1)}%</p>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-slate-200 mb-2">Cumplimiento por Tipo de Tarea</h4>
          <ul className="space-y-1">
            {reportData.completionByType.map((item) => (
              <li key={item.type} className="text-sm text-slate-300">
                {item.type}: {item.percentage.toFixed(1)}% ({item.completed}/{item.total})
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-slate-200 mb-2">Sectores Más Activos (Top 5)</h4>
          {reportData.activeSectors.length > 0 ? (
            <ul className="space-y-1">
              {reportData.activeSectors.map((sector) => (
                <li key={sector.name} className="text-sm text-slate-300">
                  {sector.name}: {sector.taskCount} tareas
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No hay actividad de sectores para mostrar.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
