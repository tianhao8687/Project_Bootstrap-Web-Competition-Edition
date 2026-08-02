# THREE_MD_PIPELINE_SPEC

## Core Positioning

One Skill, one conversation, three separate formal outputs:

1. `PROJECT_BRIEF.md`
2. `PROJECT_PLAN.md`
3. `AI_PROJECT_RULES.md`

## v1.7 Highest Principle

> Conversation explains and confirms; Markdown stores memory and execution.

Before any content enters a formal Markdown file, ask:

> Would a future AI be more likely to make a wrong execution decision if it did not know this?

- Yes: persist it.
- No, it only helps the current user understand: keep it in conversation.
- Useful only for a specific risk: write a short conditional rule.

## v1.8 Addition: Evidence-First Intake and Blocking-Question Filter

### Read existing facts first

Before asking, check:

- Current conversation
- User-provided files
- Existing project documents
- Confirmed historical decisions

Do not ask again when the answer already exists.

If the user already has a project, read only the minimum existing facts needed for the current judgment. Do not restart from blank and do not default to a full scan.

### Ask only blocking questions

Classify unknowns as:

- `Blocking`: may change goal, MVP, execution mode, core technical direction, main data path, high-risk boundary, or first execution stage.
- `Non-blocking`: can be deferred without affecting startup.
- `Irrelevant`: would not change future AI action.

Only blocking questions interrupt the flow by default.

### Non-technical users do not own technical correctness

AI should own technical route, architecture, security, data-boundary, test-sufficiency, and over-engineering judgment.

The user mainly confirms:

- Real business facts
- Product goals and preferences
- Budget
- Risk tolerance
- Authorization for high-impact changes

### Three evidence states

Use only:

- `Confirmed`
- `Pending confirmation`
- `Unverified`

Do not turn something into a formal fact merely because it seems reasonable.

### Hidden-complexity scan

Before the final complexity judgment, silently check:

- Login and permissions
- Payments, subscriptions, quotas, refunds
- Formal database and migrations
- Third-party API / SDK / OAuth / Webhook
- Real paid AI provider
- Sensitive data and privacy
- File uploads and data ownership
- Deployment and rollback
- Clear loss risk

Ask only when an unknown could change the mode, architecture, or a high-risk boundary.

### User-visible important difficulty reminder

The hidden-complexity scan must not stay entirely internal.

When there are real difficulties the user is likely to underestimate and they could cause rework, higher cost, architectural change, or clear failure risk, show this once in conversation:

```text
⚠️ This is important. Please read this first.
```

Then give only 2–4 key difficulties, usually one sentence each. Use plain language. The tone may be slightly sharp or humorous, but allow at most one light analogy or teasing line. Do not turn it into a report, pile on jargon, or force jokes.

Keep it roughly 60–160 English words by default and normally under 220 words even for complex projects.

Multi-turn rules:

- Show the full reminder once per bootstrap by default.
- Without new evidence, do not repeat the same difficulties.
- Warn again only when new evidence materially changes complexity, architecture, a high-risk boundary, cost, or MVP scope, and show only what is new or changed.
- If the user explicitly asks about project difficulties, answer again but still keep it shortest-sufficient.

This reminder belongs only to the conversation display layer:

- Do not create a fourth file.
- Do not create a dedicated formal Markdown section.
- If a difficulty changes future AI action, persist it through the normal formal-file admission rules without duplication.
- The reminder itself does not create an extra confirmation point or pause the flow unless a real blocking question exists.

## Data Flow

```text
PROJECT_BRIEF
Defines WHAT / WHY
↓
PROJECT_PLAN
Inherits BRIEF and adds HOW only
↓
AI_PROJECT_RULES
Inherits BRIEF + PLAN and adds execution rules only
```

A downstream stage may fill gaps left undefined upstream but must never silently rewrite confirmed upstream decisions.

## Formal Artifact Admission

Persist by default:

- Confirmed goal and scope
- Hard constraints
- Explicit non-goals
- Final technical direction
- Final execution mode
- Necessary roles
- Data and high-risk boundaries
- Stage roadmap
- Current stage
- Acceptance criteria
- Rules future AI must obey

Keep in conversation by default:

- Educational explanations
- Full six-dimension scoring process
- Why other modes were rejected
- Confidence explanations
- Long alternative comparisons
- Temporary progress reports
- AI reasoning summaries
- Ordinary unconfirmed suggestions

## Necessary Rationale

Keep only the shortest reason required to prevent a future AI from making a wrong decision or overturning a correct one.

## Complexity Router

Three layers:

1. Six-dimension base complexity
2. Independent professional judgment needs
3. Forced upgrade conditions

Final modes:

- Solo: one AI, shortest rules
- Lean: a few necessary roles
- Team: full governance only for genuinely complex projects

Detailed scoring stays in conversation by default. `PROJECT_PLAN.md` keeps only final mode, 3–5 key reasons, and necessary roles.

## Mandatory Three-File Separation

The three formal source files must remain separate.

Reason: later AI should load only the minimum context needed for the current task.

```text
Need WHAT / WHY / product boundaries
→ PROJECT_BRIEF.md

Need HOW / stage / technical direction
→ PROJECT_PLAN.md

Executing real development
→ Follow AI_PROJECT_RULES.md
```

Do not reread all three files by default.

## PROJECT_PLAN Deduplication

- Do not persist the full six-dimension score.
- Do not separately repeat complexity judgment, recommended mode, and necessary roles.
- Put shortest acceptance criteria directly in the roadmap.
- Do not repeat product background from BRIEF.
- Reference upstream files instead of copying them.

## AI_PROJECT_RULES Deduplication

Keep only:

- Trigger
- Must do
- Must not do
- Shortest rationale required to prevent a mistake

Do not write long educational explanations or repeat product background, roadmap content, or complexity scoring.

## Length Budgets

Soft budgets, not hard limits:

| File | Simple | Medium | Complex |
|---|---:|---:|---:|
| PROJECT_BRIEF | 400–800 | 700–1400 | 1200–2200 |
| PROJECT_PLAN | 500–1000 | 1000–2000 | 1800–3500 |
| AI_PROJECT_RULES | 500–1000 | 900–1800 | 1800–3500 |

When over budget, remove duplication, teaching explanations, process narration, and content that does not change future AI action first.

Never remove hard constraints, risk boundaries, or necessary acceptance criteria merely to hit a number.

## Final Three-File Gate

Before output, verify:

1. BRIEF contains only WHAT / WHY / product boundaries.
2. PLAN adds HOW without repeating BRIEF.
3. RULES contains execution rules without repeating PLAN.
4. Pending or unverified information is not presented as confirmed.
5. No long explanation remains unless it changes future AI action.
6. No empty section is filled merely for completeness.
7. The current stage includes goal, allowed scope, explicit non-goals, and acceptance criteria.
8. User-visible capabilities use observable or actionable acceptance where possible.
9. The three files remain separate.
10. Minimum-context loading rules remain present.

If a check fails, fix only the affected part instead of regenerating everything.

Final handoff stays in conversation and does not become a fourth formal file.

## Default Confirmation Points

Keep only two:

1. Confirm `PROJECT_BRIEF`
2. Confirm `PROJECT_PLAN`

Generate `AI_PROJECT_RULES` directly by default unless a major conflict is found.

## Local Updates

When the user changes one part, update only affected sections and truly affected downstream files. Do not regenerate everything by default.

## Exit Condition

After the three Markdown files are generated, the Skill ends.

The real development project imports only the three formal files and does not keep loading this Skill.


## Permanent Core Rule Gate

`AI_PROJECT_RULES.md` must always contain all of these:

1. Do not reread all three files by default.
2. Load only the minimum context for the current task.
3. State when BRIEF should be read.
4. State when PLAN should be read.
5. Do not reopen passed issues without new evidence.
6. Never report unrun tests as passed.
7. Do not present pending or unverified information as confirmed.
8. Do not expand current scope merely because extra issues were found.

If any rule is missing, the output gate fails.
