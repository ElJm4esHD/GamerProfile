import { GAME_STATUS_LABELS, GAME_STATUSES, type GameStatus } from "@gp/shared";

interface StatusSelectProps {
  value: GameStatus;
  onCommit: (status: GameStatus) => void;
}

/** Un color por estado. Es la única señal cromática de la biblioteca. */
const STATUS_DOT: Record<GameStatus, string> = {
  backlog: "bg-slate-400/60",
  playing: "bg-sky-400",
  completed: "bg-emerald-400",
  abandoned: "bg-rose-400/70",
  replaying: "bg-violet-400",
};

export function StatusSelect({ value, onCommit }: StatusSelectProps) {
  return (
    <div className="flex items-center gap-2 px-2">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[value]}`} />
      <select
        value={value}
        onChange={(event) => onCommit(event.target.value as GameStatus)}
        className="w-full cursor-pointer rounded py-1 text-xs font-medium text-muted hover:bg-raised"
      >
        {GAME_STATUSES.map((status) => (
          <option key={status} value={status} className="bg-surface text-ink">
            {GAME_STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </div>
  );
}
