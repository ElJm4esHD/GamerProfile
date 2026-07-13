import {
  GAME_STATUSES,
  GAME_STATUS_LABELS,
  type GameDetail,
  type GameStatus,
  type UpdateGameInput,
} from "@gp/shared";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CompanyField } from "../features/library/CompanyField.js";
import { TagField } from "../features/library/TagField.js";
import { EditableScore } from "../features/games/EditableScore.js";
import { overallTone } from "../features/games/score-tone.js";
import {
  useCompanies,
  useCriteria,
  useGameTypes,
  useGenres,
  usePlatforms,
} from "../hooks/useCatalog.js";
import { useGameDetail, useUpdateGameDetail } from "../hooks/useGameDetail.js";
import { useDeleteGame } from "../hooks/useGames.js";
import { ChipSelect } from "../ui/ChipSelect.js";
import { DateField, Field, HoursField, NumberField, Section, SelectField, TextField } from "../ui/form.js";
import { ErrorBanner, Page } from "../ui/Page.js";

export function GameDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const game = useGameDetail(id);
  const update = useUpdateGameDetail(id);
  const remove = useDeleteGame();

  if (game.isPending) {
    return (
      <Page title="Cargando…">
        <p className="text-sm text-muted">Un segundo.</p>
      </Page>
    );
  }

  if (game.isError || !game.data) {
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

  const detail = game.data;

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

      <div className="flex flex-col gap-6">
        <GeneralSection detail={detail} onChange={update.mutate} />
        <StatsSection detail={detail} onChange={update.mutate} />
        <ScoresSection detail={detail} onChange={update.mutate} />
      </div>

      <p className="mt-6 text-xs text-muted">Todo se guarda solo al salir de cada campo.</p>
    </Page>
  );
}

interface SectionProps {
  detail: GameDetail;
  onChange: (input: UpdateGameInput) => void;
}

function GeneralSection({ detail, onChange }: SectionProps) {
  const gameTypes = useGameTypes();
  const platforms = usePlatforms();
  const genres = useGenres();
  const companies = useCompanies();

  const statusOptions = GAME_STATUSES.map((status) => ({
    id: status,
    name: GAME_STATUS_LABELS[status],
  }));

  return (
    <Section title="Información general">
      <Field label="Nombre">
        <TextField
          value={detail.name}
          onCommit={(name) => name && onChange({ name })}
        />
      </Field>

      <Field label="Tipo">
        <SelectField
          value={detail.type.id}
          options={gameTypes.data ?? []}
          onCommit={(typeId) => typeId && onChange({ typeId })}
        />
      </Field>

      <Field label="Estado">
        <SelectField
          value={detail.status}
          options={statusOptions}
          onCommit={(status) => status && onChange({ status: status as GameStatus })}
        />
      </Field>

      <Field label="Desarrollador">
        <CompanyField
          value={detail.developer}
          companies={companies.data ?? []}
          onCommit={(developerId) => onChange({ developerId })}
        />
      </Field>

      <Field label="Publisher">
        <CompanyField
          value={detail.publisher}
          companies={companies.data ?? []}
          onCommit={(publisherId) => onChange({ publisherId })}
        />
      </Field>

      <Field label="Año de lanzamiento">
        <NumberField
          value={detail.releaseYear}
          min={1950}
          max={2100}
          placeholder="2024"
          onCommit={(releaseYear) => onChange({ releaseYear })}
        />
      </Field>

      <Field label="Fecha de compra">
        <DateField value={detail.purchasedAt} onCommit={(purchasedAt) => onChange({ purchasedAt })} />
      </Field>

      <Field label="Fecha de inicio">
        <DateField value={detail.startedAt} onCommit={(startedAt) => onChange({ startedAt })} />
      </Field>

      <Field label="Fecha de finalización">
        <DateField value={detail.finishedAt} onCommit={(finishedAt) => onChange({ finishedAt })} />
      </Field>

      <Field label="Plataformas" span>
        <ChipSelect
          options={platforms.data ?? []}
          selectedIds={detail.platforms.map((platform) => platform.id)}
          onToggle={(platformIds) => onChange({ platformIds })}
        />
      </Field>

      <Field label="Géneros" span>
        <ChipSelect
          options={genres.data ?? []}
          selectedIds={detail.genres.map((genre) => genre.id)}
          onToggle={(genreIds) => onChange({ genreIds })}
        />
      </Field>

      <Field label="Tags" span>
        <TagField selected={detail.tags} onCommit={(tagIds) => onChange({ tagIds })} />
      </Field>
    </Section>
  );
}

function StatsSection({ detail, onChange }: SectionProps) {
  return (
    <Section title="Estadísticas">
      <Field label="Horas jugadas" hint="Se guarda en minutos: 2,5 → 2h 30m">
        <HoursField
          minutes={detail.playtimeMinutes}
          onCommit={(playtimeMinutes) => onChange({ playtimeMinutes })}
        />
      </Field>

      <Field label="Horas para la historia">
        <HoursField
          minutes={detail.mainStoryMinutes}
          onCommit={(mainStoryMinutes) => onChange({ mainStoryMinutes })}
        />
      </Field>

      <Field label="Horas al 100%">
        <HoursField
          minutes={detail.completionistMinutes}
          onCommit={(completionistMinutes) => onChange({ completionistMinutes })}
        />
      </Field>

      <Field label="Cantidad de partidas">
        <NumberField
          value={detail.playthroughs}
          placeholder="1"
          onCommit={(playthroughs) => onChange({ playthroughs })}
        />
      </Field>

      <Field label="Dificultad elegida">
        <TextField
          value={detail.difficulty}
          placeholder="Normal"
          onCommit={(difficulty) => onChange({ difficulty })}
        />
      </Field>
    </Section>
  );
}

function ScoresSection({ detail, onChange }: SectionProps) {
  const criteria = useCriteria();

  return (
    <Section title="Puntuaciones">
      {(criteria.data ?? [])
        .filter((criterion) => criterion.isActive)
        .map((criterion) => (
          <Field key={criterion.id} label={criterion.name}>
            <div className="rounded-md border border-line bg-canvas">
              <EditableScore
                value={detail.ratings[criterion.id] ?? null}
                allowEmpty
                className="py-2 text-ink"
                onCommit={(value) =>
                  value !== null && onChange({ ratings: { [criterion.id]: value } })
                }
              />
            </div>
          </Field>
        ))}

      <Field label="Overall" hint="Vacío = promedio automático de los criterios">
        <div className={`rounded-md border border-line ${overallTone(detail.overall)}`}>
          <EditableScore
            value={detail.overall}
            allowEmpty
            className="py-2 font-bold"
            onCommit={(overallOverride) => onChange({ overallOverride })}
          />
        </div>
      </Field>
    </Section>
  );
}
