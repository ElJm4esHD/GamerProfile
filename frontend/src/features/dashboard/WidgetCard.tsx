import { WIDGET_SPANS, type StatValue, type WidgetSpan } from "@gp/shared";
import type { CSSProperties, ReactNode, Ref } from "react";
import { StatValueView } from "./StatValueView.js";
import { SPAN_CLASS } from "./widget-span.js";

interface WidgetCardProps {
  label: string;
  value: StatValue;
  span: WidgetSpan;
  /** El asa de arrastre, al lado del título. Solo en modo edición. */
  handle?: ReactNode;
  /** La barra de ancho y el botón de ocultar, al pie. Solo en modo edición. */
  controls?: ReactNode;
  ref?: Ref<HTMLElement>;
  style?: CSSProperties;
  className?: string;
}

/** La tarjeta del Dashboard. La misma se ve mirando y editando. */
export function WidgetCard({
  label,
  value,
  span,
  handle,
  controls,
  ref,
  style,
  className = "",
}: WidgetCardProps) {
  const isEditing = controls !== undefined;

  return (
    <article
      ref={ref}
      style={style}
      className={`flex flex-col gap-3 rounded-lg border bg-surface/40 p-5 ${SPAN_CLASS[span]} ${
        isEditing ? "border-dashed border-accent/40" : "border-line"
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        {handle}
        <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-muted">{label}</h2>
      </div>

      {/* Editando, las tarjetas se acomodan: no se navega. */}
      <div className={isEditing ? "pointer-events-none select-none opacity-80" : undefined}>
        <StatValueView value={value} />
      </div>

      {controls && <div className="mt-auto border-t border-line/60 pt-3">{controls}</div>}
    </article>
  );
}

/** Selector de ancho: cuántas columnas ocupa la tarjeta. */
export function SpanPicker({
  value,
  onChange,
}: {
  value: WidgetSpan;
  onChange: (span: WidgetSpan) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-muted">Ancho</span>

      <div className="flex overflow-hidden rounded-md border border-line">
        {WIDGET_SPANS.map((span) => (
          <button
            key={span}
            type="button"
            onClick={() => onChange(span)}
            aria-label={`${span} ${span === 1 ? "columna" : "columnas"}`}
            className={`px-2 py-0.5 font-mono text-xs transition ${
              span === value ? "bg-accent/20 text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {span}
          </button>
        ))}
      </div>
    </div>
  );
}
