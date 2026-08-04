import { describe, expect, it } from "vitest";
import { loadCore } from "../../api/_lib/core";

describe("phase-scoped core loading", () => {
  it("loads BRIEF rules without PLAN or RULES stage bodies", async () => {
    const context = await loadCore("en", "brief");
    expect(context).toContain("# 4. Stage 1: Generate PROJECT_BRIEF.md");
    expect(context).not.toContain("# 5. Stage 2: Generate PROJECT_PLAN.md");
    expect(context).not.toContain("# 9. Stage 3: Generate AI_PROJECT_RULES.md");
  });

  it("loads only the PLAN-related core sections for the plan stage", async () => {
    const context = await loadCore("zh-CN", "plan");
    expect(context).toContain("# 五、阶段 2：生成 PROJECT_PLAN.md");
    expect(context).toContain("# 六、项目复杂度路由器");
    expect(context).not.toContain("# 四、阶段 1：生成 PROJECT_BRIEF.md");
    expect(context).not.toContain("# 九、阶段 3：生成 AI_PROJECT_RULES.md");
  });

  it("retains permanent and final gates for RULES generation", async () => {
    const context = await loadCore("en", "rules");
    expect(context).toContain("## Permanently Non-Trimmable Core Rules");
    expect(context).toContain("# 15. Final Output");
    expect(context).not.toContain("# 4. Stage 1: Generate PROJECT_BRIEF.md");
  });
});
