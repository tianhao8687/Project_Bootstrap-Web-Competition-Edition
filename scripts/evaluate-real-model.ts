import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import bootstrapHandler from "../api/bootstrap";
import researchHandler from "../api/research";
import { ArtifactSchema, ResearchResultSchema, type Artifact, type ResearchResult } from "../src/types/domain";

type Case = { id: string; complexity: "simple" | "medium" | "complex"; idea: string };
type HandlerResult = { status: number; body: any };

const root = resolve(import.meta.dirname, "..");
await loadLocalEnv(resolve(root, ".env.local"));

const cases = JSON.parse(await readFile(resolve(root, "docs", "evaluation-cases.json"), "utf8")) as Case[];
const selectedId = valueAfter("--case");
const runAll = process.argv.includes("--all");
if (!selectedId && !runAll) throw new Error("Choose one case with --case S1, or use --all with EVALUATION_ACK_COSTS=YES.");
if (runAll && process.env.EVALUATION_ACK_COSTS !== "YES") throw new Error("Batch evaluation makes many model and GitHub calls. Set EVALUATION_ACK_COSTS=YES to acknowledge cost and rate-limit impact.");

for (const key of ["LLM_BASE_URL", "LLM_API_KEY", "LLM_MODEL"]) {
  if (!process.env[key]) throw new Error(`${key} is required. Configure it in the local environment or ignored .env.local file.`);
}

const selected = runAll ? cases : cases.filter((item) => item.id === selectedId);
if (!selected.length) throw new Error(`Unknown evaluation case: ${selectedId}`);

const startedAt = new Date().toISOString();
const results = [];
for (const evaluationCase of selected) {
  console.log(`[${evaluationCase.id}] baseline`);
  const baseline = await baselineCompletion(evaluationCase.idea);
  console.log(`[${evaluationCase.id}] Project Bootstrap Web`);
  const web = await runWebFlow(evaluationCase);
  results.push({
    ...evaluationCase,
    baseline: { output: baseline, summary: summarizeText(baseline) },
    web,
    humanReview: {
      irrelevantQuestions: null,
      mvpExpansion: null,
      unsupportedFacts: null,
      inferenceAsFact: null,
      briefPlanConflict: null,
      unconfirmedWriteback: null,
      localRevisionLeakage: null,
      missingFailureDisclosure: null,
      notes: "Pending human review. Use 0=failure, 1=mixed, 2=acceptable.",
    },
  });
}

const finishedAt = new Date().toISOString();
const outputDirectory = resolve(root, "docs", "evaluation-runs");
await mkdir(outputDirectory, { recursive: true });
const stamp = startedAt.replace(/[:.]/g, "-");
const outputPath = resolve(outputDirectory, `${stamp}.json`);
await writeFile(outputPath, JSON.stringify({
  provider: new URL(process.env.LLM_BASE_URL!).origin,
  model: process.env.LLM_MODEL,
  startedAt,
  finishedAt,
  githubAuthenticated: Boolean(process.env.GITHUB_TOKEN),
  cases: results,
}, null, 2) + "\n", "utf8");
console.log(`Saved ${results.length} case(s) to ${outputPath}. Human review is still required.`);

async function runWebFlow(evaluationCase: Case) {
  const baseSession = { idea: evaluationCase.idea, messages: [], acceptedResearchChanges: [], warningShown: false };
  const briefResponse = await callHandler(bootstrapHandler, { locale: "en", action: "draft_brief", session: baseSession });
  if (briefResponse.status !== 200 || !briefResponse.body.artifact) {
    return { status: briefResponse.body.status ?? "brief_failed", blockingQuestions: briefResponse.body.blockingQuestions, error: briefResponse.body };
  }
  const brief = ArtifactSchema.parse({ ...briefResponse.body.artifact, confirmed: true });

  const researchResponse = await callHandler(researchHandler, { locale: "en", brief: brief.content, maxRepositories: 5 });
  const research = researchResponse.status === 200 ? ResearchResultSchema.parse(researchResponse.body) : undefined;
  const researchError = researchResponse.status === 200 ? undefined : researchResponse.body;

  const planResponse = await callHandler(bootstrapHandler, {
    locale: "en", action: "draft_plan",
    session: { ...baseSession, brief, research, acceptedResearchChanges: [] },
  });
  if (planResponse.status !== 200 || !planResponse.body.artifact) {
    return { status: "plan_failed", brief, research, researchError, error: planResponse.body };
  }
  const plan = ArtifactSchema.parse({ ...planResponse.body.artifact, confirmed: true });
  const rulesResponse = await callHandler(bootstrapHandler, {
    locale: "en", action: "generate_rules",
    session: { ...baseSession, brief, research, acceptedResearchChanges: [], plan },
  });
  if (rulesResponse.status !== 200 || !rulesResponse.body.artifact) {
    return { status: "rules_failed", brief, research, researchError, plan, error: rulesResponse.body };
  }
  const rules = ArtifactSchema.parse({ ...rulesResponse.body.artifact, confirmed: true });
  return {
    status: "completed",
    brief,
    research,
    researchError,
    plan,
    rules,
    summary: {
      blockingQuestionCount: briefResponse.body.blockingQuestions?.length ?? 0,
      repositoryCount: research?.repositories.length ?? 0,
      researchVerdict: research?.assessment.verdict,
      acceptedResearchChangeCount: 0,
      artifactCharacters: { brief: brief.content.length, plan: plan.content.length, rules: rules.content.length },
    },
  };
}

async function baselineCompletion(idea: string): Promise<string> {
  const baseUrl = process.env.LLM_BASE_URL!.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.LLM_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.LLM_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are a helpful software planner." },
        { role: "user", content: `Plan this software project from the following one-sentence idea:\n\n${idea}` },
      ],
    }),
    signal: AbortSignal.timeout(Number(process.env.APP_REQUEST_TIMEOUT_MS ?? 30_000)),
  });
  if (!response.ok) throw new Error(`Baseline provider request failed with ${response.status}.`);
  const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error("Baseline provider response did not include text content.");
  return content;
}

async function callHandler(handler: (request: any, response: any) => Promise<void>, body: unknown): Promise<HandlerResult> {
  const state: HandlerResult = { status: 0, body: undefined };
  const response = {
    status(code: number) { state.status = code; return response; },
    json(value: unknown) { state.body = value; return response; },
  };
  await handler({ method: "POST", body }, response);
  return state;
}

function summarizeText(text: string) {
  return { characters: text.length, headings: (text.match(/^#{1,3}\s+/gm) ?? []).length, mentionsNonGoals: /non-goal|out of scope|不做/i.test(text) };
}

function valueAfter(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function loadLocalEnv(path: string) {
  if (!existsSync(path)) return;
  for (const rawLine of (await readFile(path, "utf8")).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^(["'])(.*)\1$/, "$2");
    if (!process.env[key]) process.env[key] = value;
  }
}
