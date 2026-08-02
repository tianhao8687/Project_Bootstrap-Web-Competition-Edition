import { describe, expect, it } from "vitest";
import { EvidenceSchema, ResearchRepositorySchema } from "../../src/types/domain";

describe("research evidence schemas", () => {
  it("requires every repository card to carry evidence", () => {
    expect(() => ResearchRepositorySchema.parse({
      fullName: "owner/repo",
      url: "https://github.com/owner/repo",
      relevance: "high",
      summary: "A repository",
      confirmedCapabilities: [], usefulReferences: [], avoidCopying: [], differences: [],
      license: { status: "missing" }, evidence: [],
    })).toThrow();
  });

  it("keeps AI inference distinct from repository fact", () => {
    const evidence = EvidenceSchema.parse({ kind: "ai_inference", source: "BRIEF_COMPARISON", summary: "This is an inference." });
    expect(evidence.kind).toBe("ai_inference");
  });
});
