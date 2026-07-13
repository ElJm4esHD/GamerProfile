import { Link } from "react-router-dom";
import { WidgetGrid } from "../features/dashboard/WidgetGrid.js";
import { useStats } from "../hooks/useStats.js";
import { Page } from "../ui/Page.js";

export function DashboardPage() {
  const stats = useStats();

  return (
    <Page eyebrow="Tu historial" title="Dashboard">
      {stats.isPending && <p className="text-sm text-muted">Calculando…</p>}

      {stats.isError && (
        <p className="text-sm text-rose-200">
          No se pudieron calcular las estadísticas. ¿Está corriendo el backend?
        </p>
      )}

      {stats.data && <WidgetGrid stats={stats.data} />}

      <p className="mt-6 text-xs text-muted">
        Las tarjetas vacías se llenan cargando fechas y horas en la{" "}
        <Link to="/library" className="text-accent underline underline-offset-4">
          biblioteca
        </Link>
        .
      </p>
    </Page>
  );
}
