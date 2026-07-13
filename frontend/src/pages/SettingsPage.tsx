import { useState } from "react";
import {
  useBackup,
  useCreateGenre,
  useCreatePlatform,
  useGenres,
  usePlatforms,
} from "../hooks/useCatalog.js";
import { AddItemForm } from "../features/settings/AddItemForm.js";
import { CriteriaPanel } from "../features/settings/CriteriaPanel.js";
import { Page } from "../ui/Page.js";

export function SettingsPage() {
  return (
    <Page eyebrow="Configuración" title="Ajustes">
      <div className="flex flex-col gap-6">
        <CriteriaPanel />
        <CatalogsPanel />
        <BackupPanel />
      </div>
    </Page>
  );
}

function CatalogsPanel() {
  const platforms = usePlatforms();
  const genres = useGenres();
  const createPlatform = useCreatePlatform();
  const createGenre = useCreateGenre();

  return (
    <section className="grid gap-6 rounded-lg border border-line bg-surface/40 p-6 sm:grid-cols-2">
      <div>
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Plataformas
        </h2>
        <NameList names={(platforms.data ?? []).map((platform) => platform.name)} />
        <AddItemForm
          placeholder="Nueva plataforma"
          isPending={createPlatform.isPending}
          onSubmit={(name) => createPlatform.mutate(name)}
        />
      </div>

      <div>
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">Géneros</h2>
        <NameList names={(genres.data ?? []).map((genre) => genre.name)} />
        <AddItemForm
          placeholder="Nuevo género"
          isPending={createGenre.isPending}
          onSubmit={(name) => createGenre.mutate(name)}
        />
      </div>
    </section>
  );
}

function NameList({ names }: { names: string[] }) {
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {names.map((name) => (
        <span key={name} className="rounded-full border border-line px-3 py-1 text-xs text-muted">
          {name}
        </span>
      ))}
    </div>
  );
}

function BackupPanel() {
  const backup = useBackup();
  const [lastPath, setLastPath] = useState<string | null>(null);

  return (
    <section className="rounded-lg border border-line bg-surface/40 p-6">
      <h2 className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-muted">Backup</h2>
      <p className="mb-5 max-w-xl text-xs text-muted/70">
        Ya se hace uno automático cada vez que arranca la app, y se guardan los últimos 20 en{" "}
        <code className="font-mono text-muted">database/backups/</code>. Este botón es para cuando
        querés uno a mano, antes de tocar algo delicado.
      </p>

      <button
        type="button"
        onClick={() => backup.mutate(undefined, { onSuccess: (result) => setLastPath(result.path) })}
        disabled={backup.isPending}
        className="rounded-md border border-line px-4 py-2 text-sm text-muted transition hover:border-accent/50 hover:text-ink disabled:opacity-40"
      >
        {backup.isPending ? "Copiando…" : "Crear backup ahora"}
      </button>

      {lastPath && (
        <p className="mt-3 break-all font-mono text-xs text-emerald-300/80">✔ {lastPath}</p>
      )}
    </section>
  );
}
