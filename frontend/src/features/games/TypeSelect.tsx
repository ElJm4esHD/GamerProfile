import type { GameType } from "@gp/shared";

interface TypeSelectProps {
  value: string;
  types: readonly GameType[];
  onCommit: (typeId: string) => void;
}

export function TypeSelect({ value, types, onCommit }: TypeSelectProps) {
  return (
    <select
      value={value}
      onChange={(event) => onCommit(event.target.value)}
      className="w-full cursor-pointer rounded px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted hover:bg-raised"
    >
      {types.map((type) => (
        <option key={type.id} value={type.id} className="bg-surface text-ink">
          {type.name}
        </option>
      ))}
    </select>
  );
}
