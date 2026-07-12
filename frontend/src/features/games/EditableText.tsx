import { useEffect, useState } from "react";

interface EditableTextProps {
  value: string;
  onCommit: (value: string) => void;
}

/**
 * Guarda al salir del campo o con Enter. Nunca en cada tecla: escribir
 * "Hollow Knight" dispararía trece PATCH y guardaría trece nombres a medias.
 */
export function EditableText({ value, onCommit }: EditableTextProps) {
  const [draft, setDraft] = useState(value);

  // Si el valor real cambia (refetch, rollback), el borrador lo sigue.
  useEffect(() => setDraft(value), [value]);

  const commit = (): void => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) {
      setDraft(value);
      return;
    }
    onCommit(trimmed);
  };

  return (
    <input
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          setDraft(value);
          event.currentTarget.blur();
        }
      }}
      className="w-full rounded px-2 py-1 font-medium hover:bg-raised focus:bg-raised"
    />
  );
}
