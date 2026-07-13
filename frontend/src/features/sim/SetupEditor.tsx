import type { SetupParam } from "@gp/shared";
import { useCreateSetupParam } from "../../hooks/useSim.js";
import { SelectOrCreate } from "./SelectOrCreate.js";

/** Una fila del setup: qué parámetro y con qué valor. */
export interface SetupRow {
  paramId: string | null;
  value: string;
}

interface SetupEditorProps {
  simGameId: string | null;
  params: readonly SetupParam[];
  rows: SetupRow[];
  onChange: (rows: SetupRow[]) => void;
}

/**
 * Se ve y se usa como el JSON que imaginaste: pares clave-valor que agregás y
 * borrás a gusto. Por debajo, cada clave es una fila de `setup_params` creada
 * una sola vez por juego. Por eso "Camber Front" no convive nunca con
 * "camber front", y el día de mañana se puede preguntar con qué presión de
 * neumáticos andás más rápido.
 */
export function SetupEditor({ simGameId, params, rows, onChange }: SetupEditorProps) {
  const createParam = useCreateSetupParam();

  const available = params.filter((param) => param.simGameId === simGameId);
  const used = new Set(rows.map((row) => row.paramId));

  const update = (index: number, patch: Partial<SetupRow>): void => {
    onChange(rows.map((row, position) => (position === index ? { ...row, ...patch } : row)));
  };

  const remove = (index: number): void => {
    onChange(rows.filter((_, position) => position !== index));
  };

  if (!simGameId) {
    return <p className="text-xs text-muted">Elegí un simulador para cargar el setup.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="w-56 shrink-0">
            <SelectOrCreate
              value={row.paramId}
              // No se ofrece un parámetro ya usado en otra fila: una vuelta no
              // puede tener dos veces "Camber Front".
              options={available.filter(
                (param) => param.id === row.paramId || !used.has(param.id),
              )}
              placeholder="Nuevo parámetro…"
              isPending={createParam.isPending}
              onSelect={(paramId) => update(index, { paramId })}
              onCreate={(name) => createParam.mutateAsync({ simGameId, name })}
            />
          </div>

          <input
            value={row.value}
            placeholder="Valor"
            onChange={(event) => update(index, { value: event.target.value })}
            className="min-w-0 flex-1 rounded-md border border-line bg-canvas px-3 py-2 font-mono text-sm text-ink focus:border-accent/60"
          />

          <button
            type="button"
            onClick={() => remove(index)}
            title="Quitar parámetro"
            className="rounded-md border border-line px-3 py-2 text-xs text-muted transition hover:border-rose-500/40 hover:text-rose-200"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...rows, { paramId: null, value: "" }])}
        className="self-start rounded-md border border-dashed border-line px-4 py-2 text-xs text-muted transition hover:border-accent/50 hover:text-ink"
      >
        + Agregar parámetro
      </button>
    </div>
  );
}

/** Las filas completas, listas para mandar al backend. */
export function toSetupPayload(rows: readonly SetupRow[]): Record<string, string> {
  const payload: Record<string, string> = {};

  for (const row of rows) {
    if (row.paramId && row.value.trim() !== "") payload[row.paramId] = row.value.trim();
  }

  return payload;
}
