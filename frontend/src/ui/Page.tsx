import type { ReactNode } from "react";

interface PageProps {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** El encabezado es idéntico en todas las páginas. Se escribe una sola vez. */
export function Page({ title, eyebrow, actions, children }: PageProps) {
  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10">
      <header className="mb-8 flex items-end justify-between border-b border-line pb-5">
        <div>
          {eyebrow && (
            <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-muted">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        {actions}
      </header>

      {children}
    </div>
  );
}

/** Un error de guardado nunca puede pasar desapercibido. */
export function ErrorBanner({ error }: { error: Error | null }) {
  if (!error) return null;

  return (
    <p className="mb-4 rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
      No se guardó el cambio: {error.message}
    </p>
  );
}
