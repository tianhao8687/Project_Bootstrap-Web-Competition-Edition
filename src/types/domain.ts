import { z } from "zod";

export const LocaleSchema = z.enum(["zh-CN", "en"]);
export type Locale = z.infer<typeof LocaleSchema>;

export const ArtifactNameSchema = z.enum([
  "PROJECT_BRIEF.md",
  "PROJECT_PLAN.md",
  "AI_PROJECT_RULES.md",
]);
export type ArtifactName = z.infer<typeof ArtifactNameSchema>;

export const ArtifactSchema = z.object({
  name: ArtifactNameSchema,
  content: z.string().min(40),
  revision: z.number().int().positive(),
  confirmed: z.boolean(),
});
export type Artifact = z.infer<typeof ArtifactSchema>;

export const EvidenceKindSchema = z.enum([
  "repository_metadata",
  "readme_claim",
  "file_evidence",
  "license_evidence",
  "ai_inference",
]);
export type EvidenceKind = z.infer<typeof EvidenceKindSchema>;

export const EvidenceSchema = z.object({
  kind: EvidenceKindSchema,
  source: z.string().min(1),
  summary: z.string().min(1),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

export const EvidenceBackedPointSchema = z.object({
  text: z.string().min(1),
  evidence: z.array(EvidenceSchema).min(1),
});
export type EvidenceBackedPoint = z.infer<typeof EvidenceBackedPointSchema>;

export const ResearchChangeSchema = z.object({
  id: z.string().min(1),
  target: ArtifactNameSchema,
  kind: z.enum(["scope", "differentiation", "technical_reference", "license_rule", "validation"]),
  summary: z.string().min(1),
  rationale: z.string().min(1),
});
export type ResearchChange = z.infer<typeof ResearchChangeSchema>;

export const ResearchRepositorySchema = z.object({
  fullName: z.string().min(1),
  url: z.string().url(),
  relevance: z.enum(["high", "medium", "low"]),
  summary: z.string().min(1),
  confirmedCapabilities: z.array(z.string()),
  usefulReferences: z.array(z.string()),
  avoidCopying: z.array(z.string()),
  differences: z.array(z.string()),
  license: z.object({
    spdx: z.string().optional(),
    status: z.enum(["detected", "missing", "unclear"]),
  }),
  evidence: z.array(EvidenceSchema).min(1),
});
export type ResearchRepository = z.infer<typeof ResearchRepositorySchema>;

export const ResearchVerdictSchema = z.enum([
  "continue",
  "continue_with_focus",
  "redefine_differentiation",
  "pause_for_evidence",
]);
export type ResearchVerdict = z.infer<typeof ResearchVerdictSchema>;

export const ProjectAssessmentSchema = z.object({
  advantages: z.array(EvidenceBackedPointSchema),
  weaknesses: z.array(EvidenceBackedPointSchema),
  reusableIdeas: z.array(EvidenceBackedPointSchema),
  differentiation: z.array(EvidenceBackedPointSchema),
  recommendedChanges: z.array(ResearchChangeSchema),
  verdict: ResearchVerdictSchema,
  verdictReason: z.string().min(1),
});
export type ProjectAssessment = z.infer<typeof ProjectAssessmentSchema>;

export const ResearchResultSchema = z.object({
  queries: z.array(z.string()).min(1).max(6),
  repositories: z.array(ResearchRepositorySchema).max(5),
  assessment: ProjectAssessmentSchema,
  fetchedAt: z.string().datetime(),
  limitations: z.array(z.string()),
});
export type ResearchResult = z.infer<typeof ResearchResultSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  text: z.string(),
  createdAt: z.string().datetime(),
});
export type ChatMessage = z.infer<typeof MessageSchema>;

export const StableStageSchema = z.enum([
  "idea_input",
  "brief_clarification",
  "brief_review",
  "research_loading",
  "research_review",
  "plan_review",
  "rules_generation",
  "completed",
]);
export type StableStage = z.infer<typeof StableStageSchema>;
export type Stage = StableStage | "recoverable_error";

export const ProjectSessionSchema = z.object({
  id: z.string(),
  locale: LocaleSchema,
  mode: z.enum(["demo", "live"]),
  stage: z.union([StableStageSchema, z.literal("recoverable_error")]),
  previousStableStage: StableStageSchema.optional(),
  idea: z.string(),
  messages: z.array(MessageSchema),
  brief: ArtifactSchema.optional(),
  research: ResearchResultSchema.optional(),
  acceptedResearchChanges: z.array(ResearchChangeSchema),
  plan: ArtifactSchema.optional(),
  rules: ArtifactSchema.optional(),
  warningShown: z.boolean(),
  error: z.object({ code: z.string(), message: z.string() }).optional(),
  updatedAt: z.string().datetime(),
});
export type ProjectSession = z.infer<typeof ProjectSessionSchema>;

export const BootstrapActionSchema = z.enum([
  "draft_brief",
  "revise_brief",
  "draft_plan",
  "revise_plan",
  "generate_rules",
]);

export const BootstrapRequestSchema = z.object({
  locale: LocaleSchema,
  action: BootstrapActionSchema,
  userMessage: z.string().max(4_000).optional(),
  session: ProjectSessionSchema.pick({
    idea: true,
    messages: true,
    brief: true,
    research: true,
    acceptedResearchChanges: true,
    plan: true,
    warningShown: true,
  }),
});
export type BootstrapRequest = z.infer<typeof BootstrapRequestSchema>;

export const BootstrapResponseSchema = z.object({
  status: z.enum(["needs_input", "awaiting_confirmation", "artifact_updated", "completed"]),
  assistantMessage: z.string().min(1),
  blockingQuestions: z.array(z.string()).max(3).optional(),
  warning: z.string().optional(),
  artifact: ArtifactSchema.optional(),
});
export type BootstrapResponse = z.infer<typeof BootstrapResponseSchema>;

export const ResearchRequestSchema = z.object({
  locale: LocaleSchema,
  brief: z.string().min(40).max(30_000),
  maxRepositories: z.number().int().min(1).max(5).default(5),
});
export type ResearchRequest = z.infer<typeof ResearchRequestSchema>;

export type ApiErrorCode =
  | "INVALID_INPUT"
  | "MODEL_TIMEOUT"
  | "MODEL_SCHEMA_ERROR"
  | "GITHUB_RATE_LIMIT"
  | "NO_RELEVANT_REPOSITORIES"
  | "UPSTREAM_RULES_MISSING";
