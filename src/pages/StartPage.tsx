import { useState } from "react";
import type { Locale } from "../types/domain";
import { getCopy } from "../app/copy";

interface StartPageProps {
  locale: Locale;
  mode: "demo" | "live";
  busy: boolean;
  onLocaleChange: (locale: Locale) => void;
  onModeChange: (mode: "demo" | "live") => void;
  onStart: (idea: string) => void;
}

export function StartPage({ locale, mode, busy, onLocaleChange, onModeChange, onStart }: StartPageProps) {
  const text = getCopy(locale);
  const [idea, setIdea] = useState("");
  const valid = idea.trim().length >= 12;

  return (
    <main className="start-page">
      <section className="hero-copy">
        <p className="eyebrow">{text.startEyebrow}</p>
        <h1>{text.startTitle}</h1>
        <p className="hero-lead">{text.startLead}</p>
        <div className="promise-row" aria-label="Workflow output">
          <span>01 · PROJECT_BRIEF.md</span>
          <span>02 · Reality Check</span>
          <span>03 · PROJECT_PLAN.md</span>
          <span>04 · AI_PROJECT_RULES.md</span>
        </div>
      </section>

      <section className="start-form-card" aria-label={locale === "zh-CN" ? "项目想法表单" : "Project idea form"}>
        <form onSubmit={(event) => { event.preventDefault(); if (valid) onStart(idea); }}>
          <div className="field-header">
            <label id="idea-heading" htmlFor="idea">{text.ideaLabel}</label>
            <span>{idea.trim().length}/2000</span>
          </div>
          <textarea
            id="idea"
            value={idea}
            maxLength={2000}
            placeholder={text.ideaPlaceholder}
            onChange={(event) => setIdea(event.target.value)}
            autoFocus
          />

          <div className="example-block">
            <span>{text.examples}</span>
            <div className="example-list">
              {text.exampleItems.map((example) => <button type="button" key={example} onClick={() => setIdea(example)}>{example}</button>)}
            </div>
          </div>

          <div className="start-options">
            <fieldset>
              <legend>{text.language}</legend>
              <div className="segmented-control">
                <button type="button" aria-pressed={locale === "zh-CN"} onClick={() => onLocaleChange("zh-CN")}>中文</button>
                <button type="button" aria-pressed={locale === "en"} onClick={() => onLocaleChange("en")}>English</button>
              </div>
            </fieldset>
            <fieldset>
              <legend>{text.mode}</legend>
              <div className="segmented-control">
                <button type="button" aria-pressed={mode === "demo"} onClick={() => onModeChange("demo")}>{text.demo}</button>
                <button type="button" aria-pressed={mode === "live"} onClick={() => onModeChange("live")}>{text.live}</button>
              </div>
            </fieldset>
          </div>
          <p className="form-help">{text.modeHelp}</p>
          <button className="button button-primary button-large" type="submit" disabled={!valid || busy}>
            {busy ? text.loadingBrief : text.begin}<span aria-hidden="true">→</span>
          </button>
        </form>
      </section>
    </main>
  );
}
