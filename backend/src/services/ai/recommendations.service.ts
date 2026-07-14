import { recommendationsSchema, type Recommendation } from "@gp/shared";
import { UnavailableError } from "../../errors.js";
import * as statsRepository from "../../repositories/stats.repository.js";
import { listGames } from "../games.service.js";
import { generateJson } from "./gemini.client.js";

const TOP_GAMES = 15;
const HOW_MANY = 6;

/**
 * Recomendaciones basadas en tu biblioteca.
 *
 * El perfil se arma acá y se manda como texto. Es la única parte del proyecto
 * que sale a internet: tus títulos y puntajes viajan a Google. El resto de la
 * app sigue funcionando igual si esto está apagado.
 */
export async function recommendGames(): Promise<Recommendation[]> {
  const games = listGames();

  if (games.length < 3) {
    throw new UnavailableError(
      "Cargá al menos tres juegos puntuados: con menos, cualquier recomendación es adivinanza.",
    );
  }

  const answer = await generateJson(buildPrompt(games));

  return parseRecommendations(answer);
}

function buildPrompt(games: ReturnType<typeof listGames>): string {
  const genresByGame = groupGenres();

  const rated = games
    .filter((game) => game.overall !== null)
    .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0));

  const top = rated.slice(0, TOP_GAMES).map((game) => {
    const genres = genresByGame.get(game.id) ?? [];
    const genreLabel = genres.length > 0 ? ` [${genres.join(", ")}]` : "";
    const favorite = game.isFavorite ? " (favorito)" : "";

    return `- ${game.name}: ${game.overall}/100${genreLabel}${favorite}`;
  });

  const worst = rated
    .slice(-3)
    .reverse()
    .map((game) => `- ${game.name}: ${game.overall}/100`);

  // La lista completa evita que recomiende algo que ya tenés.
  const owned = games.map((game) => game.name).join(", ");

  return [
    "Sos un curador de videojuegos. Recomendá juegos nuevos a partir de esta colección.",
    "",
    `MEJOR PUNTUADOS (de ${rated.length} juegos puntuados):`,
    ...top,
    "",
    "PEOR PUNTUADOS (evitá cosas parecidas a estos):",
    ...worst,
    "",
    `YA LOS TIENE, NO LOS RECOMIENDES: ${owned}`,
    "",
    `Devolvé exactamente ${HOW_MANY} recomendaciones como un array JSON.`,
    "Cada elemento debe tener esta forma:",
    '{"title": string, "year": number|null, "genre": string|null, "reason": string, "basedOn": string[]}',
    "",
    "Reglas:",
    "- `reason`: una o dos frases, en español, concretas. Explicá qué tiene ese juego",
    "  que conecta con lo que ya le gustó. Nada de generalidades tipo 'te va a encantar'.",
    "- `basedOn`: títulos EXACTOS de su colección que justifican la recomendación.",
    "- Ningún título repetido, ninguno que ya tenga.",
    "- Respondé SOLO el array JSON, sin texto alrededor y sin backticks.",
  ].join("\n");
}

/**
 * La respuesta de un modelo es texto: puede venir con backticks, con un objeto
 * envolvente o directamente mal formada. Se limpia, se parsea y se VALIDA con
 * el mismo schema que usa el frontend. Si no pasa, no se muestra nada.
 */
function parseRecommendations(answer: string): Recommendation[] {
  const cleaned = answer
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  let raw: unknown;
  try {
    raw = JSON.parse(cleaned);
  } catch {
    throw new UnavailableError("Gemini devolvió algo que no es JSON válido. Probá de nuevo.");
  }

  // Algunos modelos envuelven el array en { recommendations: [...] }.
  const candidate = Array.isArray(raw)
    ? raw
    : ((raw as Record<string, unknown>)?.recommendations ?? raw);

  const parsed = recommendationsSchema.safeParse(candidate);

  if (!parsed.success) {
    throw new UnavailableError("La respuesta de Gemini no tenía el formato esperado.");
  }

  return parsed.data;
}

function groupGenres(): Map<string, string[]> {
  const grouped = new Map<string, string[]>();

  for (const link of statsRepository.findAllGenreLinks()) {
    const names = grouped.get(link.gameId) ?? [];
    names.push(link.name);
    grouped.set(link.gameId, names);
  }

  return grouped;
}
