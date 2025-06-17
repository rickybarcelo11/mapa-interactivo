import Link from "next/link"

const navItems = [
  { name: "Home", href: "/" },
  { name: "Sectores", href: "/sectores" },
  { name: "Tareas", href: "/tareas" },
  { name: "Trabajadores", href: "/trabajadores" },
  { name: "Árboles", href: "/arboles" },
  { name: "Informes", href: "/informes" },
]

export default function Navbar() {
  return (
    <nav className="bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-xl text-sky-400">Gestión Municipal</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          {/* Mobile menu button could be added here */}
        </div>
      </div>
    </nav>
  )
}
