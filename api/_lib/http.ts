import type { VercelRequest, VercelResponse } from "@vercel/node";

export class HttpError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
  }
}

export function parseBody(request: VercelRequest): unknown {
  if (typeof request.body === "string") {
    try { return JSON.parse(request.body); } catch { throw new HttpError(400, "INVALID_INPUT", "Request body must be valid JSON."); }
  }
  return request.body;
}

export function sendError(response: VercelResponse, error: unknown): void {
  if (error instanceof HttpError) {
    response.status(error.status).json({ code: error.code, message: error.message });
    return;
  }
  if (error instanceof Error && ["AbortError", "TimeoutError"].includes(error.name)) {
    response.status(504).json({ code: "MODEL_TIMEOUT", message: "The upstream request timed out. Confirmed artifacts were not changed." });
    return;
  }
  console.error(error);
  response.status(500).json({ code: "UNKNOWN_ERROR", message: "The server could not complete this step." });
}

export function requirePost(request: VercelRequest): void {
  if (request.method !== "POST") throw new HttpError(405, "INVALID_INPUT", "Only POST is supported.");
}
