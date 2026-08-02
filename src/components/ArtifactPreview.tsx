import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import type { Artifact, Locale } from "../types/domain";
import { getCopy } from "../app/copy";

interface ArtifactPreviewProps {
  artifact: Artifact;
  locale: Locale;
  onEdit?: (content: string) => void;
}

export function ArtifactPreview({ artifact, locale, onEdit }: ArtifactPreviewProps) {
  const text = getCopy(locale);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(artifact.content);

  const save = () => {
    onEdit?.(draft);
    setEditing(false);
  };

  return (
    <section className="artifact-panel" aria-label={artifact.name}>
      <header className="artifact-toolbar">
        <div>
          <span className="file-name">{artifact.name}</span>
          <span className={`status-chip ${artifact.confirmed ? "is-confirmed" : ""}`}>
            {artifact.confirmed ? text.confirmed : text.draft} · {text.revision} {artifact.revision}
          </span>
        </div>
        {onEdit && !editing && <button className="button button-quiet" onClick={() => setEditing(true)}>{text.revise}</button>}
      </header>
      {editing ? (
        <div className="artifact-editor">
          <label htmlFor="artifact-content">Markdown</label>
          <textarea id="artifact-content" value={draft} onChange={(event) => setDraft(event.target.value)} />
          <div className="button-row">
            <button className="button button-secondary" onClick={() => setEditing(false)}>{text.cancel}</button>
            <button className="button button-primary" onClick={save} disabled={draft.trim().length < 40}>{text.saveRevision}</button>
          </div>
        </div>
      ) : (
        <article className="markdown-body">
          <ReactMarkdown rehypePlugins={[rehypeSanitize]} skipHtml>{artifact.content}</ReactMarkdown>
        </article>
      )}
    </section>
  );
}
