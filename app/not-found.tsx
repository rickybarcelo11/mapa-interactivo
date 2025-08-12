export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-3xl font-bold text-slate-100">Página no encontrada</h1>
      <p className="text-slate-400 mt-2 max-w-xl">La ruta solicitada no existe o fue movida.</p>
      <a href="/" className="mt-6 inline-block px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-md">Volver al inicio</a>
    </div>
  )
}
