import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Carrot, ChefHat, ShoppingCart, Mic, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/despensa", label: "Despensa", icon: Carrot },
  { to: "/recetas", label: "Recetas", icon: ChefHat },
  { to: "/compras", label: "Compras", icon: ShoppingCart },
  { to: "/chef", label: "Chef", icon: MessageCircle },
] as const;

export function AppLayout({
  title,
  subtitle,
  children,
  fullHeight = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  fullHeight?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div
      className={cn(
        "bg-background md:flex",
        fullHeight ? "h-screen overflow-hidden" : "min-h-screen",
      )}
    >
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar px-4 py-6 md:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-warm text-primary-foreground">
            <Carrot className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold leading-tight">
            Despensa
            <br />
            <span className="text-primary">Inteligente</span>
          </span>
        </Link>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(n.to)
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <n.icon className="h-4 w-4 shrink-0" />
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/grabar"
          className="mt-6 flex items-center justify-center gap-2 rounded-xl gradient-mic px-3 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)]"
        >
          <Mic className="h-4 w-4" /> Grabar
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 px-4 py-4 backdrop-blur md:px-8">
          <div className="mx-auto grid max-w-4xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-semibold md:text-2xl">{title}</h1>
              {subtitle ? (
                <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            <Link
              to="/grabar"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full gradient-mic text-primary-foreground shadow-[var(--shadow-soft)] md:hidden"
              aria-label="Grabar lo que tengo"
            >
              <Mic className="h-5 w-5" />
            </Link>
          </div>
        </header>

        <main
          className={cn(
            "mx-auto w-full",
            fullHeight
              ? "flex-1 flex flex-col h-[calc(100vh-73px)]"
              : "max-w-4xl flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-12",
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                isActive(n.to) ? "text-primary" : "text-muted-foreground",
              )}
            >
              <n.icon className="h-5 w-5" />
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
