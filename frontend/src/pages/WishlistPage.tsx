import type { WishlistItem } from "@gp/shared";
import { useState } from "react";
import { ApiError } from "../api/client.js";
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from "../hooks/useWishlist.js";
import { Page } from "../ui/Page.js";

const INPUT_CLASS =
  "rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink transition hover:border-line focus:border-accent/60";

export function WishlistPage() {
  const wishlist = useWishlist();
  const items = wishlist.data ?? [];

  return (
    <Page eyebrow="Juegos que te quedan por jugar" title="Por jugar">
      <AddForm />

      {wishlist.isPending && <p className="mt-6 text-sm text-muted">Cargando tu lista…</p>}

      {!wishlist.isPending && items.length === 0 && (
        <p className="mt-6 rounded-lg border border-dashed border-line px-6 py-16 text-center text-sm text-muted">
          Tu lista está vacía. Agregá un juego arriba, o mandá uno desde las Recomendaciones.
        </p>
      )}

      {items.length > 0 && (
        <ul className="mt-6 flex flex-col gap-2">
          {items.map((item) => (
            <WishlistRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </Page>
  );
}

function AddForm() {
  const add = useAddToWishlist();
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed === "") return;

    const parsedYear = year.trim() === "" ? null : Number(year);

    add.mutate(
      {
        name: trimmed,
        year: Number.isInteger(parsedYear) ? parsedYear : null,
        genre: genre.trim() || null,
        source: "manual",
      },
      {
        onSuccess: () => {
          setName("");
          setYear("");
          setGenre("");
        },
      },
    );
  };

  // Un 409 significa que el nombre ya está en la lista.
  const isDuplicate = add.error instanceof ApiError && add.error.status === 409;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-line bg-surface/40 p-5"
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[200px] flex-1 flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">Juego</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre del juego"
            className={INPUT_CLASS}
          />
        </label>

        <label className="flex w-24 flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">Año</span>
          <input
            inputMode="numeric"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            placeholder="2024"
            className={`${INPUT_CLASS} font-mono tabular-nums`}
          />
        </label>

        <label className="flex w-40 flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">Género</span>
          <input
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
            placeholder="RPG, Shooter…"
            className={INPUT_CLASS}
          />
        </label>

        <button
          type="submit"
          disabled={add.isPending || name.trim() === ""}
          className="rounded-lg border border-accent/50 bg-accent/15 px-4 py-2 text-sm font-medium text-ink transition hover:bg-accent/25 disabled:opacity-40"
        >
          {add.isPending ? "Agregando…" : "Agregar"}
        </button>
      </div>

      {isDuplicate && (
        <p className="text-xs text-amber-300">Ese juego ya está en tu lista.</p>
      )}
      {add.error && !isDuplicate && (
        <p className="text-xs text-rose-300">{add.error.message}</p>
      )}
    </form>
  );
}

function WishlistRow({ item }: { item: WishlistItem }) {
  const remove = useRemoveFromWishlist();

  const meta = [item.year, item.genre].filter(Boolean).join(" · ");

  return (
    <li className="flex items-start justify-between gap-4 rounded-lg border border-line bg-surface/40 px-5 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink">{item.name}</span>
          {item.source === "ai" && (
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-accent">
              IA
            </span>
          )}
        </div>
        {meta && <p className="mt-0.5 font-mono text-xs text-muted">{meta}</p>}
        {item.note && <p className="mt-1 text-sm text-ink/70">{item.note}</p>}
      </div>

      <button
        type="button"
        onClick={() => remove.mutate(item.id)}
        disabled={remove.isPending}
        className="shrink-0 rounded-md border border-line px-3 py-1.5 text-xs text-muted transition hover:border-rose-500/50 hover:text-rose-200 disabled:opacity-40"
      >
        Quitar
      </button>
    </li>
  );
}
