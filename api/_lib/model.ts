import { z, type ZodType } from "zod";
import { HttpError } from "./http";

const ChatCompletionSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string() }) })).min(1),
});

function modelConfig() {
  const baseUrl = process.env.LLM_BASE_URL?.replace(/\/$/, "");
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;
  if (!baseUrl || !apiKey || !model) {
    throw new HttpError(503, "UPSTREAM_RULES_MISSING", "LLM_BASE_URL, LLM_API_KEY, and LLM_MODEL must be configured on the server.");
  }
  return { baseUrl, apiKey, model };
}

async function completion(messages: Array<{ role: "system" | "user"; content: string }>): Promise<string> {
  const { baseUrl, apiKey, model } = modelConfig();
  const timeout = Number(process.env.APP_REQUEST_TIMEOUT_MS ?? 30_000);
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ model, temperature: 0.2, response_format: { type: "json_object" }, messages }),
    signal: AbortSignal.timeout(timeout),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new HttpError(response.status >= 500 ? 502 : response.status, "MODEL_TIMEOUT", `The model provider rejected the request (${response.status}). ${detail}`);
  }
  const raw = await response.text();
  if (raw.length > 1_000_000) throw new HttpError(502, "MODEL_SCHEMA_ERROR", "The model provider returned an unexpectedly large response.");
  let json: unknown;
  try { json = JSON.parse(raw); } catch { throw new HttpError(502, "MODEL_SCHEMA_ERROR", "The model provider returned invalid JSON."); }
  const body = ChatCompletionSchema.safeParse(json);
  if (!body.success) throw new HttpError(502, "MODEL_SCHEMA_ERROR", "The provider returned an unsupported chat-completion shape.");
  return body.data.choices[0]!.message.content;
}

function parseJson(value: string): unknown {
  const trimmed = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try { return JSON.parse(trimmed); } catch { return undefined; }
}

export async function structuredCompletion<T>(schema: ZodType<T>, system: string, user: string): Promise<T> {
  const first = await completion([{ role: "system", content: system }, { role: "user", content: user }]);
  const parsed = schema.safeParse(parseJson(first));
  if (parsed.success) return parsed.data;

  const repair = await completion([
    { role: "system", content: "Repair JSON structure only. Do not add new factual claims. Return one JSON object and nothing else." },
    { role: "user", content: `The output failed schema validation. Repair it using the error summary and original output.\n\nERRORS\n${parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n")}\n\nOUTPUT\n${first.slice(0, 60_000)}` },
  ]);
  const repaired = schema.safeParse(parseJson(repair));
  if (!repaired.success) throw new HttpError(502, "MODEL_SCHEMA_ERROR", "The model response failed schema validation after one repair attempt.");
  return repaired.data;
}
