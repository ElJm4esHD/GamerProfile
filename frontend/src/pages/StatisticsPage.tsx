import { Page } from "../ui/Page.js";

export function StatisticsPage() {
  return (
    <Page eyebrow="Análisis" title="Estadísticas">
      <div className="rounded-lg border border-dashed border-line px-6 py-16 text-center text-sm text-muted">
        Gráficos y comparaciones por año. Llegan después del Dashboard.
      </div>
    </Page>
  );
}
