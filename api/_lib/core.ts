import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Locale } from "../../src/types/domain";
import { HttpError } from "./http";

export async function loadCore(locale: Locale, artifact: "brief" | "plan" | "rules"): Promise<string> {
  const directory = locale === "zh-CN" ? "zh-CN" : "en";
  const file = artifact === "brief" ? "PROJECT_BRIEF.md" : artifact === "plan" ? "PROJECT_PLAN.md" : "AI_PROJECT_RULES.md";
  try {
    const [skill, template] = await Promise.all([
      readFile(resolve(process.cwd(), "src", "core", "generated", directory, "SKILL.md"), "utf8"),
      readFile(resolve(process.cwd(), "src", "core", "generated", directory, "templates", file), "utf8"),
    ]);
    const sectionPrefixes = locale === "zh-CN"
      ? {
          brief: ["Project Bootstrap", "一、最高原则", "二、启动方式", "三、总流程", "四、阶段 1"],
          plan: ["Project Bootstrap", "一、最高原则", "五、阶段 2", "六、项目复杂度路由器", "七、路线图拆分规则", "八、PROJECT_PLAN"],
          rules: ["Project Bootstrap", "一、最高原则", "九、阶段 3", "十、AI_PROJECT_RULES", "十一、可验证规则", "十二、AI 自由度", "十三、正式文件长度预算", "十四、局部修改规则", "十五、最终输出"],
        }
      : {
          brief: ["Project Bootstrap", "1. Highest Principles", "2. How to Start", "3. Overall Workflow", "4. Stage 1"],
          plan: ["Project Bootstrap", "1. Highest Principles", "5. Stage 2", "6. Project Complexity Router", "7. Roadmap Splitting Rules", "8. PROJECT_PLAN"],
          rules: ["Project Bootstrap", "1. Highest Principles", "9. Stage 3", "10. Suggested AI_PROJECT_RULES", "11. Verifiable Rules", "12. AI Freedom", "13. Formal File Length Budgets", "14. Local Change Rules", "15. Final Output"],
        };
    const scopedSkill = extractTopLevelSections(skill, sectionPrefixes[artifact]);
    if (!scopedSkill.trim()) throw new Error("No phase sections were selected.");
    return `PHASE-SCOPED CORE RULES\n${scopedSkill}\n\nARTIFACT TEMPLATE\n${template}`;
  } catch {
    throw new HttpError(500, "UPSTREAM_RULES_MISSING", "The pinned core snapshot is missing from the deployment.");
  }
}

function extractTopLevelSections(markdown: string, prefixes: string[]): string {
  const lines = markdown.split(/\r?\n/);
  const sections: Array<{ heading: string; lines: string[] }> = [];
  let current: { heading: string; lines: string[] } | undefined;
  for (const line of lines) {
    if (/^#\s+/.test(line)) {
      current = { heading: line.replace(/^#\s+/, "").trim(), lines: [line] };
      sections.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }
  return sections
    .filter((section) => prefixes.some((prefix) => section.heading.startsWith(prefix)))
    .map((section) => section.lines.join("\n").trim())
    .join("\n\n");
}
