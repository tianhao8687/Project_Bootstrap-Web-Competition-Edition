import { describe, expect, it } from "vitest";
import { demoBrief, demoPlan, demoResearch, demoRules } from "../../src/lib/demo";
import { sessionReducer } from "../../src/state/machine";
import { createSession } from "../../src/state/session";

describe("bootstrap state machine", () => {
  it("enforces explicit confirmation gates through the complete flow", () => {
    let session = createSession("en");
    session = sessionReducer(session, { type: "START", idea: "Build a focused tool for freelance client deliverables" });
    expect(session.stage).toBe("brief_clarification");

    session = sessionReducer(session, { type: "BRIEF_READY", artifact: demoBrief(session.idea, "en") });
    const premature = sessionReducer(session, { type: "RESEARCH_READY", research: demoResearch("en") });
    expect(premature).toBe(session);

    session = sessionReducer(session, { type: "CONFIRM_BRIEF" });
    expect(session.brief?.confirmed).toBe(true);
    expect(session.stage).toBe("research_loading");

    session = sessionReducer(session, { type: "RESEARCH_READY", research: demoResearch("en") });
    const change = session.research!.assessment.recommendedChanges[0]!;
    session = sessionReducer(session, { type: "ACCEPT_RESEARCH", changes: [change] });
    expect(session.acceptedResearchChanges).toEqual([change]);
    expect(session.brief?.content).toContain(change.summary);

    session = sessionReducer(session, { type: "PLAN_READY", artifact: demoPlan(session.idea, "en") });
    session = sessionReducer(session, { type: "CONFIRM_PLAN" });
    expect(session.plan?.confirmed).toBe(true);
    expect(session.stage).toBe("rules_generation");

    session = sessionReducer(session, { type: "RULES_READY", artifact: demoRules("en") });
    expect(session.stage).toBe("completed");
    expect(session.rules?.confirmed).toBe(true);
  });

  it("localizes the confirmed research change heading in formal BRIEF content", () => {
    let session = createSession("zh-CN");
    session = { ...session, idea: "一个明确的项目想法", stage: "research_review", brief: { ...demoBrief("一个明确的项目想法", "zh-CN"), confirmed: true }, research: demoResearch("zh-CN") };
    const change = session.research!.assessment.recommendedChanges[0]!;
    session = sessionReducer(session, { type: "ACCEPT_RESEARCH", changes: [change] });
    expect(session.brief?.content).toContain("## 已确认的调研变更");
    expect(session.brief?.content).not.toContain("## Confirmed research changes");
  });

  it("invalidates only affected downstream artifacts", () => {
    let session = createSession("zh-CN");
    session = { ...session, idea: "测试项目", stage: "completed", brief: { ...demoBrief("测试项目", "zh-CN"), confirmed: true }, plan: { ...demoPlan("测试项目", "zh-CN"), confirmed: true }, rules: demoRules("zh-CN") };

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
    session = { ...session, stage: "research_loading", idea: "A concrete product idea", brief: { ...demoBrief("A concrete product idea", "en"), confirmed: true } };
    session = sessionReducer(session, { type: "FAIL", code: "GITHUB_RATE_LIMIT", message: "Rate limited" });
    expect(session.stage).toBe("recoverable_error");
    expect(session.brief?.confirmed).toBe(true);
    session = sessionReducer(session, { type: "RETRY" });
    expect(session.stage).toBe("research_loading");
  });

  it("allows a failed optional research step to be skipped without losing BRIEF", () => {
    let session = createSession("en");
    session = { ...session, stage: "research_loading", idea: "A concrete product idea", brief: { ...demoBrief("A concrete product idea", "en"), confirmed: true } };
    session = sessionReducer(session, { type: "FAIL", code: "GITHUB_RATE_LIMIT", message: "Rate limited" });
    session = sessionReducer(session, { type: "SKIP_RESEARCH" });
    expect(session.stage).toBe("plan_review");
    expect(session.brief?.confirmed).toBe(true);
    expect(session.acceptedResearchChanges).toEqual([]);
  });
});
