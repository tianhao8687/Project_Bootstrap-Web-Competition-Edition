import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { buildArtifactsZip } from "../../src/lib/export";
import { demoBrief, demoPlan, demoRules } from "../../src/lib/demo";

describe("artifact export", () => {
  it("creates a ZIP with exactly the three formal Markdown files", async () => {
    const blob = await buildArtifactsZip([demoBrief("idea", "en"), demoPlan("idea", "en"), demoRules("en")]);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    expect(Object.keys(zip.files).sort()).toEqual(["AI_PROJECT_RULES.md", "PROJECT_BRIEF.md", "PROJECT_PLAN.md"]);
  });
});
