import { Link, useLocation } from "wouter"
import { Shield, Activity, FileText, BarChart3, Info, Crosshair } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Dashboard", icon: Activity },
  { href: "/analyze", label: "Analyze Trace", icon: Crosshair },
  { href: "/cases", label: "Incident Cases", icon: FileText },
  { href: "/evaluation", label: "Evaluation", icon: BarChart3 },
  { href: "/about", label: "About", icon: Info },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()

  return (
    <div className="flex min-h-[100dvh] w-full bg-background flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-r border-border bg-card flex flex-col shrink-0 sticky top-0 md:h-[100dvh] z-20">
        <div className="h-14 flex items-center px-4 md:px-6 border-b border-border shrink-0">
          <Shield className="w-5 h-5 text-primary mr-2" />
          <span className="font-bold text-sm tracking-tight text-foreground uppercase">AGENTTRIPWIRE</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            System Operational
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 bg-muted/20">
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
