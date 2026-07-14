import type { Recommendation } from "@gp/shared";
import { ApiError } from "../api/client.js";
import {
  useAiStatus,
  useGenerateRecommendations,
  useSavedRecommendations,
} from "../hooks/useRecommendations.js";
import { useAddToWishlist, useWishlist } from "../hooks/useWishlist.js";
import { Page } from "../ui/Page.js";

export function RecommendationsPage() {
  const status = useAiStatus();
  const saved = useSavedRecommendations();
  const generate = useGenerateRecommendations();
  const wishlist = useWishlist();

  const isEnabled = status.data?.enabled ?? false;
  const batch = saved.data;
  const items = batch?.items ?? [];

  // Contra la lista real, no contra el estado de la mutación: así un juego que
  // agregaste ayer sigue mostrándose como agregado hoy.
  const inWishlist = new Set((wishlist.data ?? []).map((item) => item.name));

  return (
    <Page
      eyebrow="Basadas en tu biblioteca"
      title="Recomendaciones"
      actions={
        isEnabled && (
          <button
            type="button"
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
            className="rounded-lg border border-accent/50 bg-accent/15 px-4 py-2 text-sm font-medium text-ink transition hover:bg-accent/25 disabled:opacity-40"
          >
            {generate.isPending
              ? "Pensando…"
              : items.length > 0
                ? "Generar otras"
                : "Generar recomendaciones"}
          </button>
        )
      }
    >
      {!status.isPending && !isEnabled && <SetupInstructions />}

      {generate.error && (
        <p className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
          {generate.error.message}
        </p>
      )}

      {generate.isPending && (
        <p className="mb-4 text-sm text-muted">
          Leyendo tu colección y buscando algo que te pegue…
        </p>
      )}

      {batch?.generatedAt && !generate.isPending && (
        <p className="mb-4 font-mono text-xs text-muted/70">
          Generadas el {new Date(batch.generatedAt).toLocaleString("es-AR")}
        </p>
      )}

      {items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((recommendation) => (
            <RecommendationCard
              key={recommendation.title}
              recommendation={recommendation}
              isSaved={inWishlist.has(recommendation.title)}
            />
          ))}
        </div>
      )}

      {isEnabled && items.length === 0 && !generate.isPending && !saved.isPending && (
        <p className="rounded-lg border border-dashed border-line px-6 py-16 text-center text-sm text-muted">
          Se generan a partir de tus juegos mejor puntuados, tus géneros y tus favoritos.
        </p>
      )}

      {isEnabled && (
        <p className="mt-6 text-xs text-muted/70">
          Esta es la única función que sale a internet: manda los títulos y puntajes de tu
          biblioteca a Google. El resto de la app funciona entera sin ella.
        </p>
      )}
    </Page>
  );
}

function RecommendationCard({
  recommendation,
  isSaved,
}: {
  recommendation: Recommendation;
  isSaved: boolean;
}) {
  const add = useAddToWishlist();

  // Un 409 significa "ya está en la lista": para el usuario, éxito igual.
  const alreadyThere = add.error instanceof ApiError && add.error.status === 409;
  const inList = isSaved || add.isSuccess || alreadyThere;

  const handleAdd = (): void => {
    add.mutate({
      name: recommendation.title,
      year: recommendation.year ?? null,
      genre: recommendation.genre ?? null,
      note: recommendation.reason,
      source: "ai",
    });
  };

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-line bg-surface/40 p-5">
      <div>
        <h2 className="font-semibold leading-tight text-ink">{recommendation.title}</h2>
        <p className="mt-0.5 font-mono text-xs text-muted">
          {[recommendation.year, recommendation.genre].filter(Boolean).join(" · ")}
        </p>
      </div>

      <p className="text-sm leading-relaxed text-ink/80">{recommendation.reason}</p>

      {recommendation.basedOn.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {recommendation.basedOn.map((title) => (
            <span
              key={title}
              className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted"
            >
              {title}
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={add.isPending || Boolean(inList)}
        className="mt-auto rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink transition hover:border-accent/60 hover:bg-accent/10 disabled:cursor-default disabled:opacity-60"
      >
        {inList ? "✓ En tu lista" : add.isPending ? "Agregando…" : "+ Agregar a Por jugar"}
      </button>
    </article>
  );
}

function SetupInstructions() {
  return (
    <div className="rounded-lg border border-dashed border-line px-6 py-10">
      <p className="mb-4 text-sm text-ink">Las recomendaciones necesitan una clave de Gemini.</p>

      <ol className="flex list-inside list-decimal flex-col gap-2 text-sm text-muted">
        <li>
          Conseguí una clave gratis en{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline underline-offset-4"
          >
            aistudio.google.com/apikey
          </a>
        </li>
        <li>
          Copiá <code className="font-mono text-muted">backend/.env.example</code> como{" "}
          <code className="font-mono text-muted">backend/.env</code>
        </li>
        <li>
          Pegá la clave en <code className="font-mono text-muted">GEMINI_API_KEY=</code>
        </li>
        <li>Reiniciá el servidor</li>
      </ol>

      <p className="mt-5 text-xs text-muted/70">
        La clave vive solo en el backend. Nunca llega al navegador.
      </p>
    </div>
  );
}
