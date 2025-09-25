import type { ReportData } from "@/views/reports-view"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { JSX } from "react"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface ReportChartsProps {
  reportData: ReportData
}

// Colores para los gráficos (simplificado)
const chartColors = ["#38bdf8", "#facc15", "#4ade80", "#f87171", "#818cf8", "#fb923c"]

export default function ReportCharts({ reportData }: ReportChartsProps) {
  const { tasksByStatusForChart, tasksByTypeForChart } = reportData

  const totalStatusTasks = tasksByStatusForChart.reduce((sum, item) => sum + item.value, 0)
  const totalTypeTasks = tasksByTypeForChart.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="bg-slate-800 border-slate-700 text-slate-50">
        <CardHeader>
          <CardTitle className="text-xl text-sky-400">Tareas por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          {totalStatusTasks > 0 ? (
            <ChartContainer
              config={{
                pendiente: { label: "Pendiente", color: chartColors[0] },
                "en proceso": { label: "En Proceso", color: chartColors[1] },
                completado: { label: "Completado", color: chartColors[2] },
              }}
              className="h-64 w-full"
            >
              <BarChart data={tasksByStatusForChart as any}>
                <CartesianGrid vertical={false} stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: "#cbd5e1" }} tickLine={false} axisLine={{ stroke: "#475569" }} />
                <YAxis tick={{ fill: "#cbd5e1" }} tickLine={false} axisLine={{ stroke: "#475569" }} allowDecimals={false} />
                <ChartTooltip cursor={{ fill: "#33415550" }} content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {tasksByStatusForChart.map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Bar>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-slate-400">No hay datos para el gráfico de estado.</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700 text-slate-50">
        <CardHeader>
          <CardTitle className="text-xl text-sky-400">Tareas por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          {totalTypeTasks > 0 ? (
            <ChartContainer
              config={{}}
              className="h-64 w-full flex items-center justify-center"
            >
              <PieChart>
                <Pie data={tasksByTypeForChart as any} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {tasksByTypeForChart.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          ) : (
            <p className="text-slate-400">No hay datos para el gráfico de tipo.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
