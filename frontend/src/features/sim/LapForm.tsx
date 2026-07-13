import type { CreateLapInput, LapRecord, SimCatalog } from "@gp/shared";
import { useState } from "react";
import { useCreateCar, useCreateTrack } from "../../hooks/useSim.js";
import { DateField, Field, TextField } from "../../ui/form.js";
import { LapTimeField } from "./LapTimeField.js";
import { SelectOrCreate } from "./SelectOrCreate.js";
import { SetupEditor, toSetupPayload, type SetupRow } from "./SetupEditor.js";

interface LapFormProps {
  catalog: SimCatalog;
  lap?: LapRecord;
  isPending: boolean;
  onSubmit: (input: CreateLapInput) => void;
  onCancel: () => void;
}

interface FormState {
  simGameId: string | null;
  trackId: string | null;
  carId: string | null;
  timeMs: number | null;
  recordedAt: string;
  weather: string | null;
  timeOfDay: string | null;
  notes: string | null;
  setup: SetupRow[];
}

const today = (): string => new Date().toISOString().slice(0, 10);

function initialState(lap?: LapRecord): FormState {
  if (!lap) {
    return {
      simGameId: null,
      trackId: null,
      carId: null,
      timeMs: null,
      recordedAt: today(),
      weather: null,
      timeOfDay: null,
      notes: null,
      setup: [],
    };
  }

  return {
    simGameId: lap.simGame.id,
    trackId: lap.track.id,
    carId: lap.car.id,
    timeMs: lap.timeMs,
    recordedAt: lap.recordedAt,
    weather: lap.weather,
    timeOfDay: lap.timeOfDay,
    notes: lap.notes,
    setup: lap.setup.map((entry) => ({ paramId: entry.paramId, value: entry.value })),
  };
}

/**
 * A diferencia del resto de la app, acá hay botón de guardar.
 *
 * No es una inconsistencia: una vuelta sin tiempo, circuito y auto no existe,
 * así que no se puede crear una fila vacía y editarla después como en la
 * biblioteca. El autosave sirve para lo que ya existe, no para lo que se está
 * creando.
 */
export function LapForm({ catalog, lap, isPending, onSubmit, onCancel }: LapFormProps) {
  const [form, setForm] = useState<FormState>(() => initialState(lap));

  const createTrack = useCreateTrack();
  const createCar = useCreateCar();

  const patch = (changes: Partial<FormState>): void => setForm({ ...form, ...changes });

  /** Cambiar de simulador invalida circuito, auto y setup: son de otro juego. */
  const changeSimGame = (simGameId: string | null): void =>
    setForm({ ...form, simGameId, trackId: null, carId: null, setup: [] });

  const tracks = catalog.tracks.filter((track) => track.simGameId === form.simGameId);
  const cars = catalog.cars.filter((car) => car.simGameId === form.simGameId);

  const { simGameId, trackId, carId, timeMs } = form;
  const isValid = simGameId !== null && trackId !== null && carId !== null && timeMs !== null;

  const submit = (): void => {
    if (!simGameId || !trackId || !carId || !timeMs) return;

    onSubmit({
      simGameId,
      trackId,
      carId,
      timeMs,
      recordedAt: form.recordedAt,
      weather: form.weather,
      timeOfDay: form.timeOfDay,
      notes: form.notes,
      setup: toSetupPayload(form.setup),
    });
  };

  return (
    <div className="mb-6 flex flex-col gap-6 rounded-lg border border-line bg-surface/40 p-6">
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Simulador">
          <select
            value={simGameId ?? ""}
            onChange={(event) => changeSimGame(event.target.value || null)}
            className="cursor-pointer rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink focus:border-accent/60"
          >
            <option value="">—</option>
            {catalog.games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Circuito / Stage">
          <SelectOrCreate
            value={trackId}
            options={tracks}
            placeholder="Agregar nuevo…"
            isPending={createTrack.isPending}
            disabled={!simGameId}
            onSelect={(id) => patch({ trackId: id })}
            onCreate={(name) =>
              createTrack.mutateAsync({ simGameId: simGameId ?? "", name, kind: "circuit" })
            }
          />
        </Field>

        <Field label="Auto">
          <SelectOrCreate
            value={carId}
            options={cars}
            placeholder="Agregar nuevo…"
            isPending={createCar.isPending}
            disabled={!simGameId}
            onSelect={(id) => patch({ carId: id })}
            onCreate={(name) => createCar.mutateAsync({ simGameId: simGameId ?? "", name })}
          />
        </Field>

        <Field label="Tiempo" hint="Se guarda en milisegundos">
          <LapTimeField value={timeMs} onCommit={(value) => patch({ timeMs: value })} />
        </Field>

        <Field label="Fecha del récord">
          <DateField
            value={form.recordedAt}
            onCommit={(recordedAt) => patch({ recordedAt: recordedAt ?? today() })}
          />
        </Field>

        <Field label="Clima">
          <TextField
            value={form.weather}
            placeholder="Seco / Lluvia"
            onCommit={(weather) => patch({ weather })}
          />
        </Field>

        <Field label="Hora">
          <TextField
            value={form.timeOfDay}
            placeholder="Mediodía / Noche"
            onCommit={(timeOfDay) => patch({ timeOfDay })}
          />
        </Field>

        <Field label="Notas">
          <TextField value={form.notes} onCommit={(notes) => patch({ notes })} />
        </Field>
      </div>

      <div>
        <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">Setup</h3>
        <SetupEditor
          simGameId={simGameId}
          params={catalog.params}
          rows={form.setup}
          onChange={(setup) => patch({ setup })}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={!isValid || isPending}
          className="rounded-md border border-accent/50 bg-accent/15 px-4 py-2 text-sm font-medium text-ink transition hover:bg-accent/25 disabled:opacity-40"
        >
          {lap ? "Guardar cambios" : "Guardar vuelta"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-line px-4 py-2 text-sm text-muted transition hover:text-ink"
        >
          Cancelar
        </button>

        {!isValid && (
          <span className="text-xs text-muted">Faltan simulador, circuito, auto o tiempo.</span>
        )}
      </div>
    </div>
  );
}
