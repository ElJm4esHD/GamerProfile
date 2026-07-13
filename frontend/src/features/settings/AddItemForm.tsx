import { useState } from "react";

interface AddItemFormProps {
  placeholder: string;
  isPending: boolean;
  onSubmit: (name: string) => void;
}

/** Un input + un botón. Lo usan géneros, plataformas y criterios. */
export function AddItemForm({ placeholder, isPending, onSubmit }: AddItemFormProps) {
  const [draft, setDraft] = useState("");

  const submit = (): void => {
    const name = draft.trim();
    if (!name) return;

    onSubmit(name);
    setDraft("");
  };

  return (
    <div className="flex max-w-sm gap-2">
      <input
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && submit()}
        className="min-w-0 flex-1 rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink focus:border-accent/60"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!draft.trim() || isPending}
        className="rounded-md border border-line px-4 py-2 text-sm text-muted transition hover:text-ink disabled:opacity-40"
      >
        Agregar
      </button>
    </div>
  );
}
