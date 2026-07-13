import type { Criterion } from "@gp/shared";
import { useEffect, useState } from "react";
import { useCreateCriterion, useCriteria, useUpdateCriterion } from "../../hooks/useCatalog.js";
import { AddItemForm } from "./AddItemForm.js";

/**
 * El panel más peligroso de la app: tocar un peso recalcula el overall de
 * todos los juegos. Por eso el peso se edita al salir del campo (no en cada
 * tecla) y no hay ningún botón de borrar.
 */
export function CriteriaPanel() {
  const criteria = useCriteria();
  const create = useCreateCriterion();
  const update = useUpdateCriterion();

  return (
    <section className="rounded-lg border border-line bg-surface/40 p-6">
      <h2 className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-muted">
        Criterios de puntuación
      </h2>
      <p className="mb-5 text-xs text-muted/70">
        El Overall es el promedio ponderado de los criterios activos. Un criterio desactivado
        conserva los puntajes que ya le diste, pero deja de contar.
      </p>

      <div className="mb-6 flex flex-col gap-2">
        <div className="grid grid-cols-[1fr_5rem_5rem] gap-3 px-3 font-mono text-[10px] uppercase tracking-wider text-muted/60">
          <span>Nombre</span>
          <span className="text-center">Peso</span>
          <span className="text-center">Activo</span>
        </div>

        {(criteria.data ?? []).map((criterion) => (
          <CriterionRow
            key={criterion.id}
            criterion={criterion}
            onChange={(input) => update.mutate({ id: criterion.id, input })}
          />
        ))}
      </div>

      <AddItemForm
        placeholder="Nuevo criterio (ej: Replayability)"
        isPending={create.isPending}
        onSubmit={(name) => create.mutate({ name, weight: 1 })}
      />
    </section>
  );
}

function CriterionRow({
  criterion,
  onChange,
}: {
  criterion: Criterion;
  onChange: (input: { weight?: number; isActive?: boolean }) => void;
}) {
  const [weight, setWeight] = useState(criterion.weight.toString());

  useEffect(() => setWeight(criterion.weight.toString()), [criterion.weight]);

  const commitWeight = (): void => {
    const parsed = Number(weight.replace(",", "."));

    if (!Number.isFinite(parsed) || parsed <= 0) {
      setWeight(criterion.weight.toString());
      return;
    }

    if (parsed !== criterion.weight) onChange({ weight: parsed });
  };

  return (
    <div
      className={`grid grid-cols-[1fr_5rem_5rem] items-center gap-3 rounded-md border border-line px-3 py-2 ${
        criterion.isActive ? "" : "opacity-50"
      }`}
    >
      <span className="text-sm text-ink">{criterion.name}</span>

      <input
        inputMode="decimal"
        value={weight}
        onChange={(event) => setWeight(event.target.value)}
        onBlur={commitWeight}
        onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
        className="rounded border border-line bg-canvas py-1 text-center font-mono text-sm tabular-nums text-ink focus:border-accent/60"
      />

      <button
        type="button"
        onClick={() => onChange({ isActive: !criterion.isActive })}
        className={`rounded py-1 text-xs transition ${
          criterion.isActive ? "text-emerald-300" : "text-muted hover:text-ink"
        }`}
      >
        {criterion.isActive ? "Sí" : "No"}
      </button>
    </div>
  );
}
