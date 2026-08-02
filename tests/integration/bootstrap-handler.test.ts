import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import bootstrapHandler from "../../api/bootstrap";
import { demoResearch } from "../../src/lib/demo";
import type { Artifact } from "../../src/types/domain";

function completion(content: unknown) {
  return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }] }), { status: 200 });
}

function request(body: unknown) {
  return { method: "POST", body } as never;
}

function responseHarness() {
  const state: { status?: number; body?: unknown } = {};
  const response = {
    status(code: number) { state.status = code; return response; },
    json(body: unknown) { state.body = body; return response; },
  };
  return { state, response: response as never };
}

const idea = "Build a focused client deliverable checker for freelance designers.";
const briefContent = `# PROJECT BRIEF\n\n## Target users\nFreelance designers.\n\n## MVP\nCheck one deliverable list and report missing items.`;
const planContent = `# PROJECT PLAN\n\n## Direction\nBuild one local-first workflow.\n\n## Acceptance\nThe checklist, recovery, and export paths pass tests.`;
const rulesContent = `# AI PROJECT RULES\n\n## Context\nLoad only the file required for the task.\n\n## Confirmation\nDo not change scope silently.\n\n## Test reporting\nNever report an unrun test as passed.`;

describe("/api/bootstrap handler", () => {
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

  it("completes BRIEF → PLAN → RULES while enforcing phase-scoped session context", async () => {
    const outputs = [
      { status: "awaiting_confirmation", assistantMessage: "Review the brief.", artifact: { name: "PROJECT_PLAN.md", content: briefContent, revision: 1, confirmed: true } },
      { status: "awaiting_confirmation", assistantMessage: "Review the plan.", artifact: { name: "PROJECT_PLAN.md", content: planContent, revision: 1, confirmed: true } },
      { status: "completed", assistantMessage: "Rules ready.", artifact: { name: "AI_PROJECT_RULES.md", content: rulesContent, revision: 1, confirmed: true } },
    ];
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(completion(outputs.shift())));
    vi.stubGlobal("fetch", fetchMock);

    const briefResponse = responseHarness();
    await bootstrapHandler(request({
      locale: "en", action: "draft_brief",
      session: { idea, messages: [], acceptedResearchChanges: [], warningShown: false },
    }), briefResponse.response);
    expect(briefResponse.state.status).toBe(200);
    const brief = (briefResponse.state.body as { artifact: Artifact }).artifact;
    expect(brief.name).toBe("PROJECT_BRIEF.md");
    expect(brief.confirmed).toBe(false);

    const confirmedBrief = { ...brief, confirmed: true };
    const research = demoResearch("en");
    research.assessment.recommendedChanges.push({
      id: "unaccepted-secret", target: "PROJECT_PLAN.md", kind: "technical_reference",
      summary: "UNACCEPTED_CHANGE_MUST_NOT_REACH_PLAN", rationale: "Not selected by the user.",
    });
    const planResponse = responseHarness();
    await bootstrapHandler(request({
      locale: "en", action: "draft_plan",
      session: { idea, messages: [], brief: confirmedBrief, research, acceptedResearchChanges: [], warningShown: false },
    }), planResponse.response);
    expect(planResponse.state.status).toBe(200);
    const plan = (planResponse.state.body as { artifact: Artifact }).artifact;
    expect(plan.name).toBe("PROJECT_PLAN.md");

    const secondModelRequest = JSON.parse(String((fetchMock.mock.calls[1]![1] as RequestInit).body));
    const planPrompt = secondModelRequest.messages[1].content as string;
    expect(planPrompt).not.toContain("UNACCEPTED_CHANGE_MUST_NOT_REACH_PLAN");
    expect(planPrompt).not.toContain('"research"');
    expect(secondModelRequest.messages[0].content).not.toContain("# 9. Stage 3: Generate AI_PROJECT_RULES.md");

    const rulesResponse = responseHarness();
    await bootstrapHandler(request({
      locale: "en", action: "generate_rules",
      session: { idea, messages: [], brief: confirmedBrief, research, acceptedResearchChanges: [], plan: { ...plan, confirmed: true }, warningShown: false },
    }), rulesResponse.response);
    expect(rulesResponse.state.status).toBe(200);
    const rules = (rulesResponse.state.body as { artifact: Artifact }).artifact;
    expect(rules.name).toBe("AI_PROJECT_RULES.md");
    expect(rules.confirmed).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("blocks PLAN before BRIEF confirmation without calling the model", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const harness = responseHarness();
    await bootstrapHandler(request({
      locale: "en", action: "draft_plan",
      session: { idea, messages: [], brief: { name: "PROJECT_BRIEF.md", content: briefContent, revision: 1, confirmed: false }, acceptedResearchChanges: [], warningShown: false },
    }), harness.response);
    expect(harness.state.status).toBe(409);
    expect(harness.state.body).toMatchObject({ code: "INVALID_INPUT" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a forbidden fourth formal file in model output", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(completion({
      status: "awaiting_confirmation", assistantMessage: "Review.",
      artifact: { name: "PROJECT_BRIEF.md", content: `${briefContent}\n\nCreate RESEARCH_REPORT.md next.`, revision: 1, confirmed: false },
    })));
    const harness = responseHarness();
    await bootstrapHandler(request({ locale: "en", action: "draft_brief", session: { idea, messages: [], acceptedResearchChanges: [], warningShown: false } }), harness.response);
    expect(harness.state.status).toBe(502);
    expect(harness.state.body).toMatchObject({ code: "MODEL_SCHEMA_ERROR" });
  });

  it("forces a BRIEF after one clarification round instead of repeating questions", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(completion({ status: "needs_input", assistantMessage: "One more question.", blockingQuestions: ["Another blocking question?"] }))
      .mockResolvedValueOnce(completion({
        status: "awaiting_confirmation", assistantMessage: "Drafted with current facts.",
        artifact: { name: "PROJECT_BRIEF.md", content: briefContent, revision: 1, confirmed: false },
      }));
    vi.stubGlobal("fetch", fetchMock);
    const harness = responseHarness();
    await bootstrapHandler(request({
      locale: "en", action: "draft_brief",
      session: {
        idea, acceptedResearchChanges: [], warningShown: true,
        messages: [
          { id: "m1", role: "assistant", text: "First blocking question?", createdAt: "2026-08-02T00:00:00.000Z" },
          { id: "m2", role: "user", text: "The first answer.", createdAt: "2026-08-02T00:01:00.000Z" },
        ],
      },
    }), harness.response);
    expect(harness.state.status).toBe(200);
    expect(harness.state.body).toMatchObject({ status: "awaiting_confirmation", artifact: { name: "PROJECT_BRIEF.md" } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("maps provider timeouts to the recoverable MODEL_TIMEOUT contract", async () => {
    const timeout = new Error("timed out");
    timeout.name = "TimeoutError";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(timeout));
    const harness = responseHarness();
    await bootstrapHandler(request({ locale: "en", action: "draft_brief", session: { idea, messages: [], acceptedResearchChanges: [], warningShown: false } }), harness.response);
    expect(harness.state.status).toBe(504);
    expect(harness.state.body).toMatchObject({ code: "MODEL_TIMEOUT" });
  });
});
