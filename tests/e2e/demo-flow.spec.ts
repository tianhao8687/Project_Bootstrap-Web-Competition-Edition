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

test("demo mode completes the three-file pipeline", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("描述你的项目想法").fill("为自由设计师检查客户交付物是否齐全，并在发送前提示遗漏");
  await page.getByRole("button", { name: "开始梳理项目" }).click();

  await expect(page.getByText("PROJECT_BRIEF.md").first()).toBeVisible();
  await page.getByRole("button", { name: "确认 BRIEF，开始开源审查" }).click();

  await expect(page.getByRole("heading", { name: "开源现实检验", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByText("把 MVP 收缩到一条可演示主流程。").click();
  await page.getByRole("button", { name: "应用所选变更并继续" }).click();

  await expect(page.getByText("PROJECT_PLAN.md").first()).toBeVisible();
  await page.getByRole("button", { name: "确认 PLAN，生成 RULES" }).click();

  await expect(page.getByRole("heading", { name: "三个文件已就绪" })).toBeVisible();
  await expect(page.getByText("PROJECT_BRIEF.md").first()).toBeVisible();
  await expect(page.getByText("PROJECT_PLAN.md").first()).toBeVisible();
  await expect(page.getByText("AI_PROJECT_RULES.md").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("simple local tool can skip optional research and still finish", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "描述你的项目想法", exact: true }).fill("做一个本地图片批量重命名工具，只处理一个文件夹");
  await page.getByRole("button", { name: "开始梳理项目", exact: true }).click();
  await expect(page.getByText("PROJECT_BRIEF.md").first()).toBeVisible();
  await page.getByRole("button", { name: "确认 BRIEF，开始开源审查", exact: true }).click();
  await page.getByRole("button", { name: "跳过调研，继续生成 PLAN", exact: true }).click();
  await expect(page.getByText("PROJECT_PLAN.md").first()).toBeVisible();
  await page.getByRole("button", { name: "确认 PLAN，生成 RULES", exact: true }).click();
  await expect(page.getByRole("heading", { name: "三个文件已就绪", exact: true })).toBeVisible();
});

test("English flow handles a mature adjacent product without changing the state machine", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("textbox", { name: "Describe your project idea", exact: true }).fill("Build a lightweight spec-driven planning tool for non-technical founders before they start AI coding.");
  await page.getByRole("button", { name: "Shape the project", exact: true }).click();
  await expect(page.getByText("PROJECT_BRIEF.md").first()).toBeVisible();
  await page.getByRole("button", { name: "Confirm BRIEF and check open source", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Open-source reality check", exact: true })).toBeVisible();
  await page.getByText("Forbid reuse of external code when the license is unclear.", { exact: true }).click();
  await page.getByRole("button", { name: "Apply selected changes and continue", exact: true }).click();
  await expect(page.getByText("PROJECT_PLAN.md").first()).toBeVisible();
  await page.getByRole("button", { name: "Confirm PLAN and generate RULES", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Three files are ready", exact: true })).toBeVisible();
});

test("refresh restores the current confirmed work instead of restarting", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "描述你的项目想法", exact: true }).fill("把散落的访谈记录整理成可检索的产品洞察");
  await page.getByRole("button", { name: "开始梳理项目", exact: true }).click();
  await expect(page.getByText("PROJECT_BRIEF.md").first()).toBeVisible();
  await page.reload();
  await expect(page.getByText("PROJECT_BRIEF.md").first()).toBeVisible();
  await expect(page.getByRole("region", { name: "PROJECT_BRIEF.md", exact: true }).getByText("把散落的访谈记录整理成可检索的产品洞察", { exact: true })).toBeVisible();
});

test("start step is operable with the keyboard", async ({ page }) => {
  await page.goto("/");
  const interactiveMilliseconds = await page.evaluate(() => (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).domInteractive);
  expect(interactiveMilliseconds).toBeLessThan(2_000);
  const idea = page.getByRole("textbox", { name: "描述你的项目想法", exact: true });
  await expect(idea).toBeFocused();
  await idea.fill("为独立咖啡店做一个范围克制的员工排班工具");
  for (let index = 0; index < 8; index += 1) await page.keyboard.press("Tab");
  const start = page.getByRole("button", { name: "开始梳理项目", exact: true });
  await expect(start).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("PROJECT_BRIEF.md").first()).toBeVisible();
});
