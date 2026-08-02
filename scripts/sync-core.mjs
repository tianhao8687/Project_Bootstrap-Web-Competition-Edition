import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const source = resolve(process.argv[2] ?? resolve(root, "..", "project-bootstrap"));
const manifestPath = resolve(root, "core-source.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const destination = resolve(root, "src", "core", "generated");

const commit = execFileSync("git", ["-c", `safe.directory=${source}`, "-C", source, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (!/^[0-9a-f]{40}$/.test(commit)) throw new Error("Could not read a full upstream commit SHA.");

await rm(destination, { recursive: true, force: true });
for (const file of manifest.files) {
  const to = resolve(destination, file);
  await mkdir(dirname(to), { recursive: true });
  const content = execFileSync(
    "git",
    ["-c", `safe.directory=${source}`, "-C", source, "show", `${commit}:${file}`],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  ).replace(/\r\n?/g, "\n");
  await writeFile(to, content, "utf8");
}

manifest.commit = commit;
manifest.syncedAt = new Date().toISOString();
manifest.hashes = {};
for (const file of manifest.files) {
  const content = await readFile(resolve(destination, file));
  manifest.hashes[file] = createHash("sha256").update(content).digest("hex");
}

await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`Synced ${manifest.files.length} files from ${commit}.`);
