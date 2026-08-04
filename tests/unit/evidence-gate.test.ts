import { describe, expect, it } from "vitest";
import { assertEvidenceSources } from "../../api/_lib/evidence";
import { demoResearch } from "../../src/lib/demo";

describe("research evidence gate", () => {
  it("rejects repositories that were not fetched", () => {
    const result = demoResearch("en");
    const assessmentPoints = [
      ...result.assessment.advantages,
      ...result.assessment.weaknesses,
      ...result.assessment.reusableIdeas,
      ...result.assessment.differentiation,
    ];
    const allowedSources = new Set([
      ...result.repositories.flatMap((repository) => repository.evidence.map((evidence) => evidence.source)),
      ...assessmentPoints.flatMap((point) => point.evidence.map((evidence) => evidence.source)),
    ]);
    expect(() => assertEvidenceSources(result.repositories, result.assessment, allowedSources, new Set(["langchain-ai/langchain"]))).toThrow(/unfetched repository/);
  });

  it("rejects evidence sources outside the server allow-list", () => {
    const result = demoResearch("en");
    const names = new Set(result.repositories.map((repository) => repository.fullName));
    expect(() => assertEvidenceSources(result.repositories, result.assessment, new Set(["BRIEF_COMPARISON"]), names)).toThrow(/unfetched evidence source/);
  });

  it("rejects a README source mislabeled as repository metadata", () => {
    const result = demoResearch("en");
    const repository = { ...result.repositories[0]!, evidence: [{ kind: "repository_metadata" as const, source: "langchain-ai/langchain:README", summary: "Wrong classification." }] };
    const assessment = { ...result.assessment, advantages: [], weaknesses: [], reusableIdeas: [], differentiation: [] };
    expect(() => assertEvidenceSources([repository], assessment, new Set(["langchain-ai/langchain:README"]), new Set(["langchain-ai/langchain"]))).toThrow(/must use kind readme_claim/);
  });
});
