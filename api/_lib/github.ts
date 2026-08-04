import { z } from "zod";
import { HttpError } from "./http";

const SearchItemSchema = z.object({
  full_name: z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/),
  html_url: z.string().url().refine((value) => new URL(value).hostname === "github.com", "Repository URL must use github.com"),
  description: z.string().nullable(),
  topics: z.array(z.string()).default([]), updated_at: z.string(), archived: z.boolean(),
  stargazers_count: z.number(), forks_count: z.number(), default_branch: z.string(),
});
const SearchSchema = z.object({ items: z.array(SearchItemSchema) });

const RootContentsSchema = z.array(z.object({
  name: z.string(),
  path: z.string(),
  type: z.string(),
}));

export type ManifestEvidence = { path: string; content: string; truncated: boolean };
export type Candidate = z.infer<typeof SearchItemSchema> & {
  readme: string;
  readmeTruncated: boolean;
  licenseSpdx?: string;
  manifests: ManifestEvidence[];
};

const manifestPriority = [
  "package.json", "pyproject.toml", "cargo.toml", "go.mod", "pom.xml",
  "build.gradle", "build.gradle.kts", "requirements.txt", "composer.json",
  "gemfile", "mix.exs",
];

function headers(accept = "application/vnd.github+json") {
  return {
    accept,
    "user-agent": "project-bootstrap-web/0.1",
    "x-github-api-version": "2022-11-28",
    ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  };
}

async function githubFetch(url: string, accept?: string): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: headers(accept),
        signal: AbortSignal.timeout(Number(process.env.APP_REQUEST_TIMEOUT_MS ?? 30_000)),
      });
      if (response.status >= 500 && attempt === 0) {
        await response.body?.cancel().catch(() => undefined);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt === 1 || (error instanceof Error && ["AbortError", "TimeoutError"].includes(error.name))) throw error;
    }
  }
  throw lastError;
}

async function githubJson(url: string, allowNotFound = false): Promise<unknown> {
  const response = await githubFetch(url);
  if (response.status === 404 && allowNotFound) return undefined;
  if (response.status === 403 || response.status === 429) throw new HttpError(429, "GITHUB_RATE_LIMIT", "GitHub rate limit reached. You can skip research without losing the confirmed BRIEF.");
  if (!response.ok) throw new HttpError(502, "NO_RELEVANT_REPOSITORIES", `GitHub returned ${response.status}.`);
  const raw = await response.text();
  if (raw.length > 256_000) throw new HttpError(502, "NO_RELEVANT_REPOSITORIES", "GitHub returned an unexpectedly large JSON response.");
  try { return JSON.parse(raw); } catch { throw new HttpError(502, "NO_RELEVANT_REPOSITORIES", "GitHub returned invalid JSON."); }
}

async function readText(url: string, maximumBytes = 48_000): Promise<{ text: string; truncated: boolean }> {
  const response = await githubFetch(url, "application/vnd.github.raw+json");
  if (response.status === 404) return { text: "", truncated: false };
  if (response.status === 403 || response.status === 429) throw new HttpError(429, "GITHUB_RATE_LIMIT", "GitHub rate limit reached while reading repository evidence.");
  if (!response.ok) return { text: "", truncated: false };
  const reader = response.body?.getReader();
  if (!reader) return { text: "", truncated: false };
  const chunks: Uint8Array[] = [];
  let size = 0;
  let done = false;
  while (size < maximumBytes) {
    const result = await reader.read();
    done = result.done;
    const value = result.value;
    if (done || !value) break;
    chunks.push(value); size += value.length;
  }
  await reader.cancel().catch(() => undefined);
  return {
    text: new TextDecoder().decode(Buffer.concat(chunks).subarray(0, maximumBytes)),
    truncated: !done && size >= maximumBytes,
  };
}

async function readManifests(fullName: string, defaultBranch: string): Promise<ManifestEvidence[]> {
  const root = RootContentsSchema.safeParse(await githubJson(
    `https://api.github.com/repos/${fullName}/contents?ref=${encodeURIComponent(defaultBranch)}`,
    true,
  ));
  if (!root.success) return [];
  const byName = new Map(root.data.filter((item) => item.type === "file").map((item) => [item.name.toLowerCase(), item]));
  const selected = manifestPriority.flatMap((name) => byName.get(name) ?? []).slice(0, 2);
  return Promise.all(selected.map(async (item) => {
    const result = await readText(
      `https://api.github.com/repos/${fullName}/contents/${encodeURIComponent(item.path)}?ref=${encodeURIComponent(defaultBranch)}`,
      16_000,
    );
    return { path: item.path, content: result.text, truncated: result.truncated };
  }));
}

export async function searchCandidates(queries: string[], maximum: number): Promise<Candidate[]> {
  const pool = new Map<string, z.infer<typeof SearchItemSchema>>();
  for (const query of queries) {
    const value = SearchSchema.parse(await githubJson(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=4`));
    for (const item of value.items) {
      if (pool.size >= 12) break;
      if (!item.archived) pool.set(item.full_name, item);
    }
    if (pool.size >= 12) break;
  }
  const terms = new Set(queries.join(" ").toLowerCase().split(/\W+/).filter((term) => term.length > 2));
  const ranked = [...pool.values()].map((item) => {
    const haystack = `${item.full_name} ${item.description ?? ""} ${item.topics.join(" ")}`.toLowerCase();
    const matches = [...terms].filter((term) => haystack.includes(term)).length;
    return { item, score: matches * 10 + (item.description ? 4 : 0) + item.topics.length + Math.min(3, Math.log10(item.stargazers_count + 1)) };
  }).sort((a, b) => b.score - a.score).slice(0, maximum);
  const candidates = await Promise.all(ranked.map(async ({ item }) => {
    const [readmeResult, license, manifests] = await Promise.all([
      readText(`https://api.github.com/repos/${item.full_name}/readme`),
      githubJson(`https://api.github.com/repos/${item.full_name}/license`, true),
      readManifests(item.full_name, item.default_branch),
    ]);
    const spdx = z.object({ license: z.object({ spdx_id: z.string().nullable() }) }).safeParse(license);
    return { ...item, readme: readmeResult.text, readmeTruncated: readmeResult.truncated, manifests, licenseSpdx: spdx.success ? (spdx.data.license.spdx_id ?? undefined) : undefined };
  }));
  return candidates.filter((candidate) => candidate.readme || candidate.description);
}
