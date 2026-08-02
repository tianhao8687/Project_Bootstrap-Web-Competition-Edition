import { useMemo, useState } from "react";
import type { Evidence, EvidenceBackedPoint, Locale, ResearchChange, ResearchResult } from "../types/domain";
import { getCopy, verdictLabel } from "../app/copy";

interface ResearchPageProps {
  locale: Locale;
  research: ResearchResult;
  busy: boolean;
  onApply: (changes: ResearchChange[]) => void;
  onSkip: () => void;
}

export function ResearchPage({ locale, research, busy, onApply, onSkip }: ResearchPageProps) {
  const text = getCopy(locale);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selected = useMemo(() => research.assessment.recommendedChanges.filter((change) => selectedIds.includes(change.id)), [research, selectedIds]);

  const toggle = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return (
    <main className="research-page">
      <header className="research-header">
        <div>
          <p className="eyebrow">Evidence before opinion</p>
          <h1>{text.researchTitle}</h1>
          <p>{text.researchLead}</p>
        </div>
        <span className={`verdict verdict-${research.assessment.verdict}`}>{verdictLabel(locale, research.assessment.verdict)}</span>
      </header>

      <section className="verdict-panel">
        <h2>{research.assessment.verdictReason}</h2>
        <div className="limitations"><strong>{text.limitations}</strong>{research.limitations.map((item) => <p key={item}>{item}</p>)}</div>
      </section>

      <section className="balance-grid">
        <AssessmentColumn title={text.advantages} tone="positive" points={research.assessment.advantages} evidenceLabel={text.evidence} />
        <AssessmentColumn title={text.weaknesses} tone="warning" points={research.assessment.weaknesses} evidenceLabel={text.evidence} />
        <AssessmentColumn title={text.reusableIdeas} tone="neutral" points={research.assessment.reusableIdeas} evidenceLabel={text.evidence} />
        <AssessmentColumn title={text.differentiation} tone="focus" points={research.assessment.differentiation} evidenceLabel={text.evidence} />
      </section>

      <section className="repository-section">
        <div className="section-heading"><h2>{text.repositories}</h2><span>{research.repositories.length} / 5</span></div>
        <p className="license-caveat">{text.licenseCaveat}</p>
        <div className="repository-list">
          {research.repositories.map((repository) => (
            <article className="repository-card" key={repository.fullName}>
              <header>
                <div><a href={repository.url} target="_blank" rel="noreferrer">{repository.fullName}</a><span className={`relevance relevance-${repository.relevance}`}>{repository.relevance}</span></div>
                <span className={`license license-${repository.license.status}`}>{repository.license.spdx ?? text.licenseMissing}</span>
              </header>
              <p>{repository.summary}</p>
              <div className="repository-columns">
                <MiniList title={text.confirmedCapabilities} items={repository.confirmedCapabilities} />
                <MiniList title={text.useful} items={repository.usefulReferences} />
                <MiniList title={text.avoid} items={repository.avoidCopying} />
                <MiniList title={text.difference} items={repository.differences} />
              </div>
              <details>
                <summary>{text.evidence} · {repository.evidence.length}</summary>
                <EvidenceList evidence={repository.evidence} />
              </details>
            </article>
          ))}
        </div>
      </section>

      <section className="changes-panel">
        <div className="section-heading"><h2>{text.suggestedChanges}</h2><span>{selected.length} selected</span></div>
        <div className="change-options">
          {research.assessment.recommendedChanges.map((change) => (
            <label key={change.id} className={selectedIds.includes(change.id) ? "is-selected" : ""}>
              <input type="checkbox" checked={selectedIds.includes(change.id)} onChange={() => toggle(change.id)} />
              <span><strong>{change.summary}</strong><small>{change.rationale}</small></span>
              <em>{text.affects}: {change.target}</em>
            </label>
          ))}
        </div>
        <div className="change-summary">
          <strong>{text.selectedSummary}</strong>
          {selected.length ? <ul>{selected.map((change) => <li key={change.id}>{change.summary} → {change.target}</li>)}</ul> : <p>{text.noSelection}</p>}
        </div>
        <div className="button-row research-actions">
          <button className="button button-secondary" onClick={onSkip} disabled={busy}>{text.skip}</button>
          <button className="button button-primary" onClick={() => onApply(selected)} disabled={busy}>{text.applyContinue}</button>
        </div>
      </section>
    </main>
  );
}

function AssessmentColumn({ title, tone, points, evidenceLabel }: { title: string; tone: string; points: EvidenceBackedPoint[]; evidenceLabel: string }) {
  return (
    <article className={`assessment-card ${tone}`}>
      <h2>{title}</h2>
      <ul>{points.map((point) => (
        <li className="assessment-point" key={point.text}>
          <p>{point.text}</p>
          <details>
            <summary>{evidenceLabel} · {point.evidence.length}</summary>
            <EvidenceList evidence={point.evidence} />
          </details>
        </li>
      ))}</ul>
    </article>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return <div><strong>{title}</strong><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}

function EvidenceList({ evidence }: { evidence: Evidence[] }) {
  return (
    <ul className="evidence-list">
      {evidence.map((item, index) => <li key={`${item.source}-${index}`}><span>{item.kind.replaceAll("_", " ")}</span><strong>{item.source}</strong><p>{item.summary}</p></li>)}
    </ul>
  );
}
