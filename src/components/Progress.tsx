import type { Locale, Stage } from "../types/domain";
import { getCopy, stageIndex } from "../app/copy";

export function Progress({ stage, locale }: { stage: Stage; locale: Locale }) {
  const text = getCopy(locale);
  const active = stageIndex(stage);
  return (
    <nav className="progress" aria-label={locale === "zh-CN" ? "项目进度" : "Project progress"}>
      <ol>
        {text.stages.map((label, index) => (
          <li key={label} className={index < active ? "is-done" : index === active ? "is-active" : ""} aria-current={index === active ? "step" : undefined}>
            <span className="progress-marker" aria-hidden="true">{index < active ? "✓" : index + 1}</span>
            <span className="progress-copy"><small>0{index + 1}</small>{label}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
