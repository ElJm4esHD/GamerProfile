import { GAME_STATUSES, GAME_STATUS_LABELS, type GameStatus } from "@gp/shared";
import {
  useCompanies,
  useCriteria,
  useGameTypes,
  useGenres,
  usePlatforms,
} from "../../hooks/useCatalog.js";
import { ChipSelect } from "../../ui/ChipSelect.js";
import {
  DateField,
  Field,
  HoursField,
  NumberField,
  Section,
  SelectField,
  TextField,
} from "../../ui/form.js";
import { CompanyField } from "./CompanyField.js";
import { EditableScore } from "./EditableScore.js";
import type { GameFormPatch, GameFormValue } from "./game-form.js";
import { overallTone } from "./score-tone.js";
import { TagField } from "./TagField.js";

interface GameFormProps {
  value: GameFormValue;
  onChange: (patch: GameFormPatch) => void;
  /**
   * El overall calculado por el backend (promedio ponderado de los criterios).
   * En el alta todavía no existe, y entonces se muestra el override a secas.
   */
  computedOverall?: number | null;
  /** El alta necesita el foco en el nombre; la ficha no. */
  autoFocusName?: boolean;
}

/**
 * El formulario de un juego. Uno solo, para los dos lugares donde se edita:
 * la ficha (autosave campo por campo) y el diálogo de alta (POST único).
 *
 * No conoce ninguno de los dos: recibe el valor y avisa los cambios. Quien lo
 * usa decide si el patch viaja al server o se guarda en un borrador local.
 */
export function GameForm(props: GameFormProps) {
  return (
    <div className="flex flex-col gap-6">
      <GeneralSection {...props} />
      <StatsSection {...props} />
      <ScoresSection {...props} />
    </div>
  );
}

const STATUS_OPTIONS = GAME_STATUSES.map((status) => ({
  id: status,
  name: GAME_STATUS_LABELS[status],
}));

function GeneralSection({ value, onChange, autoFocusName }: GameFormProps) {
  const gameTypes = useGameTypes();
  const platforms = usePlatforms();
  const genres = useGenres();
  const companies = useCompanies();

  return (
    <Section title="Información general">
      <Field label="Nombre">
        <TextField
          value={value.name}
          placeholder="Nombre del juego"
          autoFocus={autoFocusName}
          onCommit={(name) => onChange({ name: name ?? "" })}
        />
      </Field>

      <Field label="Tipo">
        <SelectField
          value={value.typeId}
          options={gameTypes.data ?? []}
          onCommit={(typeId) => typeId && onChange({ typeId })}
        />
      </Field>

      <Field label="Estado">
        <SelectField
          value={value.status}
          options={STATUS_OPTIONS}
          onCommit={(status) => status && onChange({ status: status as GameStatus })}
        />
      </Field>

      <Field label="Desarrollador">
        <CompanyField
          value={value.developerId}
          companies={companies.data ?? []}
          onCommit={(developerId) => onChange({ developerId })}
        />
      </Field>

      <Field label="Publisher">
        <CompanyField
          value={value.publisherId}
          companies={companies.data ?? []}
          onCommit={(publisherId) => onChange({ publisherId })}
        />
      </Field>

      <Field label="Año de lanzamiento">
        <NumberField
          value={value.releaseYear}
          min={1950}
          max={2100}
          placeholder="2024"
          onCommit={(releaseYear) => onChange({ releaseYear })}
        />
      </Field>

      <Field label="Fecha de compra">
        <DateField value={value.purchasedAt} onCommit={(purchasedAt) => onChange({ purchasedAt })} />
      </Field>

      <Field label="Fecha de inicio">
        <DateField value={value.startedAt} onCommit={(startedAt) => onChange({ startedAt })} />
      </Field>

      <Field label="Fecha de finalización">
        <DateField value={value.finishedAt} onCommit={(finishedAt) => onChange({ finishedAt })} />
      </Field>

      <Field label="Plataformas" span>
        <ChipSelect
          options={platforms.data ?? []}
          selectedIds={value.platformIds}
          onToggle={(platformIds) => onChange({ platformIds })}
        />
      </Field>

      <Field label="Géneros" span>
        <ChipSelect
          options={genres.data ?? []}
          selectedIds={value.genreIds}
          onToggle={(genreIds) => onChange({ genreIds })}
        />
      </Field>

      <Field label="Tags" span>
        <TagField selectedIds={value.tagIds} onCommit={(tagIds) => onChange({ tagIds })} />
      </Field>
    </Section>
  );
}

function StatsSection({ value, onChange }: GameFormProps) {
  return (
    <Section title="Estadísticas">
      <Field label="Horas jugadas" hint="Se guarda en minutos: 2,5 → 2h 30m">
        <HoursField
          minutes={value.playtimeMinutes}
          onCommit={(playtimeMinutes) => onChange({ playtimeMinutes })}
        />
      </Field>

      <Field label="Horas para la historia">
        <HoursField
          minutes={value.mainStoryMinutes}
          onCommit={(mainStoryMinutes) => onChange({ mainStoryMinutes })}
        />
      </Field>

      <Field label="Horas al 100%">
        <HoursField
          minutes={value.completionistMinutes}
          onCommit={(completionistMinutes) => onChange({ completionistMinutes })}
        />
      </Field>

      <Field label="Cantidad de partidas">
        <NumberField
          value={value.playthroughs}
          placeholder="1"
          onCommit={(playthroughs) => onChange({ playthroughs })}
        />
      </Field>

      <Field label="Dificultad elegida">
        <TextField
          value={value.difficulty}
          placeholder="Normal"
          onCommit={(difficulty) => onChange({ difficulty })}
        />
      </Field>
    </Section>
  );
}

function ScoresSection({ value, onChange, computedOverall }: GameFormProps) {
  const criteria = useCriteria();
  const overall = computedOverall === undefined ? value.overallOverride : computedOverall;

  return (
    <Section title="Puntuaciones">
      {(criteria.data ?? [])
        .filter((criterion) => criterion.isActive)
        .map((criterion) => (
          <Field key={criterion.id} label={criterion.name}>
            <div className="rounded-md border border-line bg-canvas">
              <EditableScore
                value={value.ratings[criterion.id] ?? null}
                allowEmpty
                className="py-2 text-ink"
                onCommit={(score) =>
                  score !== null &&
                  onChange({ ratings: { ...value.ratings, [criterion.id]: score } })
                }
              />
            </div>
          </Field>
        ))}

      <Field label="Overall" hint="Vacío = promedio automático de los criterios">
        <div className={`rounded-md border border-line ${overallTone(overall)}`}>
          <EditableScore
            value={overall}
            allowEmpty
            className="py-2 font-bold"
            onCommit={(overallOverride) => onChange({ overallOverride })}
          />
        </div>
      </Field>
    </Section>
  );
}
