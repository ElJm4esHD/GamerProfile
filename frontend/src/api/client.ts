/** Único lugar del frontend que sabe hablar HTTP. */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    // El Content-Type SOLO va si hay body. Fastify rechaza con 400 un request
    // que se declara JSON y llega vacío (el caso del DELETE).
    ...(body !== undefined && {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(payload?.error ?? `La petición falló (${response.status})`, response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, "GET"),
  post: <T>(path: string, body: unknown) => request<T>(path, "POST", body),
  put: <T>(path: string, body: unknown) => request<T>(path, "PUT", body),
  patch: <T>(path: string, body: unknown) => request<T>(path, "PATCH", body),
  remove: (path: string) => request<void>(path, "DELETE"),
};
