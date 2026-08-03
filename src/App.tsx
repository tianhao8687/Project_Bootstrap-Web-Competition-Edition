import { lazy, Suspense, useEffect, useReducer, useRef, useState } from "react";
import { getCopy } from "./app/copy";
import { Progress } from "./components/Progress";
import { ApiError, requestBootstrap, requestResearch } from "./lib/api";
import { demoBrief, demoPlan, demoResearch, demoRules } from "./lib/demo";
import { StartPage } from "./pages/StartPage";
import { ErrorPage, LoadingPage } from "./pages/StatusPages";
import { sessionReducer, type SessionAction } from "./state/machine";
import { clearSession, loadSession, saveSession } from "./state/session";
import type { Artifact, ArtifactName, BootstrapResponse, ProjectSession, ResearchChange } from "./types/domain";

const WorkspacePage = lazy(() => import("./pages/WorkspacePage").then((module) => ({ default: module.WorkspacePage })));
const ClarificationPage = lazy(() => import("./pages/WorkspacePage").then((module) => ({ default: module.ClarificationPage })));
const ResearchPage = lazy(() => import("./pages/ResearchPage").then((module) => ({ default: module.ResearchPage })));
const ResultPage = lazy(() => import("./pages/ResultPage").then((module) => ({ default: module.ResultPage })));

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function payload(session: ProjectSession) {
  return {
    idea: session.idea,
    messages: session.messages,
    brief: session.brief,
    research: session.research,
    acceptedResearchChanges: session.acceptedResearchChanges,
    plan: session.plan,
    warningShown: session.warningShown,
  };
}

export default function App() {
  const [session, dispatch] = useReducer(sessionReducer, undefined, loadSession);
  const [busy, setBusy] = useState(false);
  const researchAbortRef = useRef<AbortController | null>(null);
  const text = getCopy(session.locale);

  useEffect(() => saveSession(session), [session]);

  const reduce = (action: SessionAction) => sessionReducer(session, action);
  const fail = (error: unknown) => {
    const known = error instanceof ApiError ? error : new ApiError("UNKNOWN_ERROR", error instanceof Error ? error.message : "Unknown error", 500);
    dispatch({ type: "FAIL", code: known.code, message: known.message });
  };

  const applyBriefResponse = (response: BootstrapResponse) => {
    if (response.status === "needs_input" && response.blockingQuestions?.length) {
      dispatch({ type: "NEEDS_CLARIFICATION", questions: response.blockingQuestions, warning: response.warning });
      return;
    }
    if (!response.artifact) throw new ApiError("MODEL_SCHEMA_ERROR", "The model response did not include PROJECT_BRIEF.md.", 502);
    dispatch({
      type: "BRIEF_READY",
      artifact: response.artifact,
      warning: response.warning,
      message: [response.warning, response.assistantMessage].filter(Boolean).join("\n\n"),
    });
  };

  const generateBrief = async (next: ProjectSession) => {
    setBusy(true);
    try {
      if (next.mode === "demo") {
        await delay(450);
        dispatch({ type: "BRIEF_READY", artifact: demoBrief(next.idea, next.locale), message: text.draftReady });
      } else {
        applyBriefResponse(await requestBootstrap({ locale: next.locale, action: "draft_brief", session: payload(next) }));
      }
    } catch (error) { fail(error); } finally { setBusy(false); }
  };

  const handleStart = (idea: string) => {
    const action: SessionAction = { type: "START", idea };
    const next = reduce(action);
    dispatch(action);
    void generateBrief(next);
  };

  const handleClarification = (answer: string) => {
    const action: SessionAction = { type: "ADD_USER_MESSAGE", text: answer };
    const next = reduce(action);
    dispatch(action);
    void generateBrief(next);
  };

  const startResearch = async (next: ProjectSession) => {
    if (!next.brief) return;
    const controller = new AbortController();
    researchAbortRef.current = controller;
    setBusy(true);
    try {
      if (next.mode === "demo") {
        await delay(650);
        if (controller.signal.aborted) return;
        dispatch({ type: "RESEARCH_READY", research: demoResearch(next.locale) });
      } else {
        const research = await requestResearch({ locale: next.locale, brief: next.brief.content, maxRepositories: 5 }, controller.signal);
        dispatch({ type: "RESEARCH_READY", research });
      }
    } catch (error) {
      if (!controller.signal.aborted) fail(error);
    } finally {
      if (researchAbortRef.current === controller) {
        researchAbortRef.current = null;
        setBusy(false);
      }
    }
  };

  const confirmBrief = () => {
    const action: SessionAction = { type: "CONFIRM_BRIEF" };
    const next = reduce(action);
    dispatch(action);
    void startResearch(next);
  };

  const generatePlan = async (next: ProjectSession) => {
    setBusy(true);
    try {
      if (next.mode === "demo") {
        await delay(450);
        dispatch({ type: "PLAN_READY", artifact: demoPlan(next.idea, next.locale) });
      } else {
        const response = await requestBootstrap({ locale: next.locale, action: "draft_plan", session: payload(next) });
        if (!response.artifact) throw new ApiError("MODEL_SCHEMA_ERROR", "The model response did not include PROJECT_PLAN.md.", 502);
        dispatch({ type: "PLAN_READY", artifact: response.artifact });
      }
    } catch (error) { fail(error); } finally { setBusy(false); }
  };

  const continueFromResearch = (changes?: ResearchChange[]) => {
    const action: SessionAction = changes ? { type: "ACCEPT_RESEARCH", changes } : { type: "SKIP_RESEARCH" };
    const next = reduce(action);
    dispatch(action);
    void generatePlan(next);
  };

  const skipLoadingResearch = () => {
    const controller = researchAbortRef.current;
    researchAbortRef.current = null;
    controller?.abort();
    continueFromResearch();
  };

  const generateRules = async (next: ProjectSession) => {
    setBusy(true);
    try {
      if (next.mode === "demo") {
        await delay(450);
        dispatch({ type: "RULES_READY", artifact: demoRules(next.locale) });
      } else {
        const response = await requestBootstrap({ locale: next.locale, action: "generate_rules", session: payload(next) });
        if (!response.artifact) throw new ApiError("MODEL_SCHEMA_ERROR", "The model response did not include AI_PROJECT_RULES.md.", 502);
        dispatch({ type: "RULES_READY", artifact: response.artifact });
      }
    } catch (error) { fail(error); } finally { setBusy(false); }
  };

  const confirmPlan = () => {
    const action: SessionAction = { type: "CONFIRM_PLAN" };
    const next = reduce(action);
    dispatch(action);
    void generateRules(next);
  };

  const revise = async (artifact: Artifact, content: string) => {
    const localArtifact = { ...artifact, content, revision: artifact.revision + 1, confirmed: false };
    if (session.mode === "demo") {
      dispatch({ type: "REVISE_ARTIFACT", artifact: localArtifact });
      return;
    }
    setBusy(true);
    try {
      const response = await requestBootstrap({
        locale: session.locale,
        action: artifact.name === "PROJECT_BRIEF.md" ? "revise_brief" : "revise_plan",
        userMessage: `Use this user-edited Markdown as the revision source:\n\n${content}`,
        session: payload(session),
      });
      if (!response.artifact) throw new ApiError("MODEL_SCHEMA_ERROR", "The revision response did not include an artifact.", 502);
      dispatch({ type: "REVISE_ARTIFACT", artifact: response.artifact });
    } catch (error) { fail(error); } finally { setBusy(false); }
  };

  const retry = () => {
    const action: SessionAction = { type: "RETRY" };
    const next = reduce(action);
    dispatch(action);
    if (next.stage === "research_loading") void startResearch(next);
    else if (next.stage === "rules_generation") void generateRules(next);
    else if (next.stage === "plan_review" && !next.plan) void generatePlan(next);
    else if (next.stage === "brief_clarification") void generateBrief(next);
  };

  const skipFailedResearch = () => {
    const action: SessionAction = { type: "SKIP_RESEARCH" };
    const next = reduce(action);
    dispatch(action);
    void generatePlan(next);
  };

  const reset = () => {
    if (!window.confirm(session.locale === "zh-CN" ? "清空这台设备上的当前会话？" : "Clear the current session on this device?")) return;
    const controller = researchAbortRef.current;
    researchAbortRef.current = null;
    controller?.abort();
    setBusy(false);
    clearSession();
    dispatch({ type: "RESET" });
  };

  const artifacts = [session.brief, session.plan, session.rules].filter((item): item is Artifact => Boolean(item));
  return (
    <div className={`app-shell stage-${session.stage}`}>
      <div className="ambient-grid" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="#" onClick={(event) => event.preventDefault()} aria-label="Project Bootstrap Web">
          <span className="brand-mark"><span>PB</span></span><span><strong>Project Bootstrap</strong><small>{text.brandTag}</small></span>
        </a>
        <div className="topbar-telemetry" aria-hidden="true">
          <span className="telemetry-pulse" />
          <span>PIPELINE ONLINE</span>
          <span>03 OUTPUTS</span>
        </div>
        <div className="topbar-actions">
          <span className={`mode-indicator mode-${session.mode}`}>{session.mode === "demo" ? text.demo : text.live}</span>
          {session.stage !== "idea_input" && <button className="text-button" onClick={reset}>{text.reset}</button>}
        </div>
      </header>
      {session.stage !== "idea_input" && <Progress stage={session.stage} locale={session.locale} />}

      <Suspense fallback={<LoadingPage locale={session.locale} message={session.locale === "zh-CN" ? "正在加载当前阶段…" : "Loading this stage…"} />}>
        {session.stage === "idea_input" && (
          <StartPage locale={session.locale} mode={session.mode} busy={busy}
            onLocaleChange={(locale) => dispatch({ type: "SET_LOCALE", locale })}
            onModeChange={(mode) => dispatch({ type: "SET_MODE", mode })}
            onStart={handleStart} />
        )}
        {session.stage === "brief_clarification" && (busy || !session.messages.some((entry) => entry.role === "assistant")
          ? <LoadingPage locale={session.locale} message={text.loadingBrief} />
          : <ClarificationPage locale={session.locale} messages={session.messages} busy={busy} onAnswer={handleClarification} />)}
        {session.stage === "brief_review" && <WorkspacePage locale={session.locale} artifact={session.brief} messages={session.messages} kind="brief" busy={busy} onRevise={(content) => session.brief && void revise(session.brief, content)} onContinue={confirmBrief} />}
        {session.stage === "research_loading" && <LoadingPage locale={session.locale} message={text.loadingResearch} actionLabel={text.skip} onAction={skipLoadingResearch} />}
        {session.stage === "research_review" && session.research && <ResearchPage locale={session.locale} research={session.research} busy={busy} onApply={(changes) => continueFromResearch(changes)} onSkip={() => continueFromResearch()} />}
        {session.stage === "plan_review" && <WorkspacePage locale={session.locale} artifact={session.plan} messages={session.messages} kind="plan" busy={busy} onRevise={(content) => session.plan && void revise(session.plan, content)} onContinue={confirmPlan} />}
        {session.stage === "rules_generation" && <LoadingPage locale={session.locale} message={text.loadingRules} />}
        {session.stage === "completed" && artifacts.length === 3 && <ResultPage locale={session.locale} artifacts={artifacts} onEdit={(name: ArtifactName) => dispatch({ type: "EDIT_UPSTREAM", artifact: name })} />}
        {session.stage === "recoverable_error" && session.error && <ErrorPage
          locale={session.locale}
          code={session.error.code}
          message={session.error.message}
          onRetry={retry}
          onSkipResearch={session.previousStableStage && ["research_loading", "research_review"].includes(session.previousStableStage) ? skipFailedResearch : undefined}
        />}
      </Suspense>
    </div>
  );
}
