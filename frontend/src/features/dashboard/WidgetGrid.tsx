import type { StatResult } from "@gp/shared";
import { StatValueView } from "./StatValueView.js";
import { spanClassFor } from "./widget-layout.js";

/**
 * La grilla recorre lo que devuelve la API y pinta.
 * No hay un `if` por métrica en ningún lado: agregar una tarjeta al Dashboard
 * es agregar una métrica al registro del backend.
 */
export function WidgetGrid({ stats }: { stats: readonly StatResult[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <article
          key={stat.key}
          className={`flex flex-col gap-3 rounded-lg border border-line bg-surface/40 p-5 ${spanClassFor(stat.key)}`}
        >
          <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-muted">{stat.label}</h2>
          <StatValueView value={stat.value} />
        </article>
      ))}
    </div>
  );
}
