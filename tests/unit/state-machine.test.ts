import { describe, expect, it } from "vitest";
import { demoBrief, demoPlan, demoResearch, demoRules } from "../../src/lib/demo";
import { sessionReducer } from "../../src/state/machine";
import { createSession } from "../../src/state/session";

describe("bootstrap state machine", () => {
  it("enforces explicit confirmation gates through the complete flow", () => {
    let session = createSession("en");
    session = sessionReducer(session, { type: "START", idea: "Build a focused tool for freelance client deliverables" });
    expect(session.stage).toBe("brief_clarification");

    session = sessionReducer(session, { type: "BRIEF_READY", artifact: demoBrief("en") });
    const premature = sessionReducer(session, { type: "RESEARCH_READY", research: demoResearch("en") });
    expect(premature).toBe(session);

    session = sessionReducer(session, { type: "CONFIRM_BRIEF" });
    expect(session.brief?.confirmed).toBe(true);
    expect(session.stage).toBe("research_loading");

    session = sessionReducer(session, { type: "RESEARCH_READY", research: demoResearch("en") });
    const change = session.research!.assessment.recommendedChanges[0]!;
    session = sessionReducer(session, { type: "ACCEPT_RESEARCH", changes: [change] });
    expect(session.acceptedResearchChanges).toEqual([change]);
    expect(session.brief?.content).not.toContain("Confirmed research changes");

    session = sessionReducer(session, { type: "PLAN_READY", artifact: demoPlan("en") });
    session = sessionReducer(session, { type: "CONFIRM_PLAN" });
    expect(session.plan?.confirmed).toBe(true);
    expect(session.stage).toBe("rules_generation");

    session = sessionReducer(session, { type: "RULES_READY", artifact: demoRules("en") });
    expect(session.stage).toBe("completed");
    expect(session.rules?.confirmed).toBe(true);
  });

  it("records one clarification answer before producing the BRIEF", () => {
    let session = createSession("zh-CN");
    session = sessionReducer(session, { type: "START", idea: "我想把自己的资料和知识存起来" });
    session = sessionReducer(session, { type: "NEEDS_CLARIFICATION", questions: ["主要保存什么资料 以后会不会共享"] });
    session = sessionReducer(session, { type: "ANSWER_CLARIFICATION", text: "先自己使用 以后可能邀请同事" });
    expect(session.messages.map((entry) => entry.role)).toEqual(["user", "assistant", "user"]);
    session = sessionReducer(session, { type: "BRIEF_READY", artifact: demoBrief("zh-CN") });
    expect(session.stage).toBe("brief_review");
    expect(session.messages.filter((entry) => entry.role === "assistant")).toHaveLength(1);
  });

  it("returns through prior interfaces while invalidating only downstream work", () => {
    let session = createSession("zh-CN");
    session = sessionReducer(session, { type: "START", idea: "我想把知识存起来以后提问" });
    session = sessionReducer(session, { type: "NEEDS_CLARIFICATION", questions: ["以后会不会分享给同事"] });
    session = sessionReducer(session, { type: "ANSWER_CLARIFICATION", text: "先自己用 以后可能共享" });
    session = sessionReducer(session, { type: "BRIEF_READY", artifact: demoBrief("zh-CN"), message: "已整理" });
    session = sessionReducer(session, { type: "CONFIRM_BRIEF" });
    session = sessionReducer(session, { type: "RESEARCH_READY", research: demoResearch("zh-CN") });
    const selected = session.research!.assessment.recommendedChanges[0]!;
    session = sessionReducer(session, { type: "ACCEPT_RESEARCH", changes: [selected] });
    session = sessionReducer(session, { type: "PLAN_READY", artifact: demoPlan("zh-CN") });
    session = sessionReducer(session, { type: "CONFIRM_PLAN" });
    session = sessionReducer(session, { type: "RULES_READY", artifact: demoRules("zh-CN") });

    session = sessionReducer(session, { type: "BACK" });
    expect(session).toMatchObject({ stage: "plan_review", rules: undefined });
    expect(session.plan?.confirmed).toBe(false);

    session = sessionReducer(session, { type: "BACK" });
    expect(session.stage).toBe("research_review");
    expect(session.plan).toBeUndefined();
    expect(session.acceptedResearchChanges).toEqual([selected]);

    session = sessionReducer(session, { type: "BACK" });
    expect(session.stage).toBe("brief_review");
    expect(session.research).toBeUndefined();
    expect(session.brief?.confirmed).toBe(false);

    session = sessionReducer(session, { type: "BACK" });
    expect(session.stage).toBe("brief_clarification");
    expect(session.brief).toBeUndefined();
    expect(session.messages.filter((entry) => entry.role === "user")).toHaveLength(2);

    session = sessionReducer(session, { type: "ANSWER_CLARIFICATION", text: "改为立即和小团队共享" });
    expect(session.messages.filter((entry) => entry.role === "user")).toHaveLength(2);
    expect(session.messages.at(-1)?.text).toBe("改为立即和小团队共享");

    session = sessionReducer(session, { type: "BACK" });
    expect(session.stage).toBe("idea_input");
    const staleBrief = sessionReducer(session, { type: "BRIEF_READY", artifact: demoBrief("zh-CN") });
    expect(staleBrief).toBe(session);
  });

  it("localizes the confirmed research change heading in formal BRIEF content", () => {
    let session = createSession("zh-CN");
    session = { ...session, idea: "一个明确的项目想法", stage: "research_review", brief: { ...demoBrief("zh-CN"), confirmed: true }, research: demoResearch("zh-CN") };
    const change = {
      ...session.research!.assessment.recommendedChanges[0]!,
      id: "brief-change",
      target: "PROJECT_BRIEF.md" as const,
      summary: "把可追溯引用明确为核心验收标准",
    };
    session = sessionReducer(session, { type: "ACCEPT_RESEARCH", changes: [change] });
    expect(session.brief?.content).toContain("## 已确认的调研变更");
    expect(session.brief?.content).not.toContain("## Confirmed research changes");
  });

  it("invalidates only affected downstream artifacts", () => {
    let session = createSession("zh-CN");
    session = { ...session, idea: "测试项目", stage: "completed", brief: { ...demoBrief("zh-CN"), confirmed: true }, plan: { ...demoPlan("zh-CN"), confirmed: true }, rules: demoRules("zh-CN") };

    const editPlan = sessionReducer(session, { type: "EDIT_UPSTREAM", artifact: "PROJECT_PLAN.md" });
    expect(editPlan.brief?.confirmed).toBe(true);
    expect(editPlan.plan?.confirmed).toBe(false);
    expect(editPlan.rules).toBeUndefined();

    const editBrief = sessionReducer(session, { type: "EDIT_UPSTREAM", artifact: "PROJECT_BRIEF.md" });
    expect(editBrief.brief?.confirmed).toBe(false);
    expect(editBrief.research).toBeUndefined();
    expect(editBrief.plan).toBeUndefined();
    expect(editBrief.rules).toBeUndefined();
  });

  it("recovers to the last stable stage without deleting confirmed files", () => {
    let session = createSession("en");
    session = { ...session, stage: "research_loading", idea: "A concrete product idea", brief: { ...demoBrief("en"), confirmed: true } };
    session = sessionReducer(session, { type: "FAIL", code: "GITHUB_RATE_LIMIT", message: "Rate limited" });
    expect(session.stage).toBe("recoverable_error");
    expect(session.brief?.confirmed).toBe(true);
    session = sessionReducer(session, { type: "RETRY" });
    expect(session.stage).toBe("research_loading");
  });

  it("allows a failed optional research step to be skipped without losing BRIEF", () => {
    let session = createSession("en");
    session = { ...session, stage: "research_loading", idea: "A concrete product idea", brief: { ...demoBrief("en"), confirmed: true } };
    session = sessionReducer(session, { type: "FAIL", code: "GITHUB_RATE_LIMIT", message: "Rate limited" });
    session = sessionReducer(session, { type: "SKIP_RESEARCH" });
    expect(session.stage).toBe("plan_review");
    expect(session.brief?.confirmed).toBe(true);
    expect(session.acceptedResearchChanges).toEqual([]);
  });
});
