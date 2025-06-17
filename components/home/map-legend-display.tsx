const legendItems = [
  { color: "bg-red-500", label: "Pendiente" },
  { color: "bg-yellow-500", label: "En Proceso" },
  { color: "bg-green-500", label: "Completado" },
]

export default function MapLegendDisplay() {
  return (
    <div className="absolute bottom-4 left-4 bg-slate-800 bg-opacity-80 p-3 rounded-lg shadow-md">
      <h4 className="text-sm font-semibold text-slate-200 mb-2">Leyenda de Estados</h4>
      <div className="space-y-1">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center">
            <span className={`w-4 h-4 rounded-sm inline-block mr-2 ${item.color}`} />
            <span className="text-xs text-slate-300">{item.label}</span>
          </div>
        ))}
      </div>
      {/* Aquí podrías añadir dinámicamente los tipos filtrados */}
    </div>
  )
}
