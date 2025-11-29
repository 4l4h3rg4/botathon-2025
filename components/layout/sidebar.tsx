"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Search,
  Users,
  MessageSquare,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Buscador",
    href: "/buscador",
    icon: Search,
  },
  {
    title: "Asistente AI",
    href: "/asistente",
    icon: Bot,
  },
  {
    title: "Voluntarios",
    href: "/voluntarios",
    icon: Users,
  },
  {
    title: "Comunicaciones",
    href: "/comunicaciones",
    icon: MessageSquare,
  },
  {
    title: "Logs",
    href: "/logs",
    icon: FileText,
  },
  {
    title: "Configuración",
    href: "/configuracion",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "sticky top-16 flex h-[calc(100vh-4rem)] flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "")} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="w-full justify-center">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  )
}
