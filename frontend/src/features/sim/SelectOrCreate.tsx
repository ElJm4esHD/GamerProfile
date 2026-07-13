import { useState } from "react";

interface Option {
  id: string;
  name: string;
}

interface SelectOrCreateProps {
  value: string | null;
  options: readonly Option[];
  placeholder: string;
  isPending: boolean;
  disabled?: boolean;
  onSelect: (id: string | null) => void;
  onCreate: (name: string) => Promise<Option>;
}

/**
 * Elegís de la lista o escribís uno nuevo.
 *
 * El backend hace findOrCreate por (juego, nombre): escribir "Spa" dos veces
 * no crea dos circuitos. Es lo que evita duplicar información sin obligarte a
 * ir a una pantalla de administración cada vez que corrés en un lado nuevo.
 */
export function SelectOrCreate({
  value,
  options,
  placeholder,
  isPending,
  disabled = false,
  onSelect,
  onCreate,
}: SelectOrCreateProps) {
  const [draft, setDraft] = useState("");

  const create = async (): Promise<void> => {
    const name = draft.trim();
    if (!name) return;

    const created = await onCreate(name);
    onSelect(created.id);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-1.5">
      <select
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onSelect(event.target.value || null)}
        className="cursor-pointer rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink focus:border-accent/60 disabled:opacity-40"
      >
        <option value="">—</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>

      <div className="flex gap-1.5">
        <input
          value={draft}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && void create()}
          className="min-w-0 flex-1 rounded-md border border-line bg-canvas px-3 py-1.5 text-xs text-ink focus:border-accent/60 disabled:opacity-40"
        />
        <button
          type="button"
          onClick={() => void create()}
          disabled={disabled || !draft.trim() || isPending}
          className="rounded-md border border-line px-3 py-1.5 text-xs text-muted transition hover:text-ink disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
