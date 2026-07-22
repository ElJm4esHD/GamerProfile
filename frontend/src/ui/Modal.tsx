import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Un diálogo y nada más: portal al body, Escape cierra, clic afuera cierra.
 *
 * No sabe qué hay adentro ni qué botones lleva — eso lo pone quien lo abre.
 * Va en `ui/` porque cualquier módulo lo va a querer (alta de vueltas, de
 * catálogos, lo que venga).
 */
export function Modal({ title, eyebrow, onClose, footer, children }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };

    // Sin esto, la página de atrás scrollea cuando el diálogo llega al final.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
      // mousedown y no click: si arrancás una selección adentro y soltás
      // afuera, el diálogo no se cierra en la cara.
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="my-auto flex max-h-[92vh] w-full max-w-4xl flex-col rounded-xl border border-line bg-canvas shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            {eyebrow && (
              <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                {eyebrow}
              </p>
            )}
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:text-ink"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
