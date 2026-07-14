import { config } from "../../config.js";
import { UnavailableError } from "../../errors.js";

/**
 * Cliente mínimo de Gemini: un fetch a la REST API.
 *
 * Sin SDK, a propósito. Las librerías de Google cambiaron de nombre y de forma
 * varias veces; una llamada HTTP no se rompe con un release. Node 20+ trae
 * `fetch` global, así que esto no agrega ni una dependencia.
 */
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; status?: string };
}

export async function generateJson(prompt: string): Promise<string> {
  const { apiKey, model } = config.gemini;

  if (!apiKey) {
    throw new UnavailableError(
      "Falta GEMINI_API_KEY. Creá backend/.env con tu clave y reiniciá el servidor.",
    );
  }

  const url = `${ENDPOINT}/${model}:generateContent`;

  let response: Response;
  try {
    response = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          // Recomendar es sugerir, no calcular: conviene algo de variedad.
          temperature: 0.9,
          responseMimeType: "application/json",
        },
      }),
    });
  } catch (cause) {
    // Sin internet, DNS caído, firewall. No es culpa de la clave ni del modelo.
    throw new UnavailableError(
      `No se pudo contactar a Google: ${cause instanceof Error ? cause.message : "error de red"}`,
    );
  }

  const payload = (await response.json().catch(() => null)) as GeminiResponse | null;

  if (!response.ok) {
    // El mensaje de Google es específico y útil ("API key not valid",
    // "model not found"). Se propaga tal cual en vez de taparlo.
    const detail = payload?.error?.message ?? "sin detalle";
    throw new UnavailableError(`Gemini (${response.status}, modelo "${model}"): ${detail}`);
  }

  const blocked = payload?.promptFeedback?.blockReason;
  if (blocked) throw new UnavailableError(`Gemini bloqueó el pedido: ${blocked}`);

  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    const reason = payload?.candidates?.[0]?.finishReason ?? "respuesta vacía";
    throw new UnavailableError(`Gemini no devolvió texto (${reason}). Probá de nuevo.`);
  }

  return text;
}
