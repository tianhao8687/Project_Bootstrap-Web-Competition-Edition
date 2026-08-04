import type { Locale } from "../types/domain";

const content = {
  "zh-CN": {
    eyebrow: "同一句话 两种结果",
    title: "为什么不收到想法就直接开工",
    lead: "下面的直出方案是基于相同模糊输入编写的说明性基线 不是实时模型跑分",
    prompt: "我想把自己的资料和知识存起来 以后需要时可以直接问它",
    metrics: [["01", "澄清轮次"], ["03", "正式文件"], ["04", "开源证据"], ["30", "评测问题"]],
    open: "对比一句话直出方案",
    baselineTitle: "一句话直接生成",
    baselineMeta: "快 但依赖未确认假设",
    baseline: [
      "使用 React 和 FastAPI 构建知识库网站",
      "上传 PDF 和笔记并保存到向量数据库",
      "接入大模型实现自然语言问答",
      "回答时展示引用并提供关键词搜索",
      "部署前补充登录 权限和测试",
    ],
    bootstrapTitle: "Project Bootstrap",
    bootstrapMeta: "先确认 再安全执行",
    bootstrap: [
      "先判断个人使用还是未来需要团队共享",
      "明确 MVP 非目标 风险和量化验收标准",
      "用 4 个开源仓库验证组件边界",
      "把权限过滤 引用 拒答和删除写成硬规则",
      "提供当前阶段和 AI 可以执行的修改范围",
    ],
    rows: [
      ["项目范围", "通用功能列表", "MVP 非目标 延期能力"],
      ["不确定信息", "由生成器自行假设", "建议值单独标记并由用户确认"],
      ["RAG 质量", "提到向量问答", "引用 拒答 评测集 延迟与成本门禁"],
      ["权限安全", "以后再补", "检索前过滤 越权测试和删除链路"],
      ["AI 执行", "缺少约束", "三文件职责和永久执行规则"],
    ],
    conclusion: "一句话直出适合获得方向 Project Bootstrap 负责把方向变成 AI 可以安全执行的产品方案",
  },
  en: {
    eyebrow: "Same sentence, different outcomes",
    title: "Why the AI should not start building immediately",
    lead: "The direct output below is an illustrative baseline written from the same rough input, not a live model benchmark.",
    prompt: "I want to save my notes and knowledge somewhere so I can ask questions about them later",
    metrics: [["01", "clarification round"], ["03", "formal files"], ["04", "open-source sources"], ["30", "evaluation questions"]],
    open: "Compare with direct one-sentence output",
    baselineTitle: "Direct one-sentence output",
    baselineMeta: "Fast, but assumption-heavy",
    baseline: [
      "Build a knowledge-base website with React and FastAPI",
      "Upload PDFs and notes into a vector database",
      "Connect a model for natural-language questions",
      "Show citations and provide keyword search",
      "Add login, permissions, and tests before deployment",
    ],
    bootstrapTitle: "Project Bootstrap",
    bootstrapMeta: "Confirm first, execute safely",
    bootstrap: [
      "Determine personal use versus future team sharing",
      "Define the MVP, non-goals, risks, and measurable acceptance",
      "Validate component boundaries against four open-source repositories",
      "Make authorization, citation, refusal, and deletion hard rules",
      "Define the current stage and the changes AI may execute",
    ],
    rows: [
      ["Scope", "Generic feature list", "MVP, non-goals, deferred capabilities"],
      ["Unknowns", "Silently assumed", "Recommendations labeled and user-confirmed"],
      ["RAG quality", "Mentions vector Q&A", "Citation, refusal, benchmark, latency, and cost gates"],
      ["Access safety", "Added later", "Pre-retrieval filters, isolation tests, deletion chain"],
      ["AI execution", "No operating constraints", "Three-file duties and permanent rules"],
    ],
    conclusion: "Direct output is useful for finding a direction. Project Bootstrap turns that direction into a product plan AI can execute safely.",
  },
} as const;

export function ResultComparison({ locale }: { locale: Locale }) {
  const text = content[locale];
  return (
    <section className="result-comparison" aria-labelledby="comparison-title">
      <header>
        <div>
          <p className="eyebrow">{text.eyebrow}</p>
          <h2 id="comparison-title">{text.title}</h2>
          <p>{text.lead}</p>
        </div>
        <blockquote>{text.prompt}</blockquote>
      </header>
      <div className="comparison-metrics" aria-label={locale === "zh-CN" ? "方案结果指标" : "Planning result metrics"}>
        {text.metrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
      </div>
      <details>
        <summary><span>{text.open}</span><span aria-hidden="true">＋</span></summary>
        <div className="comparison-columns">
          <ComparisonCard title={text.baselineTitle} meta={text.baselineMeta} items={text.baseline} baseline />
          <ComparisonCard title={text.bootstrapTitle} meta={text.bootstrapMeta} items={text.bootstrap} />
        </div>
        <div className="comparison-table" role="table" aria-label={text.open}>
          {text.rows.map(([dimension, baseline, bootstrap]) => (
            <div role="row" key={dimension}>
              <strong role="rowheader">{dimension}</strong>
              <span role="cell">{baseline}</span>
              <span role="cell">{bootstrap}</span>
            </div>
          ))}
        </div>
        <p className="comparison-conclusion">{text.conclusion}</p>
      </details>
    </section>
  );
}

function ComparisonCard({ title, meta, items, baseline = false }: { title: string; meta: string; items: readonly string[]; baseline?: boolean }) {
  return (
    <article className={baseline ? "comparison-card is-baseline" : "comparison-card is-bootstrap"}>
      <header><h3>{title}</h3><span>{meta}</span></header>
      <ol>{items.map((item) => <li key={item}>{item}</li>)}</ol>
    </article>
  );
}
