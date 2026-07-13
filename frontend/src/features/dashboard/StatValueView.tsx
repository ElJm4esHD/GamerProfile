import { formatMinutes, type StatValue } from "@gp/shared";
import { Link } from "react-router-dom";

/**
 * Un renderer por cada `kind` de StatValue.
 *
 * El Dashboard no conoce ninguna métrica por nombre: mira el tipo del valor y
 * elige. Por eso una métrica nueva en el backend aparece sola, sin tocar React.
 */
export function StatValueView({ value }: { value: StatValue }) {
  switch (value.kind) {
    case "number":
      return <NumberView value={value.value} unit={value.unit} />;
    case "duration":
      return <NumberView value={value.minutes === null ? null : formatMinutes(value.minutes)} />;
    case "game":
      return <GameView game={value.game} caption={value.caption} />;
    case "gameList":
      return <GameListView games={value.games} />;
    case "distribution":
      return <DistributionView entries={value.entries} />;
  }
}

function Empty() {
  return <p className="text-sm text-muted/60">Sin datos</p>;
}

function NumberView({ value, unit }: { value: number | string | null; unit?: string }) {
  if (value === null) return <Empty />;

  return (
    <p className="font-mono text-3xl font-bold tabular-nums text-ink">
      {value}
      {unit && <span className="ml-1.5 text-sm font-normal text-muted">{unit}</span>}
    </p>
  );
}

function GameView({
  game,
  caption,
}: {
  game: { id: string; name: string } | null;
  caption?: string;
}) {
  if (!game) return <Empty />;

  return (
    <div>
      <Link
        to={`/library/${game.id}`}
        className="text-lg font-semibold leading-tight text-ink transition hover:text-accent"
      >
        {game.name}
      </Link>
      {caption && <p className="mt-1 font-mono text-xs text-muted">{caption}</p>}
    </div>
  );
}

function GameListView({ games }: { games: { id: string; name: string }[] }) {
  if (games.length === 0) return <Empty />;

  return (
    <ul className="flex flex-col gap-1.5">
      {games.map((game) => (
        <li key={game.id}>
          <Link to={`/library/${game.id}`} className="text-sm text-ink transition hover:text-accent">
            {game.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Barras en CSS puro, sin librería de gráficos.
 * Para "9 juegos de RPG" una barra alcanza. Recharts entra recién en la página
 * de Estadísticas, donde los gráficos son el contenido y no el adorno.
 */
function DistributionView({ entries }: { entries: { label: string; value: number }[] }) {
  if (entries.length === 0) return <Empty />;

  const max = Math.max(...entries.map((entry) => entry.value));

  return (
    <ul className="flex flex-col gap-2">
      {entries.slice(0, 8).map((entry) => (
        <li key={entry.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs text-muted">{entry.label}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised">
            <div
              className="h-full rounded-full bg-accent/70"
              style={{ width: `${(entry.value / max) * 100}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right font-mono text-xs tabular-nums text-muted">
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
  );
}
