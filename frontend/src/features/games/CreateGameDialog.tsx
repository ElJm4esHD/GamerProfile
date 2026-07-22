import { useRef, useState } from "react";
import { useCreateGame } from "../../hooks/useGames.js";
import { Modal } from "../../ui/Modal.js";
import { ErrorBanner } from "../../ui/Page.js";
import { emptyGameForm, toCreateInput, type GameFormPatch } from "./game-form.js";
import { GameForm } from "./GameForm.js";

interface CreateGameDialogProps {
  /** El tipo con el que arranca el borrador. Lo elige quien abre el diálogo. */
  defaultTypeId: string;
  onClose: () => void;
}

/**
 * El alta completa, en un solo POST.
 *
 * A diferencia de la ficha, acá NO hay autosave: el juego no existe hasta que
 * apretás "Crear". Cancelar no deja nada a medias en la base.
 */
export function CreateGameDialog({ defaultTypeId, onClose }: CreateGameDialogProps) {
  const createGame = useCreateGame();
  const [value, setValue] = useState(() => emptyGameForm(defaultTypeId));
  const [invalid, setInvalid] = useState(false);

  /*
   * El borrador vive en un ref además del estado.
   *
   * Los campos guardan al salir (blur), y el blur del último campo dispara en
   * el mismo gesto que el clic en "Crear". Leer el ref garantiza que lo recién
   * tipeado entre en el POST, sin depender de que React ya haya re-renderizado.
   */
  const draft = useRef(value);

  const patch = (input: GameFormPatch): void => {
    const next = { ...draft.current, ...input };
    draft.current = next;
    setValue(next);
    if (next.name.trim()) setInvalid(false);
  };

  const submit = (): void => {
    const input = toCreateInput(draft.current);

    if (!input.name) {
      setInvalid(true);
      return;
    }

    createGame.mutate(input, { onSuccess: onClose });
  };

  return (
    <Modal
      eyebrow="Nuevo juego"
      title="Agregar a la biblioteca"
      onClose={onClose}
      footer={
        <>
          {invalid && <p className="mr-auto text-sm text-rose-200">Falta el nombre.</p>}

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line px-4 py-2 text-sm text-muted transition hover:text-ink"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={createGame.isPending}
            className="rounded-lg border border-accent/60 bg-accent/15 px-4 py-2 text-sm font-medium text-ink transition hover:bg-accent/25 disabled:opacity-40"
          >
            {createGame.isPending ? "Guardando…" : "Crear juego"}
          </button>
        </>
      }
    >
      <ErrorBanner error={createGame.error} />

      <GameForm value={value} onChange={patch} autoFocusName />

      <p className="mt-6 text-xs text-muted">
        Solo el nombre es obligatorio. Todo lo demás se puede completar después desde la ficha.
      </p>
    </Modal>
  );
}
