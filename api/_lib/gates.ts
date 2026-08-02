import type { Artifact, ArtifactName } from "../../src/types/domain";
import { HttpError } from "./http";

const forbiddenFourthFiles = ["RESEARCH_REPORT.md", "PROJECT_RESEARCH.md", "HANDOFF.md"];

export function assertArtifactGate(artifact: Artifact, expected: ArtifactName): void {
  if (artifact.name !== expected) throw new HttpError(502, "MODEL_SCHEMA_ERROR", `Expected ${expected}, received ${artifact.name}.`);
  if (!/^#\s+\S+/m.test(artifact.content) || !/^##\s+\S+/m.test(artifact.content)) {
    throw new HttpError(502, "MODEL_SCHEMA_ERROR", `${expected} is missing a valid Markdown heading hierarchy.`);
  }
  if (forbiddenFourthFiles.some((name) => artifact.content.includes(name))) {
    throw new HttpError(502, "MODEL_SCHEMA_ERROR", `${expected} attempts to create a forbidden fourth formal file.`);
  }
  if (expected === "AI_PROJECT_RULES.md") {
    const normalized = artifact.content.toLowerCase();
    const rules = ["test", "confirm", "context"];
    if (rules.some((rule) => !normalized.includes(rule)) && !artifact.content.includes("测试")) {
      throw new HttpError(502, "MODEL_SCHEMA_ERROR", "AI_PROJECT_RULES.md is missing permanent execution, confirmation, or test rules.");
    }
  }
}
