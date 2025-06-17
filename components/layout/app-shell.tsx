import type React from "react"
import Navbar from "./navbar"

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  )
}
