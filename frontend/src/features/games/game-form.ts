import {
  DEFAULT_GAME_STATUS,
  type CreateGameInput,
  type GameDetail,
  type GameStatus,
} from "@gp/shared";

/**
 * Los campos editables de un juego, siempre "en forma de input": ids, nunca
 * objetos. El detalle que devuelve la API trae `developer: Company` y
 * `platforms: Platform[]`; el formulario trabaja con `developerId` y
 * `platformIds` porque es lo que se manda al server.
 *
 * Tener UNA sola forma es lo que permite que la ficha y el alta compartan
 * exactamente el mismo formulario: la única diferencia es qué se hace con los
 * cambios (PATCH al instante vs. acumular y POST).
 */
export interface GameFormValue {
  name: string;
  typeId: string;
  status: GameStatus;
  developerId: string | null;
  publisherId: string | null;
  releaseYear: number | null;
  purchasedAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  platformIds: string[];
  genreIds: string[];
  tagIds: string[];
  playtimeMinutes: number | null;
  mainStoryMinutes: number | null;
  completionistMinutes: number | null;
  playthroughs: number | null;
  difficulty: string | null;
  /** criterionId -> valor */
  ratings: Record<string, number>;
  overallOverride: number | null;
}

/**
 * Lo que emite el formulario cuando tocás un campo.
 * Las claves son las mismas que las de `UpdateGameInput`, así que un patch se
 * puede mandar tal cual al PATCH, sin traducir nada.
 */
export type GameFormPatch = Partial<GameFormValue>;

export function emptyGameForm(typeId: string): GameFormValue {
  return {
    name: "",
    typeId,
    status: DEFAULT_GAME_STATUS,
    developerId: null,
    publisherId: null,
    releaseYear: null,
    purchasedAt: null,
    startedAt: null,
    finishedAt: null,
    platformIds: [],
    genreIds: [],
    tagIds: [],
    playtimeMinutes: null,
    mainStoryMinutes: null,
    completionistMinutes: null,
    playthroughs: null,
    difficulty: null,
    ratings: {},
    overallOverride: null,
  };
}

export function gameFormFromDetail(detail: GameDetail): GameFormValue {
  return {
    name: detail.name,
    typeId: detail.type.id,
    status: detail.status,
    developerId: detail.developer?.id ?? null,
    publisherId: detail.publisher?.id ?? null,
    releaseYear: detail.releaseYear,
    purchasedAt: detail.purchasedAt,
    startedAt: detail.startedAt,
    finishedAt: detail.finishedAt,
    platformIds: detail.platforms.map((platform) => platform.id),
    genreIds: detail.genres.map((genre) => genre.id),
    tagIds: detail.tags.map((tag) => tag.id),
    playtimeMinutes: detail.playtimeMinutes,
    mainStoryMinutes: detail.mainStoryMinutes,
    completionistMinutes: detail.completionistMinutes,
    playthroughs: detail.playthroughs,
    difficulty: detail.difficulty,
    ratings: detail.ratings,
    overallOverride: detail.overallOverride,
  };
}

/** El alta manda todo junto, en un solo POST. */
export function toCreateInput(value: GameFormValue): CreateGameInput {
  return { ...value, name: value.name.trim() };
}
