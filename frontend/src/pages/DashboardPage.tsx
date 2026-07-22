import { useState } from "react";
import { Link } from "react-router-dom";
import { Dashboard } from "../features/dashboard/Dashboard.js";
import { useStats } from "../hooks/useStats.js";
import { Page } from "../ui/Page.js";

export function DashboardPage() {
  const stats = useStats();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Page
      eyebrow="Tu historial"
      title="Dashboard"
      actions={
        stats.data && (
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`rounded-lg border px-4 py-2 text-sm transition ${
              isEditing
                ? "border-accent/60 bg-accent/15 font-medium text-ink"
                : "border-line text-muted hover:border-accent/50 hover:text-ink"
            }`}
          >
            {isEditing ? "Listo" : "Personalizar"}
          </button>
        )
      }
    >
      {stats.isPending && <p className="text-sm text-muted">Calculando…</p>}

      {stats.isError && (
        <p className="text-sm text-rose-200">
          No se pudieron calcular las estadísticas. ¿Está corriendo el backend?
        </p>
      )}

      {stats.data && <Dashboard board="library" stats={stats.data} isEditing={isEditing} />}

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
