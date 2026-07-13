interface Option {
  id: string;
  name: string;
}

interface ChipSelectProps {
  options: readonly Option[];
  selectedIds: readonly string[];
  onToggle: (ids: string[]) => void;
}

/**
 * Un chip por opción, se prende y se apaga. Sin dropdowns ni librerías:
 * con 8 plataformas y 16 géneros, ver todo de una es más rápido que buscar.
 * Sirve igual para plataformas, géneros y tags.
 */
export function ChipSelect({ options, selectedIds, onToggle }: ChipSelectProps) {
  const selected = new Set(selectedIds);

  const toggle = (id: string): void => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onToggle([...next]);
  };

  if (options.length === 0) {
    return <p className="text-xs text-muted">No hay opciones cargadas.</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const isOn = selected.has(option.id);

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => toggle(option.id)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              isOn
                ? "border-accent/60 bg-accent/15 text-ink"
                : "border-line text-muted hover:border-line hover:text-ink"
            }`}
          >
            {option.name}
          </button>
        );
      })}
    </div>
  );
}
