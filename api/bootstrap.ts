import type { VercelRequest, VercelResponse } from "@vercel/node";
import { BootstrapRequestSchema, BootstrapResponseSchema, type ArtifactName } from "../src/types/domain";
import { loadCore } from "./_lib/core";
import { assertArtifactGate } from "./_lib/gates";
import { HttpError, parseBody, requirePost, sendError } from "./_lib/http";
import { structuredCompletion } from "./_lib/model";

const artifactForAction = {
  draft_brief: ["brief", "PROJECT_BRIEF.md"],
  revise_brief: ["brief", "PROJECT_BRIEF.md"],
  draft_plan: ["plan", "PROJECT_PLAN.md"],
  revise_plan: ["plan", "PROJECT_PLAN.md"],
  generate_rules: ["rules", "AI_PROJECT_RULES.md"],
} as const;

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    requirePost(request);
    const parsed = BootstrapRequestSchema.safeParse(parseBody(request));
    if (!parsed.success) throw new HttpError(400, "INVALID_INPUT", parsed.error.issues.map((issue) => issue.message).join("; "));
    const input = parsed.data;
    const [artifactKind, expectedName] = artifactForAction[input.action];
    if (artifactKind !== "brief" && !input.session.brief?.confirmed) {
      throw new HttpError(409, "INVALID_INPUT", "PROJECT_BRIEF.md must be confirmed before this action.");
    }
    if (artifactKind === "rules" && !input.session.plan?.confirmed) {
      throw new HttpError(409, "INVALID_INPUT", "PROJECT_PLAN.md must be confirmed before generating rules.");
    }

    const core = await loadCore(input.locale, artifactKind);
    const system = `You are Project Bootstrap Web. Return JSON only and follow the supplied schema.\n
Use only current session facts. The user may be a beginner who cannot name a product category, knowledge-base type, or technical stack. Never require technical vocabulary. Ask at most 1-3 short plain-language questions in one clarification round, and only when an unknown genuinely changes the safe executable outcome. Prefer questions about the user, material or workflow, sharing, and sensitive operations. Always allow the user to say they are unsure; then recommend a conservative, reversible default and label it as an assumption.\n
Do not praise novelty, expand scope, reveal private reasoning, or create a fourth formal project file.\n
For revisions, change only the requested artifact. The user controls confirmed scope.\n
${core}`;
    const stageContext = artifactKind === "brief"
      ? {
          idea: input.session.idea,
          messages: input.session.messages,
          currentBrief: input.session.brief,
          warningShown: input.session.warningShown,
        }
      : artifactKind === "plan"
        ? {
            idea: input.session.idea,
            confirmedBrief: input.session.brief,
            acceptedResearchChanges: input.session.acceptedResearchChanges,
            currentPlan: input.session.plan,
          }
        : {
            confirmedBrief: input.session.brief,
            confirmedPlan: input.session.plan,
            acceptedRulesChanges: input.session.acceptedResearchChanges.filter((change) => change.target === "AI_PROJECT_RULES.md"),
          };
    const user = `ACTION: ${input.action}\nLOCALE: ${input.locale}\nUSER MESSAGE: ${input.userMessage ?? "(none)"}\n\nPHASE-SCOPED SESSION JSON\n${JSON.stringify(stageContext)}`;
    let result = await structuredCompletion(BootstrapResponseSchema, system, user);
    const clarificationAlreadyAsked = input.action === "draft_brief" && input.session.messages.some((entry) => entry.role === "assistant");
    if (result.status === "needs_input" && clarificationAlreadyAsked) {
      result = await structuredCompletion(
        BootstrapResponseSchema,
        `${system}\n\nA clarification round already happened. Do not ask another question. Generate PROJECT_BRIEF.md now, marking non-blocking unknowns as pending or unverified.`,
        user,
      );
      if (result.status === "needs_input") throw new HttpError(502, "MODEL_SCHEMA_ERROR", "The model attempted a second clarification round; only one is allowed.");
    }
    if (input.session.warningShown) result.warning = undefined;
    if (result.artifact) {
      const existing = expectedName === "PROJECT_BRIEF.md" ? input.session.brief : expectedName === "PROJECT_PLAN.md" ? input.session.plan : undefined;
      result.artifact.name = expectedName as ArtifactName;
      result.artifact.revision = Math.max(result.artifact.revision, (existing?.revision ?? 0) + 1);
      result.artifact.confirmed = false;
      assertArtifactGate(result.artifact, expectedName);
    }
    if (result.status !== "needs_input" && !result.artifact) {
      throw new HttpError(502, "MODEL_SCHEMA_ERROR", "The model omitted the required artifact.");
    }
    response.status(200).json(result);
  } catch (error) {
    sendError(response, error);
  }
}
