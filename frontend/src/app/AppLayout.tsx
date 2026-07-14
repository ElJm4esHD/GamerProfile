import { NavLink, Outlet } from "react-router-dom";

/** Agregar una sección = una línea acá y una ruta en el router. */
const NAV_ITEMS = [
  { to: "/", label: "Dashboard" },
  { to: "/library", label: "Biblioteca" },
  { to: "/rankings", label: "Rankings" },
  { to: "/sim-racing", label: "Sim Racing" },
  { to: "/statistics", label: "Estadísticas" },
  { to: "/recommendations", label: "Recomendaciones" },
  { to: "/wishlist", label: "Por jugar" },
  { to: "/settings", label: "Ajustes" },
] as const;

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-line bg-surface/40 px-4 py-8">
        <p className="mb-8 px-3 text-sm font-bold tracking-tight">GamerProfile</p>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-raised font-medium text-ink"
                    : "text-muted hover:bg-raised/50 hover:text-ink"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
