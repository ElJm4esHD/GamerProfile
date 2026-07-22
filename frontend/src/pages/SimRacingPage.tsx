import { formatLapTime, type CreateLapInput, type LapRecord } from "@gp/shared";
import { useCallback, useMemo, useState } from "react";
import { Dashboard } from "../features/dashboard/Dashboard.js";
import { CatalogManager } from "../features/sim/CatalogManager.js";
import { LapForm } from "../features/sim/LapForm.js";
import { EMPTY_LAP_FILTERS, filterLaps, hasActiveLapFilters } from "../features/sim/lap-filters.js";
import { ProgressionChart } from "../features/sim/ProgressionChart.js";
import { SimToolbar } from "../features/sim/SimToolbar.js";
import { useLapColumns } from "../features/sim/useLapColumns.js";
import {
  useCreateLap,
  useDeleteLap,
  useLaps,
  useSimCatalog,
  useSimStats,
  useUpdateLap,
} from "../hooks/useSim.js";
import { DataTable } from "../ui/DataTable.js";
import { ErrorBanner, Page } from "../ui/Page.js";

type Editing = { mode: "closed" } | { mode: "create" } | { mode: "edit"; lap: LapRecord };

export function SimRacingPage() {
  const laps = useLaps();
  const catalog = useSimCatalog();
  const stats = useSimStats();

  const createLap = useCreateLap();
  const updateLap = useUpdateLap();
  const deleteLap = useDeleteLap();

  const [editing, setEditing] = useState<Editing>({ mode: "closed" });
  const [filters, setFilters] = useState(EMPTY_LAP_FILTERS);
  const [managing, setManaging] = useState(false);
  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [managedSim, setManagedSim] = useState<string | null>(null);

  const handleEdit = useCallback((lap: LapRecord) => setEditing({ mode: "edit", lap }), []);

  const handleDelete = useCallback(
    (lap: LapRecord) => {
      if (confirm(`¿Borrar la vuelta de ${formatLapTime(lap.timeMs)} en ${lap.track.name}?`)) {
        deleteLap.mutate(lap.id);
      }
    },
    [deleteLap],
  );

  const columns = useLapColumns({ onEdit: handleEdit, onDelete: handleDelete });

  const all = useMemo(() => laps.data ?? [], [laps.data]);
  const visible = useMemo(() => filterLaps(all, filters), [all, filters]);

  const submit = (input: CreateLapInput): void => {
    const done = { onSuccess: () => setEditing({ mode: "closed" }) };

    if (editing.mode === "edit") {
      updateLap.mutate({ id: editing.lap.id, input }, done);
      return;
    }

    createLap.mutate(input, done);
  };

  return (
    <Page
      eyebrow="Mejores tiempos"
      title="Sim Racing"
      actions={
        <div className="flex items-center gap-2">
          {stats.data && all.length > 0 && (
            <button
              type="button"
              onClick={() => setIsEditingBoard(!isEditingBoard)}
              className={`rounded-lg border px-4 py-2 text-sm transition ${
                isEditingBoard
                  ? "border-accent/60 bg-accent/15 font-medium text-ink"
                  : "border-line text-muted hover:text-ink"
              }`}
            >
              {isEditingBoard ? "Listo" : "Personalizar"}
            </button>
          )}

          <button
            type="button"
            onClick={() => setManaging(!managing)}
            className="rounded-lg border border-line px-4 py-2 text-sm text-muted transition hover:text-ink"
          >
            Catálogo
          </button>

          {editing.mode === "closed" && (
            <button
              type="button"
              onClick={() => setEditing({ mode: "create" })}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted transition hover:border-accent/50 hover:text-ink"
            >
              + Agregar vuelta
            </button>
          )}
        </div>
      }
    >
      <ErrorBanner error={createLap.error ?? updateLap.error ?? deleteLap.error} />

      {stats.data && all.length > 0 && (
        <div className="mb-8">
          <Dashboard board="sim" stats={stats.data} isEditing={isEditingBoard} />
        </div>
      )}

      {catalog.data && all.length > 0 && (
        <ProgressionChart laps={all} tracks={catalog.data.tracks} />
      )}

      {catalog.data && managing && (
        <CatalogManager
          catalog={catalog.data}
          simGameId={managedSim}
          onSelectSim={setManagedSim}
        />
      )}

      {catalog.data && editing.mode !== "closed" && (
        <LapForm
          // La key fuerza a React a recrear el formulario al cambiar de vuelta:
          // sin esto, editar una y después otra reusaría el estado de la primera.
          key={editing.mode === "edit" ? editing.lap.id : "new"}
          catalog={catalog.data}
          lap={editing.mode === "edit" ? editing.lap : undefined}
          isPending={createLap.isPending || updateLap.isPending}
          onSubmit={submit}
          onCancel={() => setEditing({ mode: "closed" })}
        />
      )}

      {laps.isPending || catalog.isPending ? (
        <p className="text-sm text-muted">Cargando…</p>
      ) : (
        <>
          {catalog.data && (
            <SimToolbar
              filters={filters}
              catalog={catalog.data}
              onChange={setFilters}
              resultCount={visible.length}
              totalCount={all.length}
            />
          )}

          <DataTable
            data={visible}
            columns={columns}
            getRowId={(lap) => lap.id}
            initialSorting={[{ id: "time", desc: false }]}
            emptyMessage={
              hasActiveLapFilters(filters)
                ? "Ninguna vuelta coincide con los filtros."
                : "Todavía no cargaste ninguna vuelta."
            }
          />
        </>
      )}

      <p className="mt-6 text-xs text-muted">
        Se guardan todos los intentos. La estrella marca el mejor tiempo de cada combinación de
        circuito y auto.
      </p>
    </Page>
  );
}
