import { useState } from "react";
import { CreateGameDialog } from "../games/CreateGameDialog.js";
import { useGameTypes } from "../../hooks/useCatalog.js";

/**
 * Abre el alta en un diálogo: el juego se carga entero de una y recién ahí
 * entra a la base. Antes se creaba una fila "Juego nuevo" al instante y se
 * editaba en la tabla, lo que dejaba basura si te arrepentías a mitad de camino.
 */
export function AddGameButton() {
  const gameTypes = useGameTypes();
  const [isOpen, setIsOpen] = useState(false);

  const defaultType = gameTypes.data?.[0];

  return (
    <>
      <button
        type="button"
        disabled={!defaultType}
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted transition hover:border-accent/50 hover:text-ink disabled:opacity-40"
      >
        + Agregar juego
      </button>

      {isOpen && defaultType && (
        <CreateGameDialog defaultTypeId={defaultType.id} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
