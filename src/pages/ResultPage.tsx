import { useState } from "react";
import type { Artifact, ArtifactName, Locale } from "../types/domain";
import { getCopy } from "../app/copy";
import { ArtifactPreview } from "../components/ArtifactPreview";
import { downloadArtifact, downloadArtifactsZip } from "../lib/export";

export function ResultPage({ locale, artifacts, onEdit }: { locale: Locale; artifacts: Artifact[]; onEdit: (name: ArtifactName) => void }) {
  const text = getCopy(locale);
  const [active, setActive] = useState(artifacts[0]?.name ?? "PROJECT_BRIEF.md");
  const [copied, setCopied] = useState<string>();
  const artifact = artifacts.find((item) => item.name === active) ?? artifacts[0];

  const copyArtifact = async (item: Artifact) => {
    await navigator.clipboard.writeText(item.content);
    setCopied(item.name);
    setTimeout(() => setCopied(undefined), 1400);
  };

  if (!artifact) return null;
  return (
    <main className="result-page">
      <header className="result-header">
        <div><p className="eyebrow">Planning complete</p><h1>{text.resultTitle}</h1><p>{text.resultLead}</p></div>
        <button className="button button-primary" onClick={() => void downloadArtifactsZip(artifacts)}>{text.downloadZip}</button>
      </header>
      <section className="result-layout">
        <aside className="file-list">
          {artifacts.map((item, index) => (
            <button key={item.name} className={active === item.name ? "is-active" : ""} onClick={() => setActive(item.name)}>
              <span>0{index + 1}</span><strong>{item.name}</strong><small>{text.confirmed} · v{item.revision}</small>
            </button>
          ))}
          <div className="file-actions">
            <button className="button button-secondary" onClick={() => void copyArtifact(artifact)}>{copied === artifact.name ? text.copied : text.copy}</button>
            <button className="button button-secondary" onClick={() => downloadArtifact(artifact)}>{text.download}</button>
          </div>
          {artifact.name !== "AI_PROJECT_RULES.md" && <button className="text-button" onClick={() => onEdit(artifact.name)}>{artifact.name === "PROJECT_BRIEF.md" ? text.editBrief : text.editPlan}</button>}
        </aside>
        <ArtifactPreview artifact={artifact} locale={locale} />
      </section>
    </main>
  );
}
