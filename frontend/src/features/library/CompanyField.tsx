import type { Company } from "@gp/shared";
import { useState } from "react";
import { useCreateCompany } from "../../hooks/useCatalog.js";
import { SelectField } from "../../ui/form.js";

interface CompanyFieldProps {
  value: Company | null;
  companies: readonly Company[];
  onCommit: (companyId: string | null) => void;
}

/**
 * Elegís de la lista, o escribís una nueva y se crea sola.
 * El nombre es UNIQUE en la base: "FromSoftware" nunca se duplica, que es
 * justamente el motivo por el que developer/publisher no son texto libre.
 */
export function CompanyField({ value, companies, onCommit }: CompanyFieldProps) {
  const [draft, setDraft] = useState("");
  const createCompany = useCreateCompany();

  const create = async (): Promise<void> => {
    const name = draft.trim();
    if (!name) return;

    const company = await createCompany.mutateAsync(name);
    onCommit(company.id);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-1.5">
      <SelectField
        value={value?.id ?? null}
        options={companies}
        onCommit={onCommit}
        emptyLabel="—"
      />

      <div className="flex gap-1.5">
        <input
          value={draft}
          placeholder="Agregar nueva…"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && void create()}
          className="min-w-0 flex-1 rounded-md border border-line bg-canvas px-3 py-1.5 text-xs text-ink focus:border-accent/60"
        />
        <button
          type="button"
          onClick={() => void create()}
          disabled={!draft.trim() || createCompany.isPending}
          className="rounded-md border border-line px-3 py-1.5 text-xs text-muted transition hover:text-ink disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
