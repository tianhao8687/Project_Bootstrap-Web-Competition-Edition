import { afterEach, describe, expect, it } from "vitest";
import { createSession, loadSession, SESSION_STORAGE_KEY } from "../../src/state/session";

describe("demo session migration", () => {
  afterEach(() => localStorage.clear());

  it("resets an obsolete fixed demo without deleting live user work", () => {
    const oldDemo = { ...createSession("zh-CN"), idea: "旧版固定演示想法", stage: "brief_review" as const };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(oldDemo));
    expect(loadSession()).toMatchObject({ locale: "zh-CN", stage: "idea_input", idea: "" });

    const live = { ...createSession("zh-CN"), mode: "live" as const, idea: "用户自己的真实项目", stage: "brief_clarification" as const };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(live));
    expect(loadSession()).toMatchObject({ mode: "live", idea: "用户自己的真实项目", stage: "brief_clarification" });
  });
});
