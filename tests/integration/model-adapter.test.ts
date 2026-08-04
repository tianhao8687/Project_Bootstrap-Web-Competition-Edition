import { z } from "zod";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { structuredCompletion } from "../../api/_lib/model";

const ResultSchema = z.object({ value: z.string().min(1) });

describe("OpenAI-compatible structured adapter", () => {
  beforeEach(() => {
    process.env.LLM_BASE_URL = "https://model.example/v1";
    process.env.LLM_API_KEY = "test-key";
    process.env.LLM_MODEL = "test-model";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.LLM_BASE_URL;
    delete process.env.LLM_API_KEY;
    delete process.env.LLM_MODEL;
  });

  it("parses JSON content that passes the requested schema", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: '{"value":"ok"}' } }] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(structuredCompletion(ResultSchema, "system", "user")).resolves.toEqual({ value: "ok" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("allows exactly one structural repair attempt", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ message: { content: '{"wrong":true}' } }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ choices: [{ message: { content: '{"value":"repaired"}' } }] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(structuredCompletion(ResultSchema, "system", "user")).resolves.toEqual({ value: "repaired" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
