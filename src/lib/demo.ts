import type { Artifact, Locale, ResearchResult } from "../types/domain";

const zh = (locale: Locale, chinese: string, english: string) => locale === "zh-CN" ? chinese : english;

export const RAG_DEMO_IDEA: Record<Locale, string> = {
  "zh-CN": "我想把自己的资料和知识存起来，以后需要时可以直接问它",
  en: "I want to save my notes and knowledge somewhere so I can ask questions about them later",
};

export interface ClarificationOption {
  label: string;
  value: string;
  recommended?: boolean;
}

export function demoClarification(locale: Locale): { questions: string[]; options: ClarificationOption[]; understood: string } {
  return locale === "zh-CN"
    ? {
        questions: ["先不用决定它叫什么。为了避免做错方向，我只确认两件事：你主要想保存什么资料？以后会不会分享给同事？"],
        options: [
          {
            label: "个人先用 以后可能和同事共享",
            value: "主要保存工作笔记、制度和产品资料。我现在先自己使用，以后可能邀请同事一起使用；请按安全且不用推倒重来的方式设计。",
            recommended: true,
          },
          {
            label: "直接给小团队共同使用",
            value: "主要保存团队制度、产品资料和交付文档，需要小团队共同使用，并确保每个人只能看到有权限的内容。",
          },
          {
            label: "我不确定 请按安全默认方案",
            value: "我还不确定资料类型和是否共享。请采用个人可以立即开始、以后能安全扩展到小团队的最小方案，并把假设标记出来。",
          },
        ],
        understood: "已按你的回答收敛为：个人可以立即开始，未来可安全扩展到小团队；资料回答必须带原文引用，没有依据时明确拒答。请检查 BRIEF 中的假设、边界和验收标准。",
      }
    : {
        questions: ["You do not need to name the product type yet. I only need two facts to avoid building the wrong thing: what material will you save, and might you share it with coworkers later?"],
        options: [
          {
            label: "Personal first, team later",
            value: "Mostly work notes, policies, and product material. I will start alone but may invite coworkers later, so use a safe design that will not require a rebuild.",
            recommended: true,
          },
          {
            label: "Shared by a small team now",
            value: "Mostly team policies, product material, and delivery documents. A small team needs to share it, and people must only retrieve content they are allowed to see.",
          },
          {
            label: "I am unsure — use safe defaults",
            value: "I am not sure about material types or sharing yet. Use the smallest design that works personally now and can expand safely to a small team, and label the assumptions.",
          },
        ],
        understood: "I narrowed the idea to a personal-first knowledge base that can expand safely to a small team. Answers need source citations and must refuse when evidence is insufficient. Review the assumptions, boundaries, and acceptance criteria in the BRIEF.",
      };
}

export function demoBrief(locale: Locale, revision = 1): Artifact {
  return {
    name: "PROJECT_BRIEF.md",
    revision,
    confirmed: false,
    content: zh(locale,
`# PROJECT_BRIEF

## 1. 项目一句话定义

提供一个个人可以立即开始、未来可扩展到 50 人小团队的 RAG 知识库：上传自己的笔记和工作资料后可以直接提问，答案必须返回原文引用，找不到可靠依据时明确拒答。

## 2. 目标用户与核心问题

- 起步用户：希望集中保存工作笔记、制度、产品和交付资料，但不知道应该选择哪类知识库的个人用户。
- 扩展用户：需要共同查询这些资料的运营、产品、销售支持与新员工。
- 管理用户：负责资料维护、权限和数据删除的知识库管理员。
- 核心问题：资料散落在 PDF、DOCX、Markdown 与网页中，关键词搜索难以定位答案，旧版本内容又容易被误用。

## 3. 核心使用场景

1. 员工就制度或产品问题提问，得到简洁答案、引用片段、文件名和页码或段落位置。
2. 管理员上传或更新资料，查看解析、分块、索引状态；失败任务可以定位原因并重试。
3. 用户发现答案不准确时查看原文并反馈；无充分证据时系统返回“不确定”而不是编造。
4. 管理员删除资料后，原文件、文本、分块、向量和后续检索结果同步失效。

## 4. 核心输入与输出

- 输入：PDF、DOCX、Markdown、纯文本和公开 HTML；文件所属知识空间、可见角色、版本与更新时间。
- 输出：基于授权资料生成的答案、逐条引用、来源版本、检索时间和“无充分依据”状态。
- 管理输出：资料处理状态、失败原因、索引版本、删除结果和必要审计记录。

## 5. MVP 必须能力

- 组织、成员与知识空间的最小登录及权限隔离。
- 文件上传、解析、去重、分块、向量化和可恢复的异步索引流程。
- 基于用户权限的检索、重排、回答生成与引用展示。
- 资料版本状态、索引进度、失败重试和端到端删除。
- 至少 30 个真实问题组成的离线评测集，覆盖可回答、不可回答、权限不足和旧版本冲突。
- 用户反馈与最小运行指标：检索命中、引用有效性、拒答、响应时间和单次成本。

## 6. 明确不做

- 第一版不接企业网盘、IM、CRM 等自动同步，不做互联网搜索。
- 不做自主代理、自动修改原文、自动执行企业决策或跨知识空间推断。
- 不支持图片型扫描件的通用 OCR、音视频转写和复杂表格问答。
- 不训练自有基础模型，不承诺替代法务、财务或人事的最终判断。

## 7. 成功标准

- 目标用户能在 15 分钟内完成建库、上传资料并得到第一条带引用答案。
- 固定评测集中，允许回答的问题引用有效率不低于 90%，不可回答问题的正确拒答率不低于 95%。
- 任一答案都能回到用户有权访问的原文；越权测试不得返回内容、标题、摘要或引用。
- 删除资料后 10 分钟内不再被检索，删除任务具备可核验状态。
- 评测环境中问答 P95 小于 8 秒，并记录模型与嵌入成本。

## 8. 已确认硬约束

- 所有检索必须先应用组织、知识空间和角色权限过滤。
- 原始资料与密钥不得进入浏览器日志；模型密钥只保存在服务端。
- 外部文件内容一律视为不可信数据，文档中的指令不得覆盖系统规则。
- 每个事实性答案必须提供引用；没有可靠引用时必须拒答或明确标记不确定。
- Provider 必须通过适配层接入，业务数据模型不得绑定单一模型厂商。

## 9. 当前未决事项

- [未验证] 中文嵌入模型、分块策略与重排组合必须以固定评测集结果决定。
- [待确认] 正式环境的数据保留周期与目标模型供应商，将影响部署区域、成本和合规配置。`,
`# PROJECT_BRIEF

## 1. One-sentence definition

Provide a personal-first RAG knowledge base that can expand safely to a team of up to 50 people. Users upload notes and work material, ask natural-language questions, receive source citations, and get an explicit refusal when evidence is insufficient.

## 2. Target users and core problem

- Starting users: people who want one place for work notes, policies, product material, and deliverables but do not yet know what kind of knowledge base they need.
- Expansion users: operations, product, sales support, customer support, and new employees who later share and query that material.
- Administrative users: knowledge owners responsible for source freshness, access, and deletion.
- Core problem: knowledge is scattered across PDFs, DOCX files, Markdown, and web pages; keyword search misses intent and stale versions are easily mistaken for current truth.

## 3. Core scenarios

1. An employee asks a policy or product question and receives a concise answer with quoted evidence, filename, and page or section location.
2. An administrator uploads or updates material and can see parsing, chunking, and indexing status with actionable retries.
3. A user checks the original source and leaves feedback; the system refuses to invent an answer when evidence is weak.
4. Deleting a source removes the raw object, extracted text, chunks, vectors, and future retrieval results.

## 4. Inputs and outputs

- Inputs: PDF, DOCX, Markdown, plain text, and public HTML plus workspace, role visibility, version, and freshness metadata.
- Outputs: an authorization-scoped answer, itemized citations, source version, retrieval time, and an explicit insufficient-evidence state.
- Administrative outputs: processing status, failure cause, index version, deletion result, and required audit events.

## 5. MVP capabilities

- Minimal organization, member, workspace, and role-aware authentication.
- Recoverable upload, parsing, deduplication, chunking, embedding, and asynchronous indexing.
- Authorization-filtered retrieval, reranking, answer generation, and citation rendering.
- Source version state, indexing progress, retry, and end-to-end deletion.
- An offline benchmark of at least 30 questions covering answerable, unanswerable, unauthorized, and stale-version cases.
- User feedback and basic operational measures for retrieval, citation validity, refusal, latency, and unit cost.

## 6. Explicit non-goals

- No automatic sync with drives, chat, or CRM systems and no internet search in v1.
- No autonomous agents, source editing, enterprise decisions, or cross-workspace inference.
- No general OCR for scanned images, media transcription, or complex table QA.
- No foundation-model training and no promise to replace legal, finance, or HR judgment.

## 7. Success criteria

- A target user can create a workspace, upload a source, and receive the first cited answer within 15 minutes.
- On the fixed benchmark, citation validity is at least 90% for answerable questions and correct refusal is at least 95% for unanswerable questions.
- Every factual answer links to a source the current user may access; authorization tests reveal no title, summary, excerpt, or citation from restricted sources.
- A deleted source disappears from retrieval within 10 minutes and exposes a verifiable deletion state.
- Evaluation-environment question answering has P95 latency under eight seconds with model and embedding cost recorded.

## 8. Confirmed hard constraints

- Retrieval always applies organization, workspace, and role filters before ranking.
- Raw documents and secrets never enter browser logs; provider credentials remain server-side.
- Every external document is untrusted data and document instructions can never override system rules.
- Every factual answer carries citations; without reliable evidence the system refuses or marks uncertainty.
- Providers use adapters and the domain model is not coupled to one model vendor.

## 9. Open items

- [Unverified] The Chinese embedding, chunking, and reranking combination must be selected by the fixed benchmark.
- [Pending] Production retention policy and the target model provider will affect region, cost, and compliance configuration.`),
  };
}

export function demoPlan(locale: Locale, revision = 1): Artifact {
  return {
    name: "PROJECT_PLAN.md",
    revision,
    confirmed: false,
    content: zh(locale,
`# PROJECT_PLAN

## 1. 执行模式与关键依据

模式：Team

关键依据：
- 同时存在正式登录与租户权限、生产数据库和向量索引、异步文件处理、付费 AI Provider、敏感内部资料与删除审计。
- RAG 质量、安全边界和成本会互相影响，不能只用“页面能回答”判断完成。
- 需要长期维护索引版本和资料版本，关键失败可能造成越权泄露或错误业务判断。

必要角色：
- 产品与交付负责人：维护 BRIEF、用户验收和阶段范围。
- 应用与数据架构负责人：负责 API、数据模型、任务队列、Migration 和部署。
- RAG 与评测负责人：负责解析、分块、检索、重排、提示词、引用和离线评测。
- 安全与质量负责人：负责租户隔离、攻击测试、删除验证、自动化测试和发布证据。

一个问题只设一个主负责人；其他角色只提供必要审查，不重复产出第二套结论。

## 2. 总体技术方向

- Web：React + TypeScript + Vite，使用无障碍语义组件展示问答、引用、上传状态和管理操作。
- API：Python 3.12 + FastAPI；用明确的请求 Schema、领域服务和 Provider Adapter 隔离模型厂商。
- 数据：PostgreSQL 保存组织、权限、资料版本、任务、会话、反馈与审计；pgvector 保存带租户和版本键的向量。
- 文件：S3 兼容对象存储保存原始文件；PostgreSQL 保存对象键和校验和，不把二进制写入数据库。
- 异步处理：Redis + Worker 执行解析、分块、嵌入、重建索引和删除；任务必须幂等并可重试。
- AI：Embedding、Reranker、Chat Model 均经适配层调用；开发与测试提供确定性 Mock。
- 质量：pytest 覆盖服务与数据边界，Vitest 覆盖前端状态，Playwright 覆盖核心用户流程；固定 RAG 评测集输出版本化报告。
- 部署：Web、API、Worker 独立部署；数据库和对象存储使用受管服务；所有环境通过同一 Migration 与配置 Schema。

## 3. 系统结构与核心模块

1. 身份与授权：OIDC 登录映射到 Organization、Membership、WorkspaceRole；所有查询从服务端授权上下文取得 tenant_id。
2. 资料与版本：SourceDocument、DocumentVersion、StoredObject、IngestionJob 管理上传、校验和、状态和版本切换。
3. 解析与索引：解析器生成标准段落；Chunk 保留页码、标题路径、字符范围和版本；Embedding 与索引版本绑定。
4. 检索与回答：权限过滤 → 关键词/向量候选 → 重排 → 证据阈值 → 带引用回答或拒答。
5. 问答与反馈：Conversation、Message、Citation、Feedback 保存可重放的输入、模型版本、检索参数和来源快照。
6. 评测与运营：BenchmarkCase、EvaluationRun 和基础指标记录正确性、引用、拒答、延迟与成本。

## 4. 数据与高风险边界

- 每张业务表和每个向量记录必须带 organization_id；服务层不得接受客户端直接指定已授权租户。
- 先权限过滤再相似度检索，禁止先全库召回后在应用层删越权结果。
- 原文件、提取文本、Chunk、Embedding、缓存和引用必须共享可追踪的 document_version_id。
- 删除使用可恢复任务编排：标记不可见 → 删除索引与缓存 → 删除文本和对象 → 写审计结果；失败必须保持不可检索并可重试。
- 文档文本是潜在 Prompt Injection 载体，只能进入证据区，不能进入系统指令或工具权限上下文。
- 日志不得记录原文、完整问题、答案、Token、密钥或个人敏感字段；调试样本必须脱敏。
- 预算、速率限制和 Provider 故障必须转为明确的可恢复状态，不得静默降级为无引用回答。

## 5. 阶段路线图

### 阶段 1：检索与评测基线
目标：在脱敏样例资料上确定可复现的分块、检索、引用和拒答基线。
最短验收：一条命令完成 30 个问题评测，输出版本、引用有效率、拒答率、P95 延迟与估算成本。

### 阶段 2：安全资料摄取
目标：完成登录、租户数据模型、上传、异步解析、索引状态、重试和删除链路。
最短验收：两个组织上传同名文件后互不可见；上传失败可重试；删除后检索与对象存储均无残留。

### 阶段 3：带引用问答
目标：交付权限过滤、混合检索、重排、证据阈值、回答和引用回跳。
最短验收：普通用户可完成问答并打开授权原文；不可回答问题稳定拒答；越权用例为零泄露。

### 阶段 4：知识管理与反馈
目标：交付资料版本、更新、反馈、基础运营指标与管理员状态页。
最短验收：管理员能替换版本、查看处理状态和反馈；旧版本不再参与新回答且历史答案仍可追踪。

### 阶段 5：可靠性与发布
目标：完成容量、故障、成本、安全、备份、回滚和部署门禁。
最短验收：发布检查包含自动测试、固定评测、Migration 演练、删除验证、告警与回滚证据。

## 6. 当前执行阶段

当前阶段：阶段 1——检索与评测基线

### 6.1 目标

用两组脱敏中文资料和至少 30 个标注问题，验证 RAG 主链路是否能达到已确认的引用与拒答标准，并选出第一版技术参数。

### 6.2 允许范围

- 建立可版本化的样例语料、BenchmarkCase Schema 和评测命令。
- 实现 PDF、DOCX、Markdown 的最小解析接口及确定性测试夹具。
- 对比分块大小、重叠、Embedding、关键词召回、向量召回、Reranker 和证据阈值。
- 输出每题召回证据、最终引用、拒答判断、延迟和成本；保留可复现实验配置。
- 只用脱敏测试资料，不接正式身份系统、生产文件和真实用户数据。

### 6.3 明确不做

- 不建设完整聊天 UI、组织管理、生产队列、正式监控和多环境部署。
- 不为了提高演示观感绕过评测，不把人工挑选答案计为系统通过。
- 不在基线未通过前锁定单一模型厂商或扩展复杂 Agent 能力。

### 6.4 验收标准

- 新环境按 README 的单条命令安装后，可运行全部单元测试和固定评测。
- 评测报告包含 Git Commit、语料版本、模型/Mock 版本、检索参数和逐题结果。
- 可回答题引用有效率达到 90%，不可回答题正确拒答率达到 95%；未达到时报告失败项而不是修改标准。
- 权限不足案例在模拟授权过滤中召回为零，文档内恶意指令不会进入系统提示词。
- 实际运行过的命令、通过项、失败项、P95 延迟和估算成本被如实记录。

## 7. 明确暂缓能力

- 企业网盘、IM、CRM 和数据库连接器。
- 扫描件 OCR、图片理解、音视频转写、复杂表格与跨文档计算。
- 多语言自动翻译、个性化记忆、自主 Agent 和自动执行业务动作。
- 多区域容灾、自托管模型训练和高级计费系统。

## 8. 当前已知风险或未决技术事项

- [未验证] 中文资料的最佳 Embedding、Chunk 与 Reranker 组合，以阶段 1 的固定评测为唯一选型证据。
- [待确认] 正式 Provider、数据保留期限、部署区域和月度预算，须在阶段 2 前批准。
- [未验证] DOCX 复杂表格和 PDF 多栏布局的解析质量；不达标时第一版应明确限制格式而不是静默丢内容。`,
`# PROJECT_PLAN

## 1. Execution mode and key evidence

Mode: Team

Key evidence:
- The project combines production authentication, tenant authorization, a relational and vector database, asynchronous ingestion, paid AI providers, sensitive internal material, and auditable deletion.
- RAG quality, security, latency, and cost interact; a page that merely produces an answer is not sufficient acceptance.
- Source and index versions require long-term maintenance, while failures can expose restricted information or create harmful business decisions.

Required roles:
- Product and delivery owner: owns the BRIEF, user acceptance, and stage scope.
- Application and data architecture owner: owns APIs, domain data, workers, migrations, and deployment.
- RAG and evaluation owner: owns parsing, chunking, retrieval, reranking, prompts, citations, and offline evaluation.
- Security and quality owner: owns tenant isolation, adversarial tests, deletion verification, automation, and release evidence.

Every issue has one primary owner; reviewers provide bounded checks and do not create competing conclusions.

## 2. Overall technical direction

- Web: React, TypeScript, and Vite with accessible semantic components for chat, citations, ingestion status, and administration.
- API: Python 3.12 and FastAPI with explicit schemas, domain services, and provider adapters.
- Data: PostgreSQL for organizations, access, source versions, jobs, conversations, feedback, and audit; pgvector for tenant- and version-keyed embeddings.
- Files: S3-compatible object storage for originals, with checksums and object keys in PostgreSQL.
- Async processing: Redis and workers for parsing, chunking, embedding, reindexing, and deletion; every job is idempotent and retryable.
- AI: embedding, reranking, and chat models behind adapters, with deterministic mocks for development and tests.
- Quality: pytest for services and data boundaries, Vitest for web state, Playwright for user journeys, and versioned RAG benchmark reports.
- Deployment: separate Web, API, and Worker services with managed database and object storage; all environments use the same migration and configuration schemas.

## 3. System structure and core modules

1. Identity and authorization: map OIDC identities to Organization, Membership, and WorkspaceRole; server authorization supplies tenant context.
2. Sources and versions: SourceDocument, DocumentVersion, StoredObject, and IngestionJob own uploads, checksums, states, and active versions.
3. Parsing and indexing: parsers emit normalized blocks; chunks retain page, heading path, character range, and version; embeddings bind to an index version.
4. Retrieval and answering: authorization filter, lexical/vector candidates, reranking, evidence threshold, then cited answer or refusal.
5. Conversations and feedback: Conversation, Message, Citation, and Feedback keep replayable input, model version, retrieval settings, and source snapshot.
6. Evaluation and operations: BenchmarkCase, EvaluationRun, and basic metrics record correctness, citations, refusal, latency, and cost.

## 4. Data and high-risk boundaries

- Every business row and vector record carries organization_id; services never trust a tenant identifier supplied directly by the client.
- Authorization filtering occurs before similarity ranking, never after a cross-tenant recall.
- Raw object, extracted text, chunk, embedding, cache, and citation share a traceable document_version_id.
- Deletion is a retryable workflow: hide, delete index/cache, delete text/object, then record the audit result; failures remain non-retrievable.
- Document text is a prompt-injection surface and can enter only the evidence section, never system instructions or tool authorization.
- Logs exclude raw text, full questions, answers, tokens, secrets, and sensitive personal fields; debug fixtures are sanitized.
- Budget, rate limit, and provider failure become explicit recoverable states and never silently degrade to an uncited answer.

## 5. Roadmap

### Stage 1: Retrieval and evaluation baseline
Goal: establish reproducible chunking, retrieval, citation, and refusal on sanitized sample material.
Minimum acceptance: one command evaluates 30 questions and reports versions, citation validity, refusal, P95 latency, and estimated cost.

### Stage 2: Secure ingestion
Goal: deliver identity, tenant data, upload, asynchronous parsing, status, retry, and deletion.
Minimum acceptance: two organizations cannot see identically named sources; failed ingestion retries; deletion leaves no retrieval or object residue.

### Stage 3: Cited question answering
Goal: deliver authorization filtering, hybrid retrieval, reranking, evidence threshold, answer, and source navigation.
Minimum acceptance: users can ask and open authorized evidence; unanswerable questions refuse; authorization tests show zero leakage.

### Stage 4: Knowledge administration and feedback
Goal: deliver source versions, updates, feedback, operational measures, and an administrator status view.
Minimum acceptance: an administrator can replace a version and inspect processing and feedback; old versions leave new retrieval while historical answers remain traceable.

### Stage 5: Reliability and release
Goal: complete capacity, failure, cost, security, backup, rollback, and deployment gates.
Minimum acceptance: release evidence contains automated tests, fixed evaluation, migration rehearsal, deletion verification, alerting, and rollback.

## 6. Current execution stage

Current stage: Stage 1 — Retrieval and evaluation baseline

### 6.1 Goal

Use two sanitized Chinese corpora and at least 30 labeled questions to validate the RAG path against confirmed citation and refusal targets and select v1 retrieval settings.

### 6.2 Allowed scope

- Create versioned sample corpora, BenchmarkCase schemas, and one evaluation command.
- Implement minimal parser interfaces and deterministic fixtures for PDF, DOCX, and Markdown.
- Compare chunk size, overlap, embedding, lexical/vector recall, reranking, and evidence thresholds.
- Record evidence, citations, refusal, latency, cost, and reproducible experiment configuration per question.
- Use sanitized test sources only; do not connect production identity, documents, or user data.

### 6.3 Explicit non-goals

- No full chat UI, organization administration, production queue, formal monitoring, or multi-environment deployment.
- Do not bypass evaluation for a prettier demo and never count hand-picked answers as a system pass.
- Do not lock to one provider or add agents before the baseline passes.

### 6.4 Acceptance

- A fresh environment runs unit tests and the fixed evaluation from a single documented command.
- The report includes Git commit, corpus version, model/mock version, retrieval settings, and per-case results.
- Answerable citation validity reaches 90% and unanswerable refusal reaches 95%; failures are reported rather than changing the target.
- Simulated unauthorized cases recall zero evidence and malicious document instructions never enter system prompts.
- Actually executed commands, passes, failures, P95 latency, and estimated cost are reported truthfully.

## 7. Deferred capabilities

- Drive, chat, CRM, and database connectors.
- Scanned OCR, vision, media transcription, complex tables, and cross-document computation.
- Automatic translation, personal memory, autonomous agents, and business actions.
- Multi-region recovery, self-hosted model training, and advanced billing.

## 8. Known risks and open technical items

- [Unverified] Select Chinese embedding, chunk, and reranker settings only from the Stage 1 fixed benchmark.
- [Pending] Approve the production provider, retention period, region, and monthly budget before Stage 2.
- [Unverified] DOCX table and multi-column PDF parsing quality; if inadequate, v1 must restrict formats instead of silently dropping content.`),
  };
}

export function demoRules(locale: Locale): Artifact {
  return {
    name: "AI_PROJECT_RULES.md",
    revision: 1,
    confirmed: true,
    content: zh(locale,
`# AI_PROJECT_RULES

Version: 1.0
Execution Mode: Team

## 1. 执行模式与最高原则

- 以已确认的 PROJECT_BRIEF.md 和 PROJECT_PLAN.md 为正式事实；后续实现不得把通用 RAG 惯例当成本项目决定。
- 一个问题只设一个主负责人；其他角色只做范围明确的审查，禁止并行生成互相竞争的架构或评测结论。
- 正确拒答优先于无证据回答；租户隔离、可追溯引用和真实测试优先于演示效果。

## 2. 永久不可裁剪核心规则

1. 不得默认每次任务都重新读取全部三个文件。
2. 只加载完成当前任务所必需的最小上下文。
3. PROJECT_BRIEF.md：只在需要 WHAT、WHY 或产品边界时读取。
4. PROJECT_PLAN.md：只在需要 HOW、阶段或技术路线时读取。
5. 没有新证据，不重新全面分析已通过问题。
6. 未实际运行的测试，不得报告为通过。
7. 不得把 [待确认] 或 [未验证] 冒充成 [已确认]。
8. 发现额外问题时可以记录，但不得顺手扩大当前任务范围。

## 3. 范围控制与问题重开

- 任务开始时先声明当前阶段、允许范围和验收标准；不得实现 PROJECT_PLAN 当前阶段未授权的业务能力。
- 已通过的检索、权限或删除决定，只有出现新失败用例、依赖变化、数据证据或正式范围变更时才能重新打开。
- 发现更好方案时先记录为建议；若不阻塞当前验收，继续执行已确认方案。
- 修改 BRIEF 或 PLAN 的正式决定前必须获得明确批准，并先更新受影响文件再改代码。

## 4. AI 行动授权

### Level 1：可自主执行

- 不改变外部行为、数据语义、接口契约和安全边界的命名、局部拆分、测试夹具、日志格式与小型重构。
- 在已确认技术方向内补充失败用例、类型约束、可观测字段和文档。

### Level 2：只建议，不静默执行

- 更换非关键库、调整分块或检索参数、增加索引、改变缓存策略、调整界面信息层级。
- 建议必须写明证据、影响的指标或模块，以及当前仍按哪个决定继续。

### Level 3：必须先批准

- 改变产品范围、执行模式、核心技术方向、数据库主路径、租户授权模型或删除语义。
- 更换正式 AI Provider、提高付费额度、引入真实用户资料、生产 Migration、部署区域、保留期限或合规规则。
- 降低引用、拒答、权限隔离、安全或测试门禁；禁止用“先上线再补”绕过批准。

## 5. 必要角色与问题负责人

- 产品范围与用户验收 → 产品与交付负责人。
- API、数据模型、Migration、Worker、部署 → 应用与数据架构负责人。
- Parser、Chunk、Embedding、Retrieval、Reranker、Prompt、Citation、Evaluation → RAG 与评测负责人。
- Auth、租户隔离、Prompt Injection、删除验证、测试与发布证据 → 安全与质量负责人。
- 跨边界问题由影响最大的一方担任主负责人；审查意见写入同一问题，不另建第二套方案。

## 6. 专项边界规则

### 数据库与 Migration

- 所有租户业务表、向量和缓存键必须携带 organization_id；任何缺少租户键的新表或索引不得合并。
- Schema 变化必须提供向前 Migration、回滚或恢复策略、测试数据和实际执行证据；不得直接修改生产数据。
- SourceDocument、DocumentVersion、Chunk、Embedding 和 Citation 的追踪关系不得被局部优化破坏。

### RAG 与 Provider

- 文档文本只作为不可信证据，不得进入 System Prompt、工具权限或可执行指令区。
- 回答前必须完成服务端权限过滤；禁止先跨租户召回再过滤。
- 每个事实性回答必须引用实际参与本次回答的文档版本；引用无效或证据低于阈值时必须拒答。
- Embedding、Reranker 和 Chat Model 通过适配层调用；Provider 响应必须经过 Schema 校验、超时、限流和错误映射。
- 调整 Chunk、模型、Prompt、top-k、Reranker 或阈值后，必须重跑固定评测并比较引用、拒答、延迟和成本。

### 安全、隐私与成本

- 密钥只存在于服务端 Secret Store；日志、前端包、错误响应、测试快照和导出物不得包含密钥或原始敏感资料。
- 使用真实资料前必须确认数据授权、保留期限、删除路径和 Provider 数据政策；未确认时只允许脱敏夹具。
- 任何缓存都必须继承租户、用户权限、资料版本和删除状态；无法证明隔离时不启用缓存。
- Provider 超时、限额或预算不足必须显示可恢复错误，不得回退到无引用答案。

## 7. 测试与完成报告

- 单元测试覆盖授权过滤、版本追踪、拒答阈值、引用映射、幂等任务和删除状态机。
- 集成测试使用两个组织和同名文件验证零泄露，使用恶意文档验证 Prompt Injection 隔离，使用失败任务验证重试与恢复。
- RAG 变更必须运行固定 Benchmark；只报告实际执行的语料版本、参数、通过项、失败项、延迟和成本。
- E2E 覆盖管理员上传到可检索、用户提问到打开引用、无依据拒答、越权访问和删除后不可检索。
- 完成报告必须列出实际命令与结果、未运行检查、已知限制和回滚方式；没有证据时不得写“全部通过”。

## 8. 项目专属硬约束

- 引用、权限过滤、拒答和删除是产品核心能力，不得为了速度替换为静态演示数据后宣称完成。
- 外部仓库无明确兼容许可证时禁止复制代码；可借鉴思想，但实现必须独立并记录来源。
- 历史答案可以保留来源快照，但已删除资料的正文不得继续展示；具体保留方式须符合已批准的数据政策。
- 正式环境不得把测试 Mock、公共样例资料或调试后门暴露给普通用户。

## 9. 规则修改条件

- 文字澄清、所有者名称和不改变权限的测试补充可局部修改，并记录影响章节。
- 改变永久核心规则、授权等级、租户隔离、引用/拒答门禁、数据保留、Provider 或生产 Migration 规则必须获得明确批准。
- 规则修改后只更新受影响章节；若改变 HOW，同步更新 PROJECT_PLAN.md，若改变 WHAT 或范围，先更新 PROJECT_BRIEF.md。`,
`# AI_PROJECT_RULES

Version: 1.0
Execution Mode: Team

## 1. Execution mode and highest principles

- Confirmed PROJECT_BRIEF.md and PROJECT_PLAN.md are formal truth; generic RAG practice is not a project decision.
- Every issue has one primary owner; reviewers perform bounded checks and do not create competing architecture or evaluation conclusions.
- Correct refusal outranks unsupported answers; tenant isolation, traceable citations, and truthful tests outrank demo appearance.

## 2. Permanent non-trimmable core rules

1. Do not reload all three files for every task.
2. Load only the minimum context required for the current task.
3. Read PROJECT_BRIEF.md only for WHAT, WHY, or product boundaries.
4. Read PROJECT_PLAN.md only for HOW, stage, or technical direction.
5. Do not reopen a passed issue without new evidence.
6. Never report an unexecuted test as passed.
7. Never present [Pending] or [Unverified] as [Confirmed].
8. Record out-of-scope findings, but do not expand the current task while fixing them.

## 3. Scope control and reopening

- Start work by naming the current stage, allowed scope, and acceptance; do not add capabilities absent from the current PLAN stage.
- Reopen passed retrieval, authorization, or deletion decisions only for a new failing case, dependency change, data evidence, or approved scope change.
- Record better ideas as proposals and continue the confirmed path when acceptance is not blocked.
- Obtain explicit approval and update affected formal files before changing a confirmed BRIEF or PLAN decision.

## 4. AI action authorization

### Level 1 — autonomous

- Naming, local decomposition, fixtures, logging shape, and small refactors that preserve external behavior, data meaning, contracts, and security boundaries.
- Add failure cases, types, observability fields, and documentation within the confirmed technical direction.

### Level 2 — suggest, never silently execute

- Replace a noncritical library, tune chunking or retrieval, add an index, change cache strategy, or alter UI information hierarchy.
- State the evidence, affected metric or module, and which confirmed decision remains in force.

### Level 3 — approval required

- Change scope, execution mode, core architecture, database path, tenant authorization, or deletion semantics.
- Change the production AI provider, paid quota, real user data, production migration, region, retention, or compliance rule.
- Lower citation, refusal, isolation, security, or test gates; “ship now, fix later” is not authorization.

## 5. Required roles and issue ownership

- Product scope and user acceptance → Product and delivery owner.
- APIs, data, migrations, workers, deployment → Application and data architecture owner.
- Parsing, chunks, embeddings, retrieval, reranking, prompts, citations, evaluation → RAG and evaluation owner.
- Authentication, tenant isolation, prompt injection, deletion, testing, release evidence → Security and quality owner.
- Cross-boundary issues have one primary owner; reviews attach to the same issue instead of producing a second plan.

## 6. Specialized boundary rules

### Database and migrations

- Every tenant business table, vector, and cache key includes organization_id; a new table or index without a tenant key cannot merge.
- Schema changes include forward migration, rollback or recovery, test data, and executed evidence; never patch production data directly.
- Preserve traceability across SourceDocument, DocumentVersion, Chunk, Embedding, and Citation.

### RAG and providers

- Document text is untrusted evidence and never enters system instructions, tool authority, or executable directives.
- Server authorization filtering completes before retrieval; cross-tenant recall followed by application filtering is forbidden.
- Every factual answer cites the exact participating document version; invalid or weak evidence causes refusal.
- Embedding, reranker, and chat models use adapters with schema validation, timeout, rate limiting, and error mapping.
- Changing chunks, model, prompt, top-k, reranker, or threshold requires the fixed benchmark and a comparison of citation, refusal, latency, and cost.

### Security, privacy, and cost

- Secrets remain in the server secret store; logs, client bundles, errors, snapshots, and exports contain neither secrets nor raw sensitive material.
- Before real sources are used, confirm data authority, retention, deletion, and provider policy; otherwise use sanitized fixtures only.
- Caches inherit tenant, user permission, source version, and deletion state; do not enable a cache without isolation evidence.
- Provider timeout, quota, or budget failure is an explicit recoverable error and never falls back to an uncited answer.

## 7. Testing and completion reports

- Unit tests cover authorization, version traceability, refusal thresholds, citation mapping, idempotent jobs, and deletion state.
- Integration tests use two tenants and identically named files for zero leakage, malicious documents for prompt-injection isolation, and failed jobs for recovery.
- RAG changes run the fixed benchmark and report only executed corpus versions, settings, passes, failures, latency, and cost.
- E2E covers upload-to-search, question-to-citation, unsupported refusal, unauthorized access, and post-deletion non-retrieval.
- Completion reports list executed commands and results, skipped checks, known limits, and rollback; no evidence means no “all passed” claim.

## 8. Project-specific hard constraints

- Citation, authorization filtering, refusal, and deletion are core product behavior; static demo data cannot be presented as completion.
- Do not copy code from external repositories without a clear compatible license; ideas may be referenced but implementation remains independent.
- Historical answers may retain a source snapshot, but deleted source text cannot remain visible; retention follows approved policy.
- Production never exposes test mocks, public sample sources, or debug bypasses to ordinary users.

## 9. Rule change conditions

- Clarifications, owner names, and tests that do not change authority may be edited locally with the affected section recorded.
- Changing core rules, authorization levels, tenant isolation, citation/refusal gates, retention, providers, or production migrations requires explicit approval.
- Update only affected sections; a HOW change updates PROJECT_PLAN.md, while a WHAT or scope change updates PROJECT_BRIEF.md first.`),
  };
}

export function demoResearch(locale: Locale): ResearchResult {
  const inference = {
    kind: "ai_inference" as const,
    source: "Comparison against the confirmed RAG knowledge-base brief",
    summary: zh(locale, "基于已确认 RAG 目标、权限与引用门禁的产品适配推断。", "Product-fit inference based on the confirmed RAG, authorization, and citation gates."),
  };
  const readme = (source: string, chinese: string, english: string) => ({
    kind: "readme_claim" as const,
    source: `${source}:README`,
    summary: zh(locale, chinese, english),
  });
  const license = (source: string, spdx: string) => ({
    kind: "license_evidence" as const,
    source: `${source}:LICENSE`,
    summary: zh(locale, `内置快照记录该仓库许可证为 ${spdx}。`, `The bundled snapshot records the repository license as ${spdx}.`),
  });
  const langchain = readme("langchain-ai/langchain", "README 将其描述为构建上下文感知推理应用的框架。", "Its README describes a framework for context-aware reasoning applications.");
  const llamaIndex = readme("run-llama/llama_index", "README 展示了文档摄取、索引、检索和查询工作流。", "Its README presents document ingestion, indexing, retrieval, and query workflows.");
  const pgvector = readme("pgvector/pgvector", "README 记录了 PostgreSQL 中的向量相似度搜索能力。", "Its README documents vector similarity search for PostgreSQL.");
  const haystack = readme("deepset-ai/haystack", "README 展示了可组合的检索、生成和评测管线。", "Its README presents composable retrieval, generation, and evaluation pipelines.");

  return {
    queries: ["enterprise RAG knowledge base citations", "RAG document ingestion retrieval evaluation", "PostgreSQL vector search tenant filtering"],
    fetchedAt: new Date().toISOString(),
    limitations: [zh(locale, "这是为完整 RAG 案例固定的证据快照，不代表当前 GitHub 状态；实时模式才执行真实检索。", "This is a fixed evidence snapshot for the complete RAG case, not current GitHub state; live mode performs real retrieval.")],
    repositories: [
      {
        fullName: "langchain-ai/langchain",
        url: "https://github.com/langchain-ai/langchain",
        relevance: "high",
        summary: zh(locale, "提供模型、检索器、工具和运行时抽象，适合参考 Provider 与 RAG 组件边界。", "Provides model, retriever, tool, and runtime abstractions useful for provider and RAG component boundaries."),
        confirmedCapabilities: [zh(locale, "README 声称支持检索增强与多种模型集成。", "The README claims retrieval-augmented and multi-model integrations.")],
        usefulReferences: [zh(locale, "参考可替换 Provider 和检索组件接口，不直接继承完整框架复杂度。", "Reference replaceable provider and retrieval interfaces without inheriting the full framework complexity.")],
        avoidCopying: [zh(locale, "MVP 不引入 Agent、工具循环和不需要的抽象层。", "Do not introduce agents, tool loops, or unused abstractions into the MVP.")],
        differences: [zh(locale, "本项目以企业权限、引用有效性和删除为产品门禁。", "This project makes enterprise authorization, citation validity, and deletion product gates.")],
        license: { spdx: "MIT", status: "detected" },
        evidence: [langchain, license("langchain-ai/langchain", "MIT"), inference],
      },
      {
        fullName: "run-llama/llama_index",
        url: "https://github.com/run-llama/llama_index",
        relevance: "high",
        summary: zh(locale, "聚焦私有数据摄取、索引与检索，可参考文档节点和评测组织方式。", "Focuses on private-data ingestion, indexing, and retrieval and is useful for document-node and evaluation organization."),
        confirmedCapabilities: [zh(locale, "README 展示了数据连接、索引和查询能力。", "The README presents data connection, indexing, and querying capabilities.")],
        usefulReferences: [zh(locale, "参考资料版本到 Chunk、引用和评测样本的追踪关系。", "Reference traceability from source versions to chunks, citations, and evaluation cases.")],
        avoidCopying: [zh(locale, "不直接采用默认分块和检索参数，必须用中文评测集验证。", "Do not adopt default chunking and retrieval settings without the Chinese benchmark.")],
        differences: [zh(locale, "本项目要求所有检索先完成租户权限过滤。", "This project requires tenant authorization filtering before every retrieval.")],
        license: { spdx: "MIT", status: "detected" },
        evidence: [llamaIndex, license("run-llama/llama_index", "MIT"), inference],
      },
      {
        fullName: "pgvector/pgvector",
        url: "https://github.com/pgvector/pgvector",
        relevance: "high",
        summary: zh(locale, "在 PostgreSQL 内提供向量类型、距离与索引，适合第一版保持数据和权限过滤在同一数据库。", "Adds vector types, distance operations, and indexes to PostgreSQL, keeping v1 data and authorization filtering in one database."),
        confirmedCapabilities: [zh(locale, "README 记录精确与近似向量检索及多种距离函数。", "The README documents exact and approximate vector search with multiple distance functions.")],
        usefulReferences: [zh(locale, "复用数据库级租户过滤与向量召回的组合思路。", "Reuse the design idea of combining database tenant filters with vector recall.")],
        avoidCopying: [zh(locale, "不能把建索引当作质量完成；仍需评测召回、引用和删除。", "An index is not quality completion; recall, citations, and deletion still require evaluation.")],
        differences: [zh(locale, "本项目还需要异步摄取、重排、拒答和文档版本管理。", "The project also requires async ingestion, reranking, refusal, and source versioning.")],
        license: { spdx: "PostgreSQL", status: "detected" },
        evidence: [pgvector, license("pgvector/pgvector", "PostgreSQL"), inference],
      },
      {
        fullName: "deepset-ai/haystack",
        url: "https://github.com/deepset-ai/haystack",
        relevance: "medium",
        summary: zh(locale, "提供组件化 RAG 管线和评测思路，可参考显式管线与失败边界。", "Provides componentized RAG pipelines and evaluation patterns useful for explicit pipelines and failure boundaries."),
        confirmedCapabilities: [zh(locale, "README 展示了检索与生成组件编排。", "The README presents orchestration of retrieval and generation components.")],
        usefulReferences: [zh(locale, "参考把摄取、检索、回答和评测拆成可独立测试的组件。", "Reference independently testable ingestion, retrieval, answer, and evaluation components.")],
        avoidCopying: [zh(locale, "不为框架完整性增加 MVP 不需要的组件。", "Do not add components merely for framework completeness.")],
        differences: [zh(locale, "本项目的正式验收同时包含权限隔离和端到端删除。", "This project's formal acceptance also includes isolation and end-to-end deletion.")],
        license: { spdx: "Apache-2.0", status: "detected" },
        evidence: [haystack, license("deepset-ai/haystack", "Apache-2.0"), inference],
      },
    ],
    assessment: {
      verdict: "continue_with_focus",
      verdictReason: zh(locale, "通用 RAG 框架已经成熟，但企业权限、证据引用、拒答、版本和删除仍需要项目级设计；应先用固定评测证明主链路。", "Generic RAG frameworks are mature, but enterprise authorization, citations, refusal, versioning, and deletion still need product-specific design; prove the core path with a fixed benchmark first."),
      advantages: [{ text: zh(locale, "项目把引用、拒答、权限和删除定义为可验收核心能力，而不是只展示聊天效果。", "The project treats citations, refusal, authorization, and deletion as testable core behavior rather than chat polish."), evidence: [pgvector, inference] }],
      weaknesses: [{ text: zh(locale, "文档解析质量和中文检索参数尚未验证，过早建设完整后台会放大返工。", "Document parsing quality and Chinese retrieval settings are unverified; building the full administration surface too early would amplify rework."), evidence: [llamaIndex, haystack, inference] }],
      reusableIdeas: [{ text: zh(locale, "可借鉴组件化 Provider、文档节点追踪和 PostgreSQL 向量过滤，但参数必须由本项目评测决定。", "Use componentized providers, document-node traceability, and PostgreSQL vector filtering while selecting settings through this project's benchmark."), evidence: [langchain, llamaIndex, pgvector, inference] }],
      differentiation: [{ text: zh(locale, "差异化应落在小团队可负担的企业级可信链路：来源版本、逐条引用、正确拒答、权限和可核验删除。", "Differentiate through an affordable enterprise trust chain for small teams: source versions, citations, correct refusal, authorization, and verifiable deletion."), evidence: [inference] }],
      recommendedChanges: [
        { id: "rag-evaluation-gate", target: "PROJECT_PLAN.md", kind: "validation", summary: zh(locale, "把固定 RAG 评测设为第一阶段和后续模型变更的强制门禁。", "Make the fixed RAG benchmark a mandatory first stage and gate for later model changes."), rationale: zh(locale, "没有逐题引用、拒答、延迟和成本证据，无法判断检索改动是否真实变好。", "Without per-case citation, refusal, latency, and cost evidence, retrieval changes cannot be judged as real improvements.") },
        { id: "rag-injection-boundary", target: "AI_PROJECT_RULES.md", kind: "technical_reference", summary: zh(locale, "把文档内容固定为不可信证据，禁止进入系统指令和工具权限。", "Treat document content as untrusted evidence and forbid it from system instructions or tool authority."), rationale: zh(locale, "知识库文件本身可能包含恶意或误导指令。", "Knowledge-base files can contain malicious or misleading instructions.") },
        { id: "rag-delete-trace", target: "PROJECT_PLAN.md", kind: "validation", summary: zh(locale, "为资料版本到向量、缓存和引用建立可核验删除链路。", "Create a verifiable deletion chain from source version through vectors, caches, and citations."), rationale: zh(locale, "只删除原文件会留下可检索文本和向量，造成隐私与旧知识风险。", "Deleting only the raw file leaves retrievable text and vectors, creating privacy and stale-knowledge risk.") },
      ],
    },
  };
}
