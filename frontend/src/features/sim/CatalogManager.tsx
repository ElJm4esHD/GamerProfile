import type { SimCatalog } from "@gp/shared";
import { useDeleteCatalogItem } from "../../hooks/useSim.js";

interface CatalogManagerProps {
  catalog: SimCatalog;
  simGameId: string | null;
  onSelectSim: (simGameId: string | null) => void;
}

type Kind = "track" | "car" | "param";

/**
 * Borrar circuitos, autos y parámetros — pero solo los que no están en uso.
 *
 * El backend se niega (409) si algo tiene vueltas asociadas, y acá el botón ya
 * viene deshabilitado con el conteo. Los parámetros son el caso más delicado:
 * `lap_setup_values` tiene ON DELETE CASCADE, así que borrar uno usado te
 * vaciaría ese valor en todas las vueltas sin avisar.
 */
export function CatalogManager({ catalog, simGameId, onSelectSim }: CatalogManagerProps) {
  const remove = useDeleteCatalogItem();

  const inScope = <T extends { simGameId: string }>(items: readonly T[]): T[] =>
    items.filter((item) => item.simGameId === simGameId);

  return (
    <div className="mb-6 flex flex-col gap-5 rounded-lg border border-line bg-surface/40 p-6">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Simulador</span>
        <select
          value={simGameId ?? ""}
          onChange={(event) => onSelectSim(event.target.value || null)}
          className="cursor-pointer rounded-md border border-line bg-canvas px-3 py-1.5 text-sm text-ink focus:border-accent/60"
        >
          <option value="">—</option>
          {catalog.games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </select>
      </div>

      {remove.error && (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
          {remove.error.message}
        </p>
      )}

      {!simGameId ? (
        <p className="text-xs text-muted">Elegí un simulador para ver su catálogo.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <ItemList
            title="Circuitos / Stages"
            items={inScope(catalog.tracks)}
            onDelete={(id) => remove.mutate({ kind: "track", id })}
          />
          <ItemList
            title="Autos"
            items={inScope(catalog.cars)}
            onDelete={(id) => remove.mutate({ kind: "car", id })}
          />
          <ItemList
            title="Parámetros de setup"
            items={inScope(catalog.params)}
            onDelete={(id) => remove.mutate({ kind: "param", id })}
          />
        </div>
      )}

      <p className="text-xs text-muted/70">
        Solo se puede borrar lo que no está en uso. Si un ítem tiene vueltas asociadas, el número
        indica cuántas.
      </p>
    </div>
  );
}

function ItemList({
  title,
  items,
  onDelete,
}: {
  title: string;
  items: readonly { id: string; name: string; usageCount: number }[];
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-muted">{title}</h3>

      {items.length === 0 ? (
        <p className="text-xs text-muted/60">Vacío.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const isUsed = item.usageCount > 0;

            return (
              <li
                key={item.id}
                className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5"
              >
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{item.name}</span>

                {isUsed && (
                  <span className="shrink-0 font-mono text-xs text-muted">{item.usageCount}</span>
                )}

                <button
                  type="button"
                  disabled={isUsed}
                  title={
                    isUsed
                      ? `Usado en ${item.usageCount} ${item.usageCount === 1 ? "vuelta" : "vueltas"}`
                      : "Borrar"
                  }
                  onClick={() => onDelete(item.id)}
                  className="shrink-0 rounded px-2 text-xs text-muted transition hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:text-muted"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
