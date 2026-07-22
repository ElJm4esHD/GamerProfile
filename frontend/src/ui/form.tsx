import { useEffect, useState, type ReactNode } from "react";

/* ── Estructura ────────────────────────────────────────────────────────── */

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-surface/40 p-6">
      <h2 className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-muted">{title}</h2>
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  span,
  children,
}: {
  label: string;
  hint?: string;
  span?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${span ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted/70">{hint}</span>}
    </label>
  );
}

const INPUT_CLASS =
  "rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink transition hover:border-line focus:border-accent/60";

/* ── Campos ────────────────────────────────────────────────────────────── */

/**
 * Todos los campos comparten la misma regla: se guardan al salir (blur) o con
 * Enter, nunca en cada tecla. Un PATCH por pulsación guardaría basura a medias.
 */
function useDraft<T>(value: T, toText: (value: T) => string) {
  const [draft, setDraft] = useState(() => toText(value));
  useEffect(() => setDraft(toText(value)), [value]);
  return [draft, setDraft] as const;
}

export function TextField({
  value,
  onCommit,
  placeholder,
  autoFocus,
}: {
  value: string | null;
  onCommit: (value: string | null) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [draft, setDraft] = useDraft(value, (v) => v ?? "");

  const commit = (): void => {
    const trimmed = draft.trim();
    const next = trimmed === "" ? null : trimmed;
    if (next !== value) onCommit(next);
  };

  return (
    <input
      value={draft}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
      className={INPUT_CLASS}
    />
  );
}

export function NumberField({
  value,
  onCommit,
  min = 0,
  max,
  placeholder,
}: {
  value: number | null;
  onCommit: (value: number | null) => void;
  min?: number;
  max?: number;
  placeholder?: string;
}) {
  const [draft, setDraft] = useDraft(value, (v) => v?.toString() ?? "");

  const commit = (): void => {
    const raw = draft.trim();

    if (raw === "") {
      if (value !== null) onCommit(null);
      return;
    }

    const parsed = Number(raw);
    const isValid =
      Number.isInteger(parsed) && parsed >= min && (max === undefined || parsed <= max);

    if (!isValid) {
      setDraft(value?.toString() ?? "");
      return;
    }

    if (parsed !== value) onCommit(parsed);
  };

  return (
    <input
      inputMode="numeric"
      value={draft}
      placeholder={placeholder}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
      className={`${INPUT_CLASS} font-mono tabular-nums`}
    />
  );
}

export function DateField({
  value,
  onCommit,
}: {
  value: string | null;
  onCommit: (value: string | null) => void;
}) {
  return (
    <input
      type="date"
      value={value ?? ""}
      onChange={(event) => onCommit(event.target.value || null)}
      className={`${INPUT_CLASS} font-mono`}
    />
  );
}

/**
 * Escribís horas, se guardan minutos.
 * La base nunca ve un decimal: 2,5 → 150. Sumar floats en el dashboard te
 * devuelve 0.30000000000004 y no hay forma elegante de arreglarlo después.
 */
export function HoursField({
  minutes,
  onCommit,
}: {
  minutes: number | null;
  onCommit: (minutes: number | null) => void;
}) {
  const [draft, setDraft] = useDraft(minutes, (v) =>
    v === null ? "" : (v / 60).toFixed(1).replace(/\.0$/, ""),
  );

  const commit = (): void => {
    const raw = draft.trim().replace(",", ".");

    if (raw === "") {
      if (minutes !== null) onCommit(null);
      return;
    }

    const hours = Number(raw);
    if (!Number.isFinite(hours) || hours < 0) {
      setDraft(minutes === null ? "" : (minutes / 60).toString());
      return;
    }

    const next = Math.round(hours * 60);
    if (next !== minutes) onCommit(next);
  };

  return (
    <input
      inputMode="decimal"
      value={draft}
      placeholder="0"
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
      className={`${INPUT_CLASS} font-mono tabular-nums`}
    />
  );
}

export function SelectField<T extends { id: string; name: string }>({
  value,
  options,
  onCommit,
  emptyLabel,
}: {
  value: string | null;
  options: readonly T[];
  onCommit: (id: string | null) => void;
  emptyLabel?: string;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(event) => onCommit(event.target.value || null)}
      className={`${INPUT_CLASS} cursor-pointer`}
    >
      {emptyLabel && <option value="">{emptyLabel}</option>}
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}
