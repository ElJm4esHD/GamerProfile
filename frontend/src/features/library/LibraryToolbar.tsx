import {
  GAME_STATUSES,
  GAME_STATUS_LABELS,
  type GameStatus,
  type GameType,
  type Genre,
  type Platform,
} from "@gp/shared";
import { EMPTY_FILTERS, hasActiveFilters, type LibraryFilters } from "./filters.js";

interface LibraryToolbarProps {
  filters: LibraryFilters;
  gameTypes: readonly GameType[];
  genres: readonly Genre[];
  platforms: readonly Platform[];
  onChange: (filters: LibraryFilters) => void;
  resultCount: number;
  totalCount: number;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function LibraryToolbar({
  filters,
  gameTypes,
  genres,
  platforms,
  onChange,
  resultCount,
  totalCount,
}: LibraryToolbarProps) {
  const isFiltering = hasActiveFilters(filters);

  return (
    <div className="mb-5 flex flex-col gap-3">
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

        {GAME_STATUSES.map((status: GameStatus) => (
          <FilterChip
            key={status}
            label={GAME_STATUS_LABELS[status]}
            isOn={filters.statuses.includes(status)}
            onClick={() => onChange({ ...filters, statuses: toggle(filters.statuses, status) })}
          />
        ))}
      </div>

      <FilterRow
        label="Tipo"
        options={gameTypes}
        selected={filters.typeIds}
        onToggle={(id) => onChange({ ...filters, typeIds: toggle(filters.typeIds, id) })}
      />

      <FilterRow
        label="Género"
        options={genres}
        selected={filters.genreIds}
        onToggle={(id) => onChange({ ...filters, genreIds: toggle(filters.genreIds, id) })}
      />

      <FilterRow
        label="Plataforma"
        options={platforms}
        selected={filters.platformIds}
        onToggle={(id) => onChange({ ...filters, platformIds: toggle(filters.platformIds, id) })}
      />

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
          <FilterChip
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
      className={`rounded-full border px-3 py-1 text-xs transition ${
        isOn ? "border-accent/60 bg-accent/15 text-ink" : "border-line text-muted hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
