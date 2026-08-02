import type { Evidence, EvidenceKind, ProjectAssessment, ResearchRepository } from "../../src/types/domain";
import { HttpError } from "./http";

export function assertEvidenceSources(repositories: ResearchRepository[], assessment: ProjectAssessment, allowed: Set<string>, candidateNames: Set<string>): void {
  for (const repository of repositories) {
    if (!candidateNames.has(repository.fullName)) {
      throw new HttpError(502, "MODEL_SCHEMA_ERROR", `The model introduced an unfetched repository: ${repository.fullName}.`);
    }
    for (const evidence of repository.evidence) {
      assertEvidence(evidence, allowed);
    }
  }
  for (const group of [assessment.advantages, assessment.weaknesses, assessment.reusableIdeas, assessment.differentiation]) {
    for (const point of group) for (const evidence of point.evidence) {
      assertEvidence(evidence, allowed);
    }
  }
}

function assertEvidence(evidence: Evidence, allowed: Set<string>): void {
  if (!allowed.has(evidence.source)) throw new HttpError(502, "MODEL_SCHEMA_ERROR", `The model cited an unfetched evidence source: ${evidence.source}.`);
  const expectedKind = expectedKindForSource(evidence.source);
  if (expectedKind && evidence.kind !== expectedKind) {
    throw new HttpError(502, "MODEL_SCHEMA_ERROR", `Evidence source ${evidence.source} must use kind ${expectedKind}, not ${evidence.kind}.`);
  }
}

function expectedKindForSource(source: string): EvidenceKind | undefined {
  if (source === "BRIEF_COMPARISON") return "ai_inference";
  if (source.endsWith(":metadata")) return "repository_metadata";
  if (source.endsWith(":README")) return "readme_claim";
  if (source.endsWith(":LICENSE")) return "license_evidence";
  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+:[^:]+$/.test(source)) return "file_evidence";
  return undefined;
}
