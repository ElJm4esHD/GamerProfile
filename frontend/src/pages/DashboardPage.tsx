import { Link } from "react-router-dom";
import { Page } from "../ui/Page.js";

/**
 * Placeholder honesto: el sistema de widgets llega en la próxima etapa.
 * No pinto tarjetas con ceros: un dashboard que miente es peor que uno vacío.
 */
export function DashboardPage() {
  return (
    <Page eyebrow="Tu historial" title="Dashboard">
      <div className="rounded-lg border border-dashed border-line px-6 py-16 text-center">
        <p className="mb-2 text-sm text-ink">Todavía no hay estadísticas.</p>
        <p className="mx-auto max-w-md text-sm text-muted">
          Cargá horas, fechas y estados en tu{" "}
          <Link to="/library" className="text-accent underline underline-offset-4">
            biblioteca
          </Link>{" "}
          y acá vas a ver tu historial: qué terminaste, cuánto tardaste y qué estás jugando.
        </p>
      </div>
    </Page>
  );
}
