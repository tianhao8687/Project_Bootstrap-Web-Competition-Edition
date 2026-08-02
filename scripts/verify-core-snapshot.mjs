import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(await readFile(resolve(root, "core-source.json"), "utf8"));
if (!/^[0-9a-f]{40}$/.test(manifest.commit)) throw new Error("core-source.json must pin a full commit SHA.");
if (!manifest.hashes) throw new Error("Run pnpm sync-core before verification: hashes are missing.");

const failures = [];
for (const file of manifest.files) {
  try {
    const content = (await readFile(resolve(root, "src", "core", "generated", file), "utf8")).replace(/\r\n?/g, "\n");
    const actual = createHash("sha256").update(content).digest("hex");
    if (actual !== manifest.hashes[file]) failures.push(`${file}: hash mismatch`);
  } catch (error) {
    failures.push(`${file}: ${error instanceof Error ? error.message : "missing"}`);
  }
}

if (failures.length) throw new Error(`Core snapshot verification failed:\n${failures.join("\n")}`);
console.log(`Core snapshot verified: ${manifest.files.length} files at ${manifest.commit}.`);
