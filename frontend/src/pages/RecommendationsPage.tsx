import type { Recommendation } from "@gp/shared";
import { useAiStatus, useRecommendations } from "../hooks/useRecommendations.js";
import { Page } from "../ui/Page.js";

export function RecommendationsPage() {
  const status = useAiStatus();
  const recommendations = useRecommendations();

  const isEnabled = status.data?.enabled ?? false;

  return (
    <Page
      eyebrow="Basadas en tu biblioteca"
      title="Recomendaciones"
      actions={
        isEnabled && (
          <button
            type="button"
            onClick={() => recommendations.mutate()}
            disabled={recommendations.isPending}
            className="rounded-lg border border-accent/50 bg-accent/15 px-4 py-2 text-sm font-medium text-ink transition hover:bg-accent/25 disabled:opacity-40"
          >
            {recommendations.isPending ? "Pensando…" : "Generar recomendaciones"}
          </button>
        )
      }
    >
      {!status.isPending && !isEnabled && <SetupInstructions />}

      {recommendations.error && (
        <p className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
          {recommendations.error.message}
        </p>
      )}

      {recommendations.isPending && (
        <p className="text-sm text-muted">Leyendo tu colección y buscando algo que te pegue…</p>
      )}

      {recommendations.data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.data.map((recommendation) => (
            <RecommendationCard key={recommendation.title} recommendation={recommendation} />
          ))}
        </div>
      )}

      {isEnabled && !recommendations.data && !recommendations.isPending && (
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

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
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
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
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
