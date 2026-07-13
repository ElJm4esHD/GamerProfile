import { GAME_STATUSES, GAME_STATUS_LABELS, type GameStatus, type GameType } from "@gp/shared";
import { EMPTY_FILTERS, hasActiveFilters, type LibraryFilters } from "./filters.js";

interface LibraryToolbarProps {
  filters: LibraryFilters;
  gameTypes: readonly GameType[];
  onChange: (filters: LibraryFilters) => void;
  resultCount: number;
  totalCount: number;
}

export function LibraryToolbar({
  filters,
  gameTypes,
  onChange,
  resultCount,
  totalCount,
}: LibraryToolbarProps) {
  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const isFiltering = hasActiveFilters(filters);

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={filters.search}
          placeholder="Buscar por nombre…"
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          className="w-64 rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink focus:border-accent/60"
        />

        <FilterChip
          label="★ Favoritos"
          isOn={filters.onlyFavorites}
          onClick={() => onChange({ ...filters, onlyFavorites: !filters.onlyFavorites })}
        />

        <span className="mx-1 h-5 w-px bg-line" />

        {GAME_STATUSES.map((status: GameStatus) => (
          <FilterChip
            key={status}
            label={GAME_STATUS_LABELS[status]}
            isOn={filters.statuses.includes(status)}
            onClick={() => onChange({ ...filters, statuses: toggle(filters.statuses, status) })}
          />
        ))}

        <span className="mx-1 h-5 w-px bg-line" />

        {gameTypes.map((type) => (
          <FilterChip
            key={type.id}
            label={type.name}
            isOn={filters.typeIds.includes(type.id)}
            onClick={() => onChange({ ...filters, typeIds: toggle(filters.typeIds, type.id) })}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="font-mono tabular-nums">
          {isFiltering ? `${resultCount} de ${totalCount}` : `${totalCount} juegos`}
        </span>

        {isFiltering && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="underline underline-offset-4 transition hover:text-ink"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}

function FilterChip({
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
      className={`rounded-full border px-3 py-1.5 text-xs transition ${
        isOn
          ? "border-accent/60 bg-accent/15 text-ink"
          : "border-line text-muted hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
