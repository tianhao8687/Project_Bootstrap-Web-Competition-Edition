import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { createServer } from "vite";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "docs", "screenshots");
await mkdir(output, { recursive: true });

const server = await createServer({
  root,
  server: { host: "127.0.0.1", port: 4173, strictPort: true },
  logLevel: "error",
});

let browser;
try {
  await server.listen();
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/");
  await page.screenshot({ path: resolve(output, "01-start-desktop.png"), fullPage: true });

  await page.getByRole("textbox", { name: "你想做什么？", exact: true }).fill("为自由设计师检查客户交付物是否齐全，并在发送前提示遗漏");
  await page.getByRole("button", { name: "开始定义项目", exact: true }).click();
  await page.getByRole("button", { name: "确认 BRIEF，开始开源审查", exact: true }).waitFor();
  await page.screenshot({ path: resolve(output, "02-brief-desktop.png"), fullPage: true });

  await page.getByRole("button", { name: "确认 BRIEF，开始开源审查", exact: true }).click();
  await page.getByRole("heading", { name: "开源现实检验", exact: true }).waitFor();
  await page.screenshot({ path: resolve(output, "03-research-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: resolve(output, "04-research-mobile.png"), fullPage: true });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByText("把 MVP 收缩到一条可演示主流程。", { exact: true }).click();
  await page.getByRole("button", { name: "应用所选变更并继续", exact: true }).click();
  await page.getByRole("button", { name: "确认 PLAN，生成 RULES", exact: true }).waitFor();
  await page.getByRole("button", { name: "确认 PLAN，生成 RULES", exact: true }).click();
  await page.getByRole("heading", { name: "三个文件已就绪", exact: true }).waitFor();
  await page.screenshot({ path: resolve(output, "05-result-desktop.png"), fullPage: true });
  await context.close();
} finally {
  await browser?.close();
  await server.close();
}

console.log(`Captured competition screenshots in ${output}.`);
