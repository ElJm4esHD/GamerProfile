import type { ResolvedWidget, StatValue, WidgetSpan } from "@gp/shared";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SpanPicker, WidgetCard } from "./WidgetCard.js";

interface SortableWidgetProps {
  widget: ResolvedWidget;
  value: StatValue;
  onSpanChange: (span: WidgetSpan) => void;
  onHide: () => void;
}

/**
 * La tarjeta en modo edición: se arrastra, se le cambia el ancho y se apaga.
 *
 * El arrastre va SOLO en el asa y no en toda la tarjeta: si la tarjeta entera
 * fuera arrastrable, cada clic en los botones de ancho pelearía con el gesto.
 */
export function SortableWidget({ widget, value, onSpanChange, onHide }: SortableWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.key,
  });

  return (
    <WidgetCard
      ref={setNodeRef}
      label={widget.label}
      value={value}
      span={widget.span}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={isDragging ? "z-10 opacity-90 shadow-2xl ring-1 ring-accent/50" : ""}
      handle={
        <button
          type="button"
          aria-label={`Mover ${widget.label}`}
          className="cursor-grab touch-none rounded px-1 text-muted transition hover:text-ink active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
      }
      controls={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SpanPicker value={widget.span} onChange={onSpanChange} />

          <button
            type="button"
            onClick={onHide}
            className="rounded-md border border-line px-2 py-0.5 text-xs text-muted transition hover:border-rose-500/40 hover:text-rose-200"
          >
            Ocultar
          </button>
        </div>
      }
    />
  );
}
