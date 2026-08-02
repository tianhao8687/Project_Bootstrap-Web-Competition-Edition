import { useState } from "react";
import type { Artifact, ChatMessage, Locale } from "../types/domain";
import { getCopy } from "../app/copy";
import { ArtifactPreview } from "../components/ArtifactPreview";

interface WorkspacePageProps {
  locale: Locale;
  artifact?: Artifact;
  messages: ChatMessage[];
  kind: "brief" | "plan";
  busy: boolean;
  onRevise: (content: string) => void;
  onContinue: () => void;
}

export function WorkspacePage({ locale, artifact, messages, kind, busy, onRevise, onContinue }: WorkspacePageProps) {
  const text = getCopy(locale);
  const loading = kind === "brief" ? text.loadingBrief : text.loadingPlan;
  return (
    <main className="workspace-page">
      <aside className="workspace-context">
        <p className="eyebrow">{text.workspace}</p>
        <h1>{kind === "brief" ? "PROJECT BRIEF" : "PROJECT PLAN"}</h1>
        <p>{text.draftReady}</p>
        <div className="conversation" aria-label={locale === "zh-CN" ? "会话摘要" : "Conversation summary"}>
          {messages.slice(-4).map((entry) => (
            <div key={entry.id} className={`message message-${entry.role}`}>
              <span>{entry.role === "user" ? (locale === "zh-CN" ? "你" : "You") : "Bootstrap"}</span>
              <p>{entry.text}</p>
            </div>
          ))}
        </div>
        <div className="boundary-note">
          <strong>{locale === "zh-CN" ? "确认门禁" : "Confirmation gate"}</strong>
          <p>{kind === "brief"
            ? (locale === "zh-CN" ? "未确认 BRIEF 前不会搜索 GitHub。" : "GitHub research cannot start before BRIEF confirmation.")
            : (locale === "zh-CN" ? "未确认 PLAN 前不会生成 RULES。" : "RULES cannot be generated before PLAN confirmation.")}</p>
        </div>
      </aside>
      <div className="workspace-artifact">
        {artifact ? <ArtifactPreview artifact={artifact} locale={locale} onEdit={onRevise} /> : <LoadingBlock text={loading} />}
        {artifact && (
          <div className="sticky-action">
            <span>{locale === "zh-CN" ? "只有点击确认，流程才会继续。" : "The workflow moves only after explicit confirmation."}</span>
            <button className="button button-primary" onClick={onContinue} disabled={busy}>
              {busy ? loading : kind === "brief" ? text.confirmBrief : text.confirmPlan}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export function ClarificationPage({ locale, messages, busy, onAnswer }: { locale: Locale; messages: ChatMessage[]; busy: boolean; onAnswer: (text: string) => void }) {
  const [answer, setAnswer] = useState("");
  const latest = [...messages].reverse().find((entry) => entry.role === "assistant");
  return (
    <main className="clarification-page">
      <section>
        <p className="eyebrow">{locale === "zh-CN" ? "仅询问真正阻塞的问题" : "Only questions that block execution"}</p>
        <h1>{locale === "zh-CN" ? "还需要一个关键事实" : "One key fact is still needed"}</h1>
        <div className="question-box">{latest?.text.split("\n").map((line) => line && <p key={line}>{line}</p>)}</div>
        <form onSubmit={(event) => { event.preventDefault(); if (answer.trim()) onAnswer(answer.trim()); }}>
          <label htmlFor="clarification-answer">{locale === "zh-CN" ? "你的回答" : "Your answer"}</label>
          <textarea id="clarification-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} />
          <button className="button button-primary" disabled={!answer.trim() || busy}>{busy ? getCopy(locale).loadingBrief : (locale === "zh-CN" ? "继续生成 BRIEF" : "Continue to BRIEF")}</button>
        </form>
      </section>
    </main>
  );
}

function LoadingBlock({ text }: { text: string }) {
  return (
    <div className="loading-block" role="status" aria-live="polite">
      <div className="loading-bars" aria-hidden="true"><i /><i /><i /></div>
      <h2>{text}</h2>
      <p>Schema validation · stage gate · recoverable state</p>
    </div>
  );
}
