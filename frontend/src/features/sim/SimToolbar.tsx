import type { SimCatalog } from "@gp/shared";
import { EMPTY_LAP_FILTERS, hasActiveLapFilters, type LapFilters } from "./lap-filters.js";

interface SimToolbarProps {
  filters: LapFilters;
  catalog: SimCatalog;
  onChange: (filters: LapFilters) => void;
  resultCount: number;
  totalCount: number;
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function SimToolbar({
  filters,
  catalog,
  onChange,
  resultCount,
  totalCount,
}: SimToolbarProps) {
  const isFiltering = hasActiveLapFilters(filters);

  // Circuitos y autos se acotan al simulador elegido: mostrar los stages de
  // Dirt cuando estás filtrando Assetto Corsa sería ruido puro.
  const selectedGames = filters.simGameIds;
  const inScope = <T extends { simGameId: string }>(items: readonly T[]): T[] =>
    selectedGames.length === 0
      ? [...items]
      : items.filter((item) => selectedGames.includes(item.simGameId));

  return (
    <div className="mb-5 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {catalog.games.map((game) => (
          <Chip
            key={game.id}
            label={game.name}
            isOn={filters.simGameIds.includes(game.id)}
            onClick={() =>
              onChange({
                ...filters,
                simGameIds: toggle(filters.simGameIds, game.id),
                // Cambiar de juego invalida los filtros de circuito y auto.
                trackIds: [],
                carIds: [],
              })
            }
          />
        ))}

        <span className="mx-1 h-5 w-px bg-line" />

        <Chip
          label="Solo mejores"
          isOn={filters.onlyPersonalBests}
          onClick={() => onChange({ ...filters, onlyPersonalBests: !filters.onlyPersonalBests })}
        />
      </div>

      <FilterRow
        label="Circuito"
        options={inScope(catalog.tracks)}
        selected={filters.trackIds}
        onToggle={(id) => onChange({ ...filters, trackIds: toggle(filters.trackIds, id) })}
      />

      <FilterRow
        label="Auto"
        options={inScope(catalog.cars)}
        selected={filters.carIds}
        onToggle={(id) => onChange({ ...filters, carIds: toggle(filters.carIds, id) })}
      />

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="font-mono tabular-nums">
          {isFiltering ? `${resultCount} de ${totalCount}` : `${totalCount} vueltas`}
        </span>

        {isFiltering && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_LAP_FILTERS)}
            className="underline underline-offset-4 transition hover:text-ink"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}

function FilterRow({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: readonly { id: string; name: string }[];
  selected: readonly string[];
  onToggle: (id: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className="flex items-baseline gap-3">
      <span className="w-20 shrink-0 font-mono text-xs uppercase tracking-wider text-muted/70">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <Chip
            key={option.id}
            label={option.name}
            isOn={selected.includes(option.id)}
            onClick={() => onToggle(option.id)}
          />
        ))}
      </div>
    </div>
  );
}

function Chip({
  label,
  isOn,
  onClick,
}: {
  label: string;
  isOn: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition ${
        isOn ? "border-accent/60 bg-accent/15 text-ink" : "border-line text-muted hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
