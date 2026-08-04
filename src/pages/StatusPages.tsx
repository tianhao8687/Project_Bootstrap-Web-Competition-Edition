import type { Locale } from "../types/domain";
import { getCopy } from "../app/copy";

export function LoadingPage({ locale, message, actionLabel, onAction }: { locale: Locale; message: string; actionLabel?: string; onAction?: () => void }) {
  return <main className="status-page" role="status" aria-live="polite"><div className="orbit" aria-hidden="true"><i /><i /><i /></div><p className="eyebrow">Project Bootstrap</p><h1>{message}</h1><p>{locale === "zh-CN" ? "当前已确认文件会被保留。" : "Confirmed files remain safe during this step."}</p>{actionLabel && onAction && <button className="button button-secondary" onClick={onAction}>{actionLabel}</button>}</main>;
}

export function ErrorPage({ locale, code, message, onRetry, onSkipResearch }: { locale: Locale; code: string; message: string; onRetry: () => void; onSkipResearch?: () => void }) {
  const text = getCopy(locale);
  return <main className="status-page error-page"><span className="error-code">{code}</span><h1>{text.errorTitle}</h1><p>{message}</p><div className="button-row">{onSkipResearch && <button className="button button-secondary" onClick={onSkipResearch}>{text.skip}</button>}<button className="button button-primary" onClick={onRetry}>{text.retry}</button></div></main>;
}
