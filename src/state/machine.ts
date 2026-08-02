import type { Artifact, ArtifactName, ChatMessage, Locale, ProjectSession, ResearchChange, ResearchResult, StableStage } from "../types/domain";
import { createSession } from "./session";

export type SessionAction =
  | { type: "SET_LOCALE"; locale: Locale }
  | { type: "SET_MODE"; mode: "demo" | "live" }
  | { type: "START"; idea: string }
  | { type: "NEEDS_CLARIFICATION"; questions: string[]; warning?: string }
  | { type: "ADD_USER_MESSAGE"; text: string }
  | { type: "BRIEF_READY"; artifact: Artifact; message?: string; warning?: string }
  | { type: "REVISE_ARTIFACT"; artifact: Artifact }
  | { type: "CONFIRM_BRIEF" }
  | { type: "RESEARCH_READY"; research: ResearchResult }
  | { type: "SKIP_RESEARCH" }
  | { type: "ACCEPT_RESEARCH"; changes: ResearchChange[] }
  | { type: "PLAN_READY"; artifact: Artifact }
  | { type: "CONFIRM_PLAN" }
  | { type: "RULES_READY"; artifact: Artifact }
  | { type: "EDIT_UPSTREAM"; artifact: ArtifactName }
  | { type: "FAIL"; code: string; message: string }
  | { type: "RETRY" }
  | { type: "RESET" };

const now = () => new Date().toISOString();
const message = (role: ChatMessage["role"], text: string): ChatMessage => ({
  id: crypto.randomUUID(), role, text, createdAt: now(),
});
const withUpdate = (session: ProjectSession): ProjectSession => ({ ...session, updatedAt: now(), error: undefined });

export function sessionReducer(session: ProjectSession, action: SessionAction): ProjectSession {
  switch (action.type) {
    case "SET_LOCALE":
      return withUpdate({ ...session, locale: action.locale });
    case "SET_MODE":
      return withUpdate({ ...session, mode: action.mode });
    case "START":
      if (session.stage !== "idea_input") return session;
      return withUpdate({
        ...session,
        idea: action.idea.trim(),
        stage: "brief_clarification",
        messages: [...session.messages, message("user", action.idea.trim())],
      });
    case "NEEDS_CLARIFICATION":
      return withUpdate({
        ...session,
        stage: "brief_clarification",
        warningShown: session.warningShown || Boolean(action.warning),
        messages: [...session.messages, message("assistant", [...(action.warning ? [action.warning] : []), ...action.questions].join("\n\n"))],
      });
    case "ADD_USER_MESSAGE":
      return withUpdate({ ...session, messages: [...session.messages, message("user", action.text)] });
    case "BRIEF_READY":
      return withUpdate({
        ...session,
        stage: "brief_review",
        brief: { ...action.artifact, name: "PROJECT_BRIEF.md", confirmed: false },
        research: undefined,
        acceptedResearchChanges: [],
        plan: undefined,
        rules: undefined,
        warningShown: session.warningShown || Boolean(action.warning),
        messages: action.message ? [...session.messages, message("assistant", action.message)] : session.messages,
      });
    case "REVISE_ARTIFACT": {
      const artifact = { ...action.artifact, confirmed: false };
      if (artifact.name === "PROJECT_BRIEF.md") {
        return withUpdate({ ...session, stage: "brief_review", brief: artifact, research: undefined, acceptedResearchChanges: [], plan: undefined, rules: undefined });
      }
      if (artifact.name === "PROJECT_PLAN.md") {
        return withUpdate({ ...session, stage: "plan_review", plan: artifact, rules: undefined });
      }
      return withUpdate({ ...session, rules: artifact });
    }
    case "CONFIRM_BRIEF":
      if (session.stage !== "brief_review" || !session.brief) return session;
      return withUpdate({ ...session, stage: "research_loading", brief: { ...session.brief, confirmed: true } });
    case "RESEARCH_READY":
      if (session.stage !== "research_loading") return session;
      return withUpdate({ ...session, stage: "research_review", research: action.research });
    case "SKIP_RESEARCH":
      if (
        session.stage !== "research_loading"
        && session.stage !== "research_review"
        && !(session.stage === "recoverable_error" && ["research_loading", "research_review"].includes(session.previousStableStage ?? ""))
      ) return session;
      return withUpdate({ ...session, stage: "plan_review", previousStableStage: undefined, research: session.research, acceptedResearchChanges: [] });
    case "ACCEPT_RESEARCH":
      if (session.stage !== "research_review") return session;
      {
        const briefChanges = action.changes.filter((change) => change.target === "PROJECT_BRIEF.md");
        const brief = session.brief && briefChanges.length > 0
          ? {
              ...session.brief,
              content: `${session.brief.content.trim()}\n\n## ${session.locale === "zh-CN" ? "已确认的调研变更" : "Confirmed research changes"}\n${briefChanges.map((change) => `- ${change.summary}`).join("\n")}\n`,
              revision: session.brief.revision + 1,
              confirmed: true,
            }
          : session.brief;
        return withUpdate({ ...session, stage: "plan_review", acceptedResearchChanges: action.changes, brief });
      }
    case "PLAN_READY":
      if (session.stage !== "plan_review") return session;
      return withUpdate({ ...session, plan: { ...action.artifact, name: "PROJECT_PLAN.md", confirmed: false }, rules: undefined });
    case "CONFIRM_PLAN":
      if (session.stage !== "plan_review" || !session.plan) return session;
      return withUpdate({ ...session, stage: "rules_generation", plan: { ...session.plan, confirmed: true } });
    case "RULES_READY":
      if (session.stage !== "rules_generation") return session;
      return withUpdate({ ...session, stage: "completed", rules: { ...action.artifact, name: "AI_PROJECT_RULES.md", confirmed: true } });
    case "EDIT_UPSTREAM": {
      if (action.artifact === "PROJECT_BRIEF.md" && session.brief) {
        return withUpdate({ ...session, stage: "brief_review", brief: { ...session.brief, confirmed: false }, research: undefined, acceptedResearchChanges: [], plan: undefined, rules: undefined });
      }
      if (action.artifact === "PROJECT_PLAN.md" && session.plan) {
        return withUpdate({ ...session, stage: "plan_review", plan: { ...session.plan, confirmed: false }, rules: undefined });
      }
      return session;
    }
    case "FAIL": {
      const previousStableStage: StableStage = session.stage === "recoverable_error"
        ? (session.previousStableStage ?? "idea_input")
        : session.stage;
      return { ...session, stage: "recoverable_error", previousStableStage, error: { code: action.code, message: action.message }, updatedAt: now() };
    }
    case "RETRY":
      return withUpdate({ ...session, stage: session.previousStableStage ?? "idea_input", previousStableStage: undefined });
    case "RESET":
      return createSession(session.locale);
    default:
      return session;
  }
}
