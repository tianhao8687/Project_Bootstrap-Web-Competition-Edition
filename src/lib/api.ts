import {
  BootstrapResponseSchema,
  ResearchResultSchema,
  type BootstrapRequest,
  type BootstrapResponse,
  type ResearchRequest,
  type ResearchResult,
} from "../types/domain";

export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly status: number) {
    super(message);
  }
}

async function postJson<T>(path: string, body: unknown, parse: (value: unknown) => T, externalSignal?: AbortSignal): Promise<T> {
  const timeout = Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS ?? 30_000);
  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: externalSignal
        ? AbortSignal.any([AbortSignal.timeout(timeout), externalSignal])
        : AbortSignal.timeout(timeout),
    });
  } catch (error) {
    if (error instanceof DOMException && ["TimeoutError", "AbortError"].includes(error.name)) {
      throw new ApiError("MODEL_TIMEOUT", "The request timed out. Your confirmed files are still safe.", 408);
    }
    throw new ApiError("NETWORK_ERROR", "The service could not be reached. Check the server and retry.", 503);
  }
  const value = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = typeof value.code === "string" ? value.code : "UNKNOWN_ERROR";
    const message = typeof value.message === "string" ? value.message : "The request failed.";
    throw new ApiError(code, message, response.status);
  }
  return parse(value);
}

export const requestBootstrap = (request: BootstrapRequest): Promise<BootstrapResponse> =>
  postJson("/api/bootstrap", request, (value) => BootstrapResponseSchema.parse(value));

export const requestResearch = (request: ResearchRequest, signal?: AbortSignal): Promise<ResearchResult> =>
  postJson("/api/research", request, (value) => ResearchResultSchema.parse(value), signal);
