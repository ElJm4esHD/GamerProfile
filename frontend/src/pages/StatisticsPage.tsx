import { DistributionChart } from "../features/statistics/DistributionChart.js";
import { useStats } from "../hooks/useStats.js";
import { Page } from "../ui/Page.js";

/** Las etiquetas largas se leen mejor en barras horizontales. */
const HORIZONTAL_KEYS = new Set(["genre-distribution", "platform-distribution"]);

/**
 * Estadísticas se alimenta del MISMO registro de métricas que el Dashboard:
 * toma las de tipo `distribution` y las pinta como gráficos en vez de barritas.
 * Una métrica nueva de ese tipo aparece acá sola.
 */
export function StatisticsPage() {
  const stats = useStats();

  const distributions = (stats.data ?? []).flatMap((stat) =>
    stat.value.kind === "distribution"
      ? [{ key: stat.key, label: stat.label, entries: stat.value.entries }]
      : [],
  );

  return (
    <Page eyebrow="Análisis" title="Estadísticas">
      {stats.isPending && <p className="text-sm text-muted">Calculando…</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        {distributions.map((distribution) => (
          <section
            key={distribution.key}
            className="rounded-lg border border-line bg-surface/40 p-6"
          >
            <h2 className="mb-5 font-mono text-xs uppercase tracking-[0.15em] text-muted">
              {distribution.label}
            </h2>
            <DistributionChart
              entries={distribution.entries}
              orientation={HORIZONTAL_KEYS.has(distribution.key) ? "horizontal" : "vertical"}
            />
          </section>
        ))}
      </div>
    </Page>
  );
}
