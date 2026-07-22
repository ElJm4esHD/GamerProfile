import {
  resolveWidgets,
  toDashboardLayout,
  type DashboardBoard,
  type ResolvedWidget,
  type StatResult,
} from "@gp/shared";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useMemo } from "react";
import { useDashboardLayout } from "../../hooks/useDashboardLayout.js";
import { ErrorBanner } from "../../ui/Page.js";
import { SortableWidget } from "./SortableWidget.js";
import { WidgetCard } from "./WidgetCard.js";

const GRID_CLASS = "grid gap-4 sm:grid-cols-2 lg:grid-cols-4";

interface DashboardProps {
  /** Cada tablero guarda su propio layout. */
  board: DashboardBoard;
  stats: readonly StatResult[];
  isEditing: boolean;
}

/**
 * La grilla del Dashboard, con su modo edición.
 *
 * Sigue sin haber un `if` por métrica en ningún lado: recorre lo que devuelve
 * la API y pinta. Lo único que agrega el layout guardado es el orden, el ancho
 * y qué se muestra — una métrica nueva del backend sigue apareciendo sola.
 */
export function Dashboard({ board, stats, isEditing }: DashboardProps) {
  const { layout, save, reset, error } = useDashboardLayout(board);

  const widgets = useMemo(() => resolveWidgets(stats, layout), [stats, layout]);
  const values = useMemo(() => new Map(stats.map((stat) => [stat.key, stat.value])), [stats]);

  const visible = widgets.filter((widget) => widget.isVisible);
  const hidden = widgets.filter((widget) => !widget.isVisible);

  const sensors = useSensors(
    // Un umbral de 6px: un clic en un botón de la tarjeta no arranca un arrastre.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const apply = (next: readonly ResolvedWidget[]): void => save(toDashboardLayout(next));

  const patch = (key: string, change: Partial<ResolvedWidget>): void =>
    apply(widgets.map((widget) => (widget.key === key ? { ...widget, ...change } : widget)));

  const handleDragEnd = ({ active, over }: DragEndEvent): void => {
    if (!over || active.id === over.id) return;

    const from = visible.findIndex((widget) => widget.key === active.id);
    const to = visible.findIndex((widget) => widget.key === over.id);
    if (from === -1 || to === -1) return;

    // Las ocultas van al final: no ocupan lugar en el orden visible.
    apply([...arrayMove(visible, from, to), ...hidden]);
  };

  if (!isEditing) {
    return (
      <div className={GRID_CLASS}>
        {visible.map((widget) => {
          const value = values.get(widget.key);
          if (!value) return null;

          return (
            <WidgetCard
              key={widget.key}
              label={widget.label}
              value={value}
              span={widget.span}
            />
          );
        })}
      </div>
    );
  }

  return (
    <>
      <ErrorBanner error={error} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">
        <p className="text-xs text-muted">
          Arrastrá desde <span className="font-mono text-ink">⠿</span> para reordenar, elegí el
          ancho de cada tarjeta y ocultá las que no mirás nunca. Se guarda solo.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs text-muted transition hover:text-ink"
        >
          Restablecer
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={visible.map((widget) => widget.key)}
          strategy={rectSortingStrategy}
        >
          <div className={GRID_CLASS}>
            {visible.map((widget) => {
              const value = values.get(widget.key);
              if (!value) return null;

              return (
                <SortableWidget
                  key={widget.key}
                  widget={widget}
                  value={value}
                  onSpanChange={(span) => patch(widget.key, { span })}
                  onHide={() => patch(widget.key, { isVisible: false })}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {visible.length === 0 && (
        <p className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
          Ocultaste todas las tarjetas. Prendé alguna acá abajo.
        </p>
      )}

      <section className="mt-6 rounded-lg border border-dashed border-line p-4">
        <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-muted">Ocultas</h3>

        {hidden.length === 0 ? (
          <p className="text-xs text-muted/70">
            Ninguna: todo lo que calcula el backend está a la vista.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {hidden.map((widget) => (
              <button
                key={widget.key}
                type="button"
                onClick={() => patch(widget.key, { isVisible: true })}
                className="rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-accent/60 hover:text-ink"
              >
                + {widget.label}
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
