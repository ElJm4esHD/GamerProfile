import type { UpdateGameInput } from "@gp/shared";
import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { gameFormFromDetail, type GameFormPatch } from "../features/games/game-form.js";
import { GameForm } from "../features/games/GameForm.js";
import { useGameDetail, useUpdateGameDetail } from "../hooks/useGameDetail.js";
import { useDeleteGame } from "../hooks/useGames.js";
import { ErrorBanner, Page } from "../ui/Page.js";

export function GameDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const game = useGameDetail(id);
  const update = useUpdateGameDetail(id);
  const remove = useDeleteGame();

  const detail = game.data;
  const value = useMemo(() => (detail ? gameFormFromDetail(detail) : null), [detail]);

  if (game.isPending) {
    return (
      <Page title="Cargando…">
        <p className="text-sm text-muted">Un segundo.</p>
      </Page>
    );
  }

  if (game.isError || !detail || !value) {
    return (
      <Page title="No encontrado">
        <p className="text-sm text-muted">
          Ese juego no existe.{" "}
          <Link to="/library" className="text-accent underline underline-offset-4">
            Volver a la biblioteca
          </Link>
        </p>
      </Page>
    );
  }

  /** Autosave: cada campo que se cierra viaja como PATCH, tal cual. */
  const handleChange = (patch: GameFormPatch): void => {
    // Un nombre vacío no se guarda: la fila quedaría sin título en la tabla.
    if (patch.name !== undefined && patch.name.trim() === "") return;
    update.mutate(patch satisfies UpdateGameInput);
  };

  const handleDelete = (): void => {
    if (!confirm(`¿Borrar "${detail.name}"?`)) return;
    remove.mutate(detail.id, { onSuccess: () => navigate("/library") });
  };

  return (
    <Page
      eyebrow={detail.rank ? `Puesto #${detail.rank} del ranking` : "Sin puntuar"}
      title={detail.name}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => update.mutate({ isFavorite: !detail.isFavorite })}
            className={`rounded-lg border border-line px-3 py-2 text-sm transition hover:text-ink ${
              detail.isFavorite ? "text-amber-300" : "text-muted"
            }`}
          >
            ★
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg border border-line px-4 py-2 text-sm text-muted transition hover:border-rose-500/40 hover:text-rose-200"
          >
            Borrar
          </button>
        </div>
      }
    >
      <ErrorBanner error={update.error ?? remove.error} />

      <GameForm value={value} onChange={handleChange} computedOverall={detail.overall} />

      <p className="mt-6 text-xs text-muted">Todo se guarda solo al salir de cada campo.</p>
    </Page>
  );
}
