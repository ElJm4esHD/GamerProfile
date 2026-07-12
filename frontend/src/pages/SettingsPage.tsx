import { Page } from "../ui/Page.js";

export function SettingsPage() {
  return (
    <Page eyebrow="Configuración" title="Ajustes">
      <div className="rounded-lg border border-dashed border-line px-6 py-16 text-center text-sm text-muted">
        Criterios y pesos, catálogos, backups e import/export.
      </div>
    </Page>
  );
}
