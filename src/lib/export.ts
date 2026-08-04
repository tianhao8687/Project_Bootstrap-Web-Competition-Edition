import type { Artifact } from "../types/domain";

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadArtifact(artifact: Artifact): void {
  downloadBlob(new Blob([artifact.content], { type: "text/markdown;charset=utf-8" }), artifact.name);
}

export async function buildArtifactsZip(artifacts: Artifact[]): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const artifact of artifacts) zip.file(artifact.name, artifact.content);
  return zip.generateAsync({ type: "blob" });
}

export async function downloadArtifactsZip(artifacts: Artifact[]): Promise<void> {
  downloadBlob(await buildArtifactsZip(artifacts), "project-bootstrap-files.zip");
}
