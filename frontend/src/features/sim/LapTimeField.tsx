import { formatLapTime, parseLapTime } from "@gp/shared";
import { useEffect, useState } from "react";

interface LapTimeFieldProps {
  value: number | null;
  onCommit: (milliseconds: number | null) => void;
}

/**
 * Escribís "1:42.334", se guardan 102334 milisegundos.
 * El parseo vive acá y en ningún otro lado. Si el formato no se entiende, la
 * celda se pone en rojo y no se guarda nada: mejor rechazar que guardar basura.
 */
export function LapTimeField({ value, onCommit }: LapTimeFieldProps) {
  const [draft, setDraft] = useState(value === null ? "" : formatLapTime(value));
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    setDraft(value === null ? "" : formatLapTime(value));
    setIsInvalid(false);
  }, [value]);

  const commit = (): void => {
    const raw = draft.trim();

    if (raw === "") {
      setIsInvalid(false);
      if (value !== null) onCommit(null);
      return;
    }

    const parsed = parseLapTime(raw);

    if (parsed === null) {
      setIsInvalid(true);
      return;
    }

    setIsInvalid(false);
    if (parsed !== value) onCommit(parsed);
  };

  return (
    <div className="flex flex-col gap-1">
      <input
        value={draft}
        placeholder="1:42.334"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
        className={`rounded-md border bg-canvas px-3 py-2 font-mono text-sm tabular-nums text-ink ${
          isInvalid ? "border-rose-500/60" : "border-line focus:border-accent/60"
        }`}
      />
      {isInvalid && <span className="text-xs text-rose-300">Formato: 1:42.334 o 42.334</span>}
    </div>
  );
}
