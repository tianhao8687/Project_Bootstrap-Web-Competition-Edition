import { expect, test, type Page } from "@playwright/test";

const browserErrors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
});

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([]);
});

async function reachDemoBrief(page: Page, locale: "zh-CN" | "en" = "zh-CN") {
  const startLabel = locale === "zh-CN" ? "开始完整知识库案例" : "Start the complete knowledge-base case";
  const reply = locale === "zh-CN" ? /个人先用 以后可能和同事共享/ : /Personal first, team later/;
  const continueLabel = locale === "zh-CN" ? "确认理解并生成 BRIEF" : "Confirm understanding and generate BRIEF";
  await page.getByRole("button", { name: startLabel, exact: true }).click();
  await expect(page.getByRole("heading", { name: locale === "zh-CN" ? "先把想法说清一点" : "Clarify the idea a little", exact: true })).toBeVisible();
  await page.getByRole("button", { name: reply }).click();
  await page.getByRole("button", { name: continueLabel, exact: false }).click();
  await expect(page.getByText("PROJECT_BRIEF.md").first()).toBeVisible();
}

test("complete RAG case delivers full BRIEF PLAN and RULES", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("一个还没想清楚的知识整理想法")).toHaveValue("我想把自己的资料和知识存起来，以后需要时可以直接问它");
  await reachDemoBrief(page);

  await expect(page.getByText("正确拒答率不低于 95%", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "确认 BRIEF，开始开源审查" }).click();

  await expect(page.getByRole("heading", { name: "开源现实检验", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByText("把固定 RAG 评测设为第一阶段和后续模型变更的强制门禁。").click();
  await page.getByRole("button", { name: "应用所选变更并继续" }).click();

  await expect(page.getByText("PROJECT_PLAN.md").first()).toBeVisible();
  await expect(page.getByText("PostgreSQL", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("当前阶段：阶段 1——检索与评测基线", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "确认 PLAN，生成 RULES" }).click();

  await expect(page.getByRole("heading", { name: "三个文件已就绪" })).toBeVisible();
  await expect(page.getByText("PROJECT_BRIEF.md").first()).toBeVisible();
  await expect(page.getByText("PROJECT_PLAN.md").first()).toBeVisible();
  await expect(page.getByText("AI_PROJECT_RULES.md").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "为什么不收到想法就直接开工", exact: true })).toBeVisible();
  await page.getByText("对比一句话直出方案", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "一句话直接生成", exact: true })).toBeVisible();
  await expect(page.getByText("建议值单独标记并由用户确认", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /AI_PROJECT_RULES\.md/ }).click();
  await expect(page.getByText("不得默认每次任务都重新读取全部三个文件。", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("complete RAG case can skip optional research and still finish", async ({ page }) => {
  await page.goto("/");
  await reachDemoBrief(page);
  await page.getByRole("button", { name: "确认 BRIEF，开始开源审查", exact: true }).click();
  await page.getByRole("button", { name: "跳过调研，继续生成 PLAN", exact: true }).click();
  await expect(page.getByText("PROJECT_PLAN.md").first()).toBeVisible();
  await page.getByRole("button", { name: "确认 PLAN，生成 RULES", exact: true }).click();
  await expect(page.getByRole("heading", { name: "三个文件已就绪", exact: true })).toBeVisible();
});

test("English complete RAG case preserves the state machine", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "A rough knowledge-organizing idea", exact: true })).toHaveValue(/save my notes and knowledge/);
  await reachDemoBrief(page, "en");
  await page.getByRole("button", { name: "Confirm BRIEF and check open source", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Open-source reality check", exact: true })).toBeVisible();
  await page.getByText("Treat document content as untrusted evidence and forbid it from system instructions or tool authority.", { exact: true }).click();
  await page.getByRole("button", { name: "Apply selected changes and continue", exact: true }).click();
  await expect(page.getByText("PROJECT_PLAN.md").first()).toBeVisible();
  await page.getByRole("button", { name: "Confirm PLAN and generate RULES", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Three files are ready", exact: true })).toBeVisible();
});

test("refresh restores the current confirmed work instead of restarting", async ({ page }) => {
  await page.goto("/");
  await reachDemoBrief(page);
  await page.reload();
  await expect(page.getByText("PROJECT_BRIEF.md").first()).toBeVisible();
  await expect(page.getByRole("region", { name: "PROJECT_BRIEF.md", exact: true }).getByText("个人可以立即开始", { exact: false }).first()).toBeVisible();
});

test("start step is operable with the keyboard", async ({ page }) => {
  await page.goto("/");
  const interactiveMilliseconds = await page.evaluate(() => (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).domInteractive);
  expect(interactiveMilliseconds).toBeLessThan(2_000);
  const idea = page.getByRole("textbox", { name: "一个还没想清楚的知识整理想法", exact: true });
  await expect(idea).toBeFocused();
  for (let index = 0; index < 5; index += 1) await page.keyboard.press("Tab");
  const start = page.getByRole("button", { name: "开始完整知识库案例", exact: true });
  await expect(start).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "先把想法说清一点", exact: true })).toBeVisible();
});

test("complete-case start page stays usable at required responsive breakpoints", async ({ page }) => {
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width <= 768 ? 900 : 900 });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "开始完整知识库案例", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});

test("back navigation restores the previous conversation and interfaces", async ({ page }) => {
  await page.goto("/");
  await reachDemoBrief(page);
  await page.getByRole("button", { name: "确认 BRIEF，开始开源审查", exact: true }).click();
  await page.getByText("把固定 RAG 评测设为第一阶段和后续模型变更的强制门禁。", { exact: true }).click();
  await page.getByRole("button", { name: "应用所选变更并继续", exact: true }).click();
  await page.getByRole("button", { name: "确认 PLAN，生成 RULES", exact: true }).click();
  await expect(page.getByRole("heading", { name: "三个文件已就绪", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "← 返回上一步", exact: true }).click();
  await expect(page.getByText("PROJECT_PLAN.md").first()).toBeVisible();
  await page.getByRole("button", { name: "← 返回上一步", exact: true }).click();
  await expect(page.getByRole("heading", { name: "开源现实检验", exact: true })).toBeVisible();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  await page.getByRole("button", { name: "← 返回上一步", exact: true }).click();
  await expect(page.getByText("PROJECT_BRIEF.md").first()).toBeVisible();
  await page.getByRole("button", { name: "← 返回上一步", exact: true }).click();
  await expect(page.getByRole("heading", { name: "先把想法说清一点", exact: true })).toBeVisible();
  await expect(page.getByLabel("或者用自己的话补充", { exact: true })).toHaveValue(/主要保存工作笔记/);
  await page.getByRole("button", { name: "← 返回上一步", exact: true }).click();
  await expect(page.getByLabel("一个还没想清楚的知识整理想法", { exact: true })).toHaveValue(/我想把自己的资料和知识存起来/);
});
