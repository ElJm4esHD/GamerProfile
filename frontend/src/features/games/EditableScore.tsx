import { RATING_MAX, RATING_MIN } from "@gp/shared";
import { useEffect, useState } from "react";

interface EditableScoreProps {
  value: number | null;
  onCommit: (value: number | null) => void;
  /** Vacío = borrar el valor. Si no se permite, un campo vacío revierte. */
  allowEmpty?: boolean;
  className?: string;
}

/** Celda numérica 0–100. Rechaza cualquier cosa fuera de rango. */
export function EditableScore({
  value,
  onCommit,
  allowEmpty = false,
  className = "",
}: EditableScoreProps) {
  const [draft, setDraft] = useState(value?.toString() ?? "");

  useEffect(() => setDraft(value?.toString() ?? ""), [value]);

  const commit = (): void => {
    const raw = draft.trim();

    if (raw === "") {
      if (allowEmpty && value !== null) onCommit(null);
      else setDraft(value?.toString() ?? "");
      return;
    }

    const parsed = Number(raw);
    const isValid = Number.isInteger(parsed) && parsed >= RATING_MIN && parsed <= RATING_MAX;

    if (!isValid || parsed === value) {
      setDraft(value?.toString() ?? "");
      return;
    }

    onCommit(parsed);
  };

  return (
    <input
      inputMode="numeric"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          setDraft(value?.toString() ?? "");
          event.currentTarget.blur();
        }
      }}
      className={`w-full rounded py-1 text-center font-mono tabular-nums hover:bg-raised focus:bg-raised ${className}`}
    />
  );
}
