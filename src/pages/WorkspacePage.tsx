import { useState } from "react";
import type { Artifact, ChatMessage, Locale } from "../types/domain";
import type { ClarificationOption } from "../lib/demo";
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

interface ClarificationPageProps {
  locale: Locale;
  messages: ChatMessage[];
  busy: boolean;
  quickReplies?: ClarificationOption[];
  onAnswer: (text: string) => void;
}

export function ClarificationPage({ locale, messages, busy, quickReplies, onAnswer }: ClarificationPageProps) {
  const previousAnswer = messages.filter((entry) => entry.role === "user")[1]?.text ?? "";
  const [answer, setAnswer] = useState(previousAnswer);
  const latest = messages.find((entry) => entry.role === "assistant");
  const originalIdea = messages.find((entry) => entry.role === "user");
  const unsureReply = locale === "zh-CN"
    ? "我不确定。请按最安全、最小可行且容易修改的方案推荐，并明确标记假设。"
    : "I am not sure. Recommend the safest, smallest option that is easy to revise, and label every assumption.";
  const replies = quickReplies ?? [{ label: locale === "zh-CN" ? "我不确定 请帮我推荐" : "I am unsure — recommend safely", value: unsureReply, recommended: true }];
  return (
    <main className="clarification-page">
      <section>
        <div className="clarification-heading">
          <div>
            <p className="eyebrow">{locale === "zh-CN" ? "只进行这一轮澄清" : "One clarification round only"}</p>
            <h1>{locale === "zh-CN" ? "先把想法说清一点" : "Clarify the idea a little"}</h1>
          </div>
          <span>{locale === "zh-CN" ? "1 轮" : "1 round"}</span>
        </div>
        {originalIdea && (
          <div className="idea-echo">
            <span>{locale === "zh-CN" ? "你的原始想法" : "Your original idea"}</span>
            <p>{originalIdea.text}</p>
          </div>
        )}
        <div className="question-box" aria-live="polite">{latest?.text.split("\n").map((line) => line && <p key={line}>{line}</p>)}</div>
        <form onSubmit={(event) => { event.preventDefault(); if (answer.trim()) onAnswer(answer.trim()); }}>
          <fieldset className="quick-replies">
            <legend>{locale === "zh-CN" ? "直接选择最接近的情况" : "Choose the closest answer"}</legend>
            {replies.map((reply) => (
              <button
                className={answer === reply.value ? "is-selected" : ""}
                type="button"
                key={reply.label}
                aria-pressed={answer === reply.value}
                onClick={() => setAnswer(reply.value)}
              >
                <span>{reply.label}</span>
                {reply.recommended && <small>{locale === "zh-CN" ? "推荐" : "Recommended"}</small>}
              </button>
            ))}
          </fieldset>
          <div className="custom-answer">
            <label htmlFor="clarification-answer">{locale === "zh-CN" ? "或者用自己的话补充" : "Or answer in your own words"}</label>
            <textarea id="clarification-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={locale === "zh-CN" ? "不需要懂技术 说清资料和使用方式即可" : "No technical terms needed — describe the material and how you will use it"} />
          </div>
          <p className="clarification-safety">{locale === "zh-CN" ? "回答后直接生成 BRIEF 不会继续追问 非关键未知项会标记为待确认" : "The BRIEF is generated after this answer. Non-blocking unknowns are marked pending instead of triggering more questions."}</p>
          <button className="button button-primary button-large" disabled={!answer.trim() || busy}>{busy ? getCopy(locale).loadingBrief : (locale === "zh-CN" ? "确认理解并生成 BRIEF" : "Confirm understanding and generate BRIEF")}<span aria-hidden="true">→</span></button>
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
