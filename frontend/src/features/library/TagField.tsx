import type { Tag } from "@gp/shared";
import { useState } from "react";
import { useCreateTag, useTags } from "../../hooks/useCatalog.js";
import { ChipSelect } from "../../ui/ChipSelect.js";

interface TagFieldProps {
  selected: readonly Tag[];
  onCommit: (tagIds: string[]) => void;
}

/** Los tags los inventás vos: se crean escribiendo. */
export function TagField({ selected, onCommit }: TagFieldProps) {
  const tags = useTags();
  const createTag = useCreateTag();
  const [draft, setDraft] = useState("");

  const selectedIds = selected.map((tag) => tag.id);

  const create = async (): Promise<void> => {
    const name = draft.trim();
    if (!name) return;

    const tag = await createTag.mutateAsync(name);
    // findOrCreate: si el tag ya existía, no se duplica ni se agrega dos veces.
    onCommit([...new Set([...selectedIds, tag.id])]);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-3">
      <ChipSelect options={tags.data ?? []} selectedIds={selectedIds} onToggle={onCommit} />

      <div className="flex max-w-xs gap-1.5">
        <input
          value={draft}
          placeholder="Nuevo tag…"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && void create()}
          className="min-w-0 flex-1 rounded-md border border-line bg-canvas px-3 py-1.5 text-xs text-ink focus:border-accent/60"
        />
        <button
          type="button"
          onClick={() => void create()}
          disabled={!draft.trim() || createTag.isPending}
          className="rounded-md border border-line px-3 py-1.5 text-xs text-muted transition hover:text-ink disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
