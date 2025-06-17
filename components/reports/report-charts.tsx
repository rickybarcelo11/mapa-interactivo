import type { ReportData } from "@/views/reports-view"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { JSX } from "react"

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
            <div className="w-full h-64 p-4 bg-slate-700 rounded">
              <p className="text-sm text-slate-400 mb-2">Gráfico de Barras (Simulación)</p>
              <svg
                width="100%"
                height="80%"
                viewBox={`0 0 ${tasksByStatusForChart.length * 60} 100`}
                preserveAspectRatio="none"
              >
                {tasksByStatusForChart.map((item, index) => {
                  const barHeight = item.value > 0 ? (item.value / totalStatusTasks) * 80 : 0
                  return (
                    <g key={item.name}>
                      <rect
                        x={index * 60 + 10}
                        y={90 - barHeight}
                        width="40"
                        height={barHeight}
                        fill={chartColors[index % chartColors.length]}
                      />
                      <text x={index * 60 + 30} y={90 - barHeight - 2} fill="#cbd5e1" textAnchor="middle" fontSize="10">
                        {item.value}
                      </text>
                      <text
                        x={index * 60 + 30}
                        y="98"
                        fill="#cbd5e1"
                        textAnchor="middle"
                        fontSize="10"
                        className="capitalize"
                      >
                        {item.name}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
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
            <div className="w-full h-64 p-4 bg-slate-700 rounded flex flex-col items-center justify-center">
              <p className="text-sm text-slate-400 mb-2">Gráfico de Torta (Simulación)</p>
              <svg width="150" height="150" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke="#475569"
                  strokeWidth="3"
                ></circle>
                {
                  tasksByTypeForChart.reduce(
                    (acc, item, index, arr) => {
                      const percentage = (item.value / totalTypeTasks) * 100
                      const offset = acc.offset
                      const dasharray = `${percentage} ${100 - percentage}`
                      acc.elements.push(
                        <circle
                          key={item.name}
                          cx="18"
                          cy="18"
                          r="15.91549430918954"
                          fill="transparent"
                          stroke={chartColors[index % chartColors.length]}
                          strokeWidth="3.5"
                          strokeDasharray={dasharray}
                          strokeDashoffset={`-${offset}`}
                          transform="rotate(-90 18 18)"
                        />,
                      )
                      acc.offset += percentage
                      return acc
                    },
                    { elements: [] as JSX.Element[], offset: 0 },
                  ).elements
                }
              </svg>
              <div className="mt-3 text-xs space-y-1">
                {tasksByTypeForChart.map((item, index) => (
                  <div key={item.name} className="flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    ></span>
                    {item.name}: {item.value} ({((item.value / totalTypeTasks) * 100).toFixed(1)}%)
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-400">No hay datos para el gráfico de tipo.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
