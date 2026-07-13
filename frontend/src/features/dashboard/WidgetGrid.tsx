import type { StatResult } from "@gp/shared";
import { StatValueView } from "./StatValueView.js";
import { spanClassFor } from "./widget-layout.js";

interface WidgetGridProps {
  stats: readonly StatResult[];
  /** Cada módulo decide el ancho de sus tarjetas. Por defecto, el de la biblioteca. */
  spanFor?: (key: string) => string;
}

/**
 * La grilla recorre lo que devuelve la API y pinta.
 * No hay un `if` por métrica en ningún lado: agregar una tarjeta es agregar
 * una métrica al registro del backend.
 */
export function WidgetGrid({ stats, spanFor = spanClassFor }: WidgetGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <article
          key={stat.key}
          className={`flex flex-col gap-3 rounded-lg border border-line bg-surface/40 p-5 ${spanFor(stat.key)}`}
        >
          <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-muted">{stat.label}</h2>
          <StatValueView value={stat.value} />
        </article>
      ))}
    </div>
  );
}
