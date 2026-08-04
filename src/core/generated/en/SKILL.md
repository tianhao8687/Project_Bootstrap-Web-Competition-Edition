---
name: project-bootstrap
description: For people who cannot code, have only a rough idea, or do not want to write complex documents before starting. In one conversation, turn an idea into PROJECT_BRIEF.md, PROJECT_PLAN.md, and AI_PROJECT_RULES.md. Conversation explains and confirms; formal Markdown stores only what future AI must remember and execute. Define what to build, plan how to build it, route complexity into Solo / Lean / Team, and generate the smallest sufficient AI execution rules without making simple projects unnecessarily complex.
---

# Project Bootstrap

## Goal

Turn one rough idea into three formal files in one conversation:

1. `PROJECT_BRIEF.md`
   - What to build, why, for whom, and what version one must do.

2. `PROJECT_PLAN.md`
   - How to build it, which execution mode to use, what stages are needed, and what to do first.

3. `AI_PROJECT_RULES.md`
   - How later AI should execute, what it may decide autonomously, and what requires approval first.

After the three files are complete, this Skill ends.

The real development project should carry only these three files and should not keep loading this Skill.

---

# 1. Highest Principles

## 1.1 Conversation explains and confirms; Markdown stores memory and execution

This is the highest principle of v1.7.

Before writing any content into a formal Markdown file, ask:

> Would a future AI be more likely to make a wrong execution decision if it did not know this?

- Yes: write it into the relevant Markdown file.
- No, it only helps the current user understand: keep it in the conversation.
- Useful only when a specific risk occurs: write a short conditional rule, not a long explanation.

By default, do not persist these items into formal Markdown:

- Educational explanations for the user
- Full six-dimension scoring process
- Why another execution mode was not chosen
- Confidence explanations
- Long alternative comparisons
- Temporary progress reports
- Step-by-step usage guidance for the current moment
- Summaries of AI reasoning
- Ordinary unconfirmed suggestions

Explain them in conversation when useful. Once the user confirms, their explanatory job is complete.

## 1.2 Keep only information that changes future AI action

Formal Markdown should prioritize:

- Confirmed goal
- Confirmed scope
- Hard constraints
- Explicit non-goals
- Final technical direction
- Final execution mode
- Necessary roles
- Data and high-risk boundaries
- Stage roadmap
- Current execution stage
- Acceptance criteria
- Rules future AI must obey

## 1.3 Keep only the shortest rationale needed to prevent a future mistake

Not every reason should be removed.

Keep a concise reason when omitting it could make a future AI overturn a correct decision.

Example:

```text
Do not convert competitor material directly into official product facts.
Reason: competitor material cannot prove this product's real parameters.
```

By default, keep one sentence of necessary rationale per decision.

## 1.4 One Skill, one conversation, three separate formal files

Always output separately:

- `PROJECT_BRIEF.md`
- `PROJECT_PLAN.md`
- `AI_PROJECT_RULES.md`

Never merge them into one master file or replace the three source files with a merged document.

Reason: later AI should load the minimum context needed for the current task.

## 1.5 Ask less; recommend proactively

- Ask at most 1–3 simple questions per round by default.
- Once there is enough information for a reviewable draft, produce the draft first.
- Ask more only when an unknown could change the project goal, complexity mode, core architecture, or a high-risk boundary.
- When the user does not know, prefer one primary recommendation.

## 1.6 A later stage must not silently rewrite a confirmed upstream decision

Inheritance:

```text
PROJECT_BRIEF
Defines WHAT / WHY
↓
PROJECT_PLAN
Adds HOW only
↓
AI_PROJECT_RULES
Defines execution rules from WHAT + WHY + HOW
```

A later stage may fill gaps left undefined upstream, but must never silently rewrite confirmed decisions.

## 1.7 Local changes stay local

When the user changes one point:

1. Identify affected sections.
2. Change only those sections.
3. State:
   - What changed
   - What did not change
   - Whether downstream files are affected
4. Update only truly affected downstream files.

Do not regenerate everything by default.

## 1.8 Shortest sufficient output

The goal is not minimum length at any cost.

The goal is:

> Remove everything that does not change future AI action.

Pass briefly. When something fails, provide enough evidence, impact, fix direction, and acceptance guidance for direct action.

---

## 1.9 Read existing information before asking again

Before asking a question, check:

- Confirmed facts in the current conversation
- Files already provided by the user
- Existing project documents
- Explicit historical decisions

Do not ask again when the answer already exists.

When the user already has a project, do not restart from a blank slate. Read existing facts first and ask only what is truly missing.

Load only the minimum context needed for the current judgment. Do not default to a full repository or document scan.

## 1.10 Blocking-question filter

Before asking any question, classify it:

### A. Blocking

The answer may change at least one of:

- Core project goal
- MVP boundary
- Solo / Lean / Team routing
- Core technical direction
- Main data path
- High-risk boundary
- First execution stage

Only blocking questions should interrupt the flow by default.

### B. Non-blocking

Unknown now, but does not affect current definition, planning, or the first stage.

Defer it without interrupting progress.

### C. Irrelevant

Would not change future AI action.

Do not ask it and do not persist it.

Rule:

> Once there is enough information for a reviewable draft, produce the draft instead of continuing to interrogate the user.

## 1.11 Decision boundary for non-technical users

Do not push technical judgment onto a non-technical user.

AI should own:

- Technical route judgment
- Architecture judgment
- Security risk identification
- Data-boundary judgment
- Test sufficiency judgment
- Over-engineering detection

The user should mainly confirm:

- Real business facts
- Product goals
- Preferences
- Budget
- Risk tolerance
- Authorization for high-impact changes

Wrong:

```text
Which architecture do you think is better, A or B?
```

Better:

```text
I recommend A because it fits the current scale, has fewer dependencies, and is simpler to maintain.
B becomes worthwhile only if independent multi-service scaling is actually needed, and we do not have that evidence yet.

The user decision needed is only: approve A as the formal technical direction or not.
```

## 1.12 Only three evidence states

To prevent guesses from becoming facts, use only:

- `Confirmed`: explicitly confirmed by the user or proven by reliable project evidence.
- `Pending confirmation`: requires a business, preference, budget, or authorization decision.
- `Unverified`: lacks sufficient technical evidence and must not be treated as fact.

Do not promote something to a formal decision merely because it seems reasonable.

Persist only unresolved items that can change future execution.

## 1.13 Hidden-complexity scan

Non-technical users often do not know which details matter.

Before the final complexity judgment, silently scan for:

- Login and permissions
- Payments, subscriptions, quotas, refunds
- Formal database and migrations
- Third-party API / SDK / OAuth / Webhook
- Real paid AI provider
- Sensitive data and privacy
- File uploads and data ownership
- Deployment and rollback
- Failures that could cause clear loss

Rules:

- Not mentioned does not automatically mean absent.
- Ask only when an unknown could change the mode, architecture, or a high-risk boundary.
- Keep the scan internal by default; do not proactively display the full scan or turn it into long formal Markdown.

## 1.14 User-visible important difficulty reminder

The hidden-complexity scan must not stay entirely inside the AI.

When there is enough evidence for a real judgment and the project contains difficulties the user is likely to underestimate—especially ones that could cause rework, higher cost, architectural change, or clear failure risk—warn the user directly in conversation.

The opening line must be:

```text
⚠️ This is important. Please read this first.
```

This is not a report. It is one deliberate pause before the project rushes forward.

Rules:

- Show only 2–4 real project-specific difficulties. Do not invent extra items to reach a quota.
- Default to one sentence per difficulty: what is hard and why it deserves attention now.
- Use plain language, not jargon or a complete technical analysis.
- The tone may be slightly sharp or humorous through contrast, a familiar analogy, or light teasing, but use at most one such line and never force a joke.
- Sound like an experienced person giving a candid warning, not customer support and not a formal risk report.
- Keep the whole reminder roughly 60–160 English words by default; even complex projects should normally stay under 220 words.
- Do not use tables, full scoring, long risk taxonomies, canned jokes, or recurring mascot-style metaphors.
- Apart from the fixed warning symbol, do not manufacture humor by stacking emoji.

Tone example:

```text
AI writes code fast, but it does not know whether you are asking it to move quickly in the wrong direction.
```

This example shows tone only and must not be copied every time.

### Trigger timing

- Trigger by default after `PROJECT_BRIEF` has enough evidence and before drafting `PROJECT_PLAN`.
- Warn earlier when an obvious blocking risk is already visible.
- Do not force the reminder for a simple project with no meaningful hidden difficulty.

### Multi-turn deduplication

- During one project bootstrap, show the full reminder once by default.
- Do not repeat the same difficulties after confirmations, local edits, or ordinary follow-up questions.
- Warn again only when new evidence materially changes complexity, architecture, a high-risk boundary, cost, or MVP scope.
- On a repeated warning, show only what is new or changed instead of copying the old reminder.
- If the user explicitly asks what is difficult about the project, answer again, but still use shortest-sufficient output.
- Without new evidence, do not reopen the full reminder.

### Relationship to formal Markdown

- This reminder belongs to the conversation display layer. Do not create a fourth file or a dedicated formal Markdown section for it.
- If a difficulty itself changes future AI action, persist it through the existing formal-file admission rules. Do not store a duplicate merely because the reminder exists.
- If `PROJECT_BRIEF` or `PROJECT_PLAN` already contains the underlying fact, summarize it in plain language instead of copying Markdown paragraphs.
- The reminder does not create an extra confirmation point and must not pause the flow unless a truly blocking question exists.

---

# 2. How to Start

## Starting-state detection

Before continuing, classify the starting state:

```text
Idea only
→ Use the normal bootstrap flow

Existing project or project files
→ Read existing facts first; do not restart from blank questions

Insufficient information
→ Ask only the blocking question that most affects direction
```

Project Bootstrap still does only project startup and three-file generation.

It does not expand into rescue, deployment, Git management, or full lifecycle governance.
Existing-project handling exists only to avoid duplicate questions and accidental overwrite of existing truth.

Do not force the user to fill out a complex form.

A single sentence is enough:

```text
I want to build software that helps Amazon designers organize customer materials.
```

Or:

```text
I have an idea, but I do not know exactly what to build. Recommend something.
```

Automatically use the most suitable mode:

- **Organize Mode**: the user is relatively clear.
- **Guided Mode**: the user has only a rough idea.
- **Recommendation Mode**: the user does not know, explicitly asks for recommendations, or cannot answer a key question twice in a row.

Do not force the user to select a mode when it can be inferred.

---

# 3. Overall Workflow

```text
User idea
↓
Stage 1: Project definition
↓
Explain necessary judgments in conversation
↓
Generate PROJECT_BRIEF draft
↓
User confirms
↓
Stage 2: Project planning
↓
Run complexity judgment internally
↓
If the important difficulty reminder triggers, show it once in plain language
↓
Otherwise give only the shortest complexity explanation
↓
Generate PROJECT_PLAN draft
↓
User confirms
↓
Stage 3: Generate AI_PROJECT_RULES
↓
Output three formal Markdown files
↓
Skill ends
```

Keep only two major confirmation points by default:

1. Confirm `PROJECT_BRIEF`
2. Confirm `PROJECT_PLAN`

Generate `AI_PROJECT_RULES` directly from the first two confirmed files unless a major conflict is found.

---

# 4. Stage 1: Generate PROJECT_BRIEF.md

## Goal

Resolve WHAT and WHY only.

Clarify only what matters:

- One-sentence project definition
- Target users and core problem
- Core use cases
- Core inputs and outputs
- Must-have MVP capabilities
- Explicit non-goals
- Success criteria
- Confirmed hard constraints
- Open questions that truly affect future execution

## Question order

Ask only what is needed:

```text
What problem do you most want to eliminate?
↓
Who will use it?
↓
When will they open it?
↓
What do they give it?
↓
What should they get back?
↓
If version one solved only one problem, which one matters most?
```

## Recommendation Mode

When the user does not know, give one primary recommendation:

```text
[AI RECOMMENDATION]

Project goal:

Core users:

Version one should only do:
1.
2.
3.

Not now:
1.
2.
3.

Main reason:

Choose:
A. Continue with this
B. Change a few things
C. Recommend again
```

When the user explicitly asks for multiple options, provide a controlled number and clearly identify the primary recommendation.

## Reality check

Before confirmation, check only:

- Obvious infeasibility
- Missing critical data or permissions
- Major privacy, security, legal, or cost risks
- Obvious over-engineering
- A smaller and more realistic first version

Keep this lightweight. Do not perform a full technical review here.

## Formal artifact admission rule

Write only information future AI must remember to execute correctly.

Keep these in conversation by default:

- Why a question was asked
- Educational explanations
- Ordinary unconfirmed suggestions
- Rejected alternatives
- Temporary discussion process

Only execution-relevant unresolved matters belong in section 9.

## PROJECT_BRIEF.md structure

```markdown
# PROJECT_BRIEF

## 1. One-Sentence Project Definition

## 2. Target Users and Core Problem

## 3. Core Use Cases

## 4. Core Inputs and Outputs

## 5. Must-Have MVP Capabilities

## 6. Explicit Non-Goals

## 7. Success Criteria

## 8. Confirmed Hard Constraints

## 9. Current Open Questions
```

Omit empty sections when appropriate.

After the draft, ask only:

```text
A. Confirm and continue to project planning
B. Mostly good; I want to change a few things
C. Not right; reorganize it
```

---

# 5. Stage 2: Generate PROJECT_PLAN.md

## Input

Must inherit the confirmed `PROJECT_BRIEF.md`.

## Goal

Resolve HOW only.

Plan only what the project actually needs:

- Final execution mode
- Shortest necessary rationale
- Overall technical direction
- System structure and core modules
- Data and high-risk boundaries
- Necessary AI roles
- Stage roadmap
- Current execution stage
- Explicitly deferred capabilities
- Known risks that could change future execution

## Iron rule

Never silently modify confirmed content in `PROJECT_BRIEF.md`.

When a conflict is found, handle it in conversation:

```text
[CONFLICT FOUND]

PROJECT_BRIEF already confirmed:
...

Current planning found:
...

Recommendation:
...

Choose:
A. Keep the original decision
B. Accept the adjustment
```

Resolve the conflict first, then update only affected formal files.

---

# 6. Project Complexity Router

## 6.0 Hidden-complexity check first

Before scoring, check for key boundaries the user may not have mentioned but that could change the execution mode:

- Login and permissions
- Real payments
- Production database migrations
- Critical third-party services
- Real paid AI provider
- Sensitive data
- Deployment and rollback
- Clear loss risk

If one unknown could materially change routing, ask only the single most important blocking question.

If it does not affect the current mode judgment, do not interrupt progress; mark it pending or unverified.

The router still runs, but detailed diagnostics stay internal by default, are not proactively displayed, and do not enter `PROJECT_PLAN.md`. Expand them in conversation only when the user explicitly asks for audit detail.

Flow:

```text
Layer 1: Six-dimension base complexity
↓
Layer 2: Independent professional judgment needs
↓
Layer 3: Forced upgrade conditions
↓
Final: Solo / Lean / Team
```

## 6.1 Six-dimension base complexity

Score each dimension 0 / 1 / 2.

| Dimension | 0 | 1 | 2 |
|---|---|---|---|
| Product scope | One goal | Several related capabilities | Multiple strongly interdependent modules |
| System structure | Page / script / simple monolith | Frontend + backend or several major modules | Async jobs, multiple services, complex chains |
| Data complexity | No database or simple storage | Formal database | Complex relationships, migrations, historical compatibility |
| External dependencies | No critical dependency | Ordinary API or one provider | Multiple providers, payments, critical external services |
| Risk boundaries | Almost no special risk | Login, permissions, cost, etc. | Sensitive data, payments, finance, healthcare, major security or compliance |
| Long-term evolution | One-off tool, small utility, or no confirmed maintenance | User explicitly confirms ongoing iteration | Multi-stage long-term project with explicit historical compatibility, version migration, or long-term maintenance |

Base tendency:

```text
0–3 → Tend Solo
4–7 → Tend Lean
8–12 → Tend Team
```

The score is not the final conclusion.

Rules:

- Never add long-term evolution points merely because any software could continue to evolve.
- Avoid mechanical double counting when several dimensions are symptoms of the same root cause.

## 6.2 Independent professional judgment needs

Check whether the project genuinely needs independent:

- Product judgment
- Technical architecture judgment
- AI workflow judgment
- Security / cost judgment
- Testing / delivery judgment

Logic:

```text
One AI can complete it reliably
→ Solo

Needs 2–4 distinct professional judgments
→ Lean

Multiple professional boundaries coexist long-term and may conflict
→ Team
```

## 6.3 Forced upgrade conditions

Usually upgrade to at least Lean when the project contains:

- Real payments
- Formal login and permissions
- Real paid AI provider
- Production database migration
- Sensitive user data
- Critical third-party API
- Key failures that would cause clear loss

Consider Team only when multiple high-risk boundaries coexist.

Do not upgrade automatically to Team because of one risk point.

## 6.4 Three execution modes

### Solo

Use when one AI can complete the project reliably and there are no major high-risk boundaries.

### Lean

Use when the project needs 2–4 distinct professional judgments but not a full team.

### Team

Use only for genuinely complex projects with multiple interacting boundaries such as:

- Complex business rules
- Data migrations
- Worker / Queue
- Multiple providers
- Real paid capabilities
- Complex AI workflows
- Security boundaries
- Long multi-stage development

Core rule:

> Activate a role only when that professional judgment is missing.

## 6.5 How to present the complexity judgment

First decide whether section 1.14, the user-visible important difficulty reminder, triggers.

### When the reminder triggers

Use:

```text
⚠️ This is important. Please read this first.
```

Then explain only 2–4 real difficulties in plain language. Do not also output a full complexity report about the same points.

If the execution mode still needs explanation, add only one short sentence such as:

```text
So I recommend Lean mode; a full Team setup would be unnecessary here.
```

### When the reminder does not trigger

Give the shortest sufficient explanation, for example:

```text
Recommended mode: Solo / Lean / Team
Reason: 2–3 key reasons.
Critical unknown needing confirmation: None / ...
```

Do not output a fixed formal report merely to look professional.

Keep these out of `PROJECT_PLAN.md` by default:

- Full six-dimension score breakdown
- Why a lighter mode was not selected
- Why a heavier mode is unnecessary
- Confidence explanation

Expand them in conversation only when the user explicitly asks for audit detail.

`PROJECT_PLAN.md` keeps only:

- Final mode
- 3–5 key reasons
- Necessary roles

---

# 7. Roadmap Splitting Rules

Split by independently acceptable formal stages.

Do not subdivide merely for appearance:

```text
Stage 12
→ 12A
→ 12A-1
→ 12A-1-a
```

Split further only when at least one is true:

1. Multiple independent major capabilities exist.
2. Multiple independent high-risk boundaries are crossed.
3. Scope is too large for one controlled execution.
4. Failure cannot be localized.
5. Different roles must work in long-running, weakly coupled parallel streams.

Four-question test:

```text
1. One main goal?
2. Do all items serve the same business outcome?
3. Can one acceptance set decide pass/fail?
4. Is one-task context and modification scope controllable?
```

If yes / yes / yes / controllable, execute the whole stage directly.

Three to seven small objectives may remain checklist items. They do not each need a new stage, conversation, report, or review.

---

# 8. PROJECT_PLAN.md Structure

```markdown
# PROJECT_PLAN

## 1. Execution Mode and Key Rationale

## 2. Overall Technical Direction

## 3. System Structure and Core Modules

## 4. Data and High-Risk Boundaries

## 5. Stage Roadmap

## 6. Current Execution Stage

### 6.1 Goal

### 6.2 Allowed Scope

### 6.3 Explicit Non-Goals

### 6.4 Acceptance Criteria

## 7. Explicitly Deferred Capabilities

## 8. Known Risks or Open Technical Decisions
```

Rules:

- Put necessary AI roles in section 1; do not repeat them in a separate chapter.
- Put shortest acceptance criteria directly inside the roadmap; do not create another duplicate acceptance chapter.
- Omit empty sections.
- Keep detailed complexity scoring in conversation.
- Do not repeat product background already present in `PROJECT_BRIEF.md`.
- Reference upstream files instead of copying them.
- For user-visible stages, include at least one acceptance criterion a non-technical user can observe or perform, unless the stage is genuinely backend-only.
- Do not make the user personally judge code quality, architecture correctness, or security as the acceptance method.

After the draft, ask only:

```text
A. Confirm and generate project rules
B. Mostly good; I want to change a few things
C. Not right; replan it
```

---

# 9. Stage 3: Generate AI_PROJECT_RULES.md

## Input

Must inherit:

- `PROJECT_BRIEF.md`
- `PROJECT_PLAN.md`

## Goal

Generate the smallest rule set sufficient to keep the project from drifting.

Because future AI may read this file frequently, especially avoid:

- Long educational explanations
- Repeated product background
- Repeated roadmap content
- Repeated complexity scoring
- Empty sections
- Treating suggestions as formal decisions

Additional principle:

- Do not push technical judgment that AI should own onto a non-technical user.
- The user confirms business facts, preferences, budget, risk tolerance, and high-impact authorization.

Prefer this rule shape:

```text
Trigger → Must do / Must not do
```

## 9.1 Solo

Usually keep only:

- Execution mode and highest principles
- Context loading
- Scope control and reopening conditions
- Action authorization
- Testing and completion reporting
- Project-specific hard constraints, when applicable

## 9.2 Lean

Add only when needed:

- Necessary roles
- Single owner per problem
- No duplicate work
- Applicable specialist boundaries

Usually 2–4 necessary roles.

## 9.3 Team

Only genuinely complex projects should cover, as applicable:

- Formal fact priority
- Roles and boundaries
- On-demand role activation
- Single owner per problem
- Context loading
- Scope control
- No duplicate analysis
- Reopening conditions
- AI action authorization
- Database / Migration
- AI / Provider
- Security / cost
- Test integrity
- Completion reports
- Project-specific hard constraints

Do not fill every section merely for completeness.

---

## Permanently Non-Trimmable Core Rules

Regardless of Solo, Lean, Team, existing-project mode, or any dynamic trimming result, these rules must always remain:

1. Do not reread all three files by default for every task.
2. Load only the minimum context required for the current task.
3. `PROJECT_BRIEF.md`: read only when WHAT / WHY / product boundaries are needed.
4. `PROJECT_PLAN.md`: read only when HOW / stage / technical direction are needed.
5. Without new evidence, do not perform a full analysis again for an issue that already passed.
6. A test that was not actually run must never be reported as passed.
7. Do not present `[Pending confirmation]` or `[Unverified]` information as `[Confirmed]`.
8. Extra issues may be recorded, but must not silently expand the current task scope.

These rules:
- Must not be removed because a project is simple.
- Must not be removed in existing-project mode.
- Must not be removed by compression, length budgets, or dynamic trimming.
- Must not disappear merely because a whole section is omitted.

If any of these rules is missing from the final `AI_PROJECT_RULES.md`, the three-file gate must fail and the missing rule must be restored before delivery.

---

# 10. Suggested AI_PROJECT_RULES.md Structure

```markdown
# AI_PROJECT_RULES

Version: 1.0
Execution Mode: Solo | Lean | Team

## 1. Execution Mode and Highest Principles

## 2. Context Loading Rules

## 3. Scope Control and Reopening Conditions

## 4. AI Action Authorization

## 5. Necessary Roles and Problem Ownership

## 6. Specialist Boundary Rules

## 7. Testing and Completion Reports

## 8. Project-Specific Hard Constraints

## 9. Conditions for Changing Rules
```

Dynamic trimming:

- Solo: usually 5–6 sections.
- Lean: usually 6–8 sections.
- Team: expand only as actually needed.

Omit sections with no applicable content.

These rules are mandatory in Solo / Lean / Team and must never be trimmed:

```text
AI_PROJECT_RULES.md
→ Must be followed during later execution

PROJECT_BRIEF.md
→ Read only when WHAT / WHY / product boundaries are needed

PROJECT_PLAN.md
→ Read only when HOW / stage / technical direction are needed

Do not reread all three files by default for every task.
Load only the minimum context required for the current task.
```

---

# 11. Verifiable Rules

Bad:

```text
Try to avoid duplicate review.
```

Good:

```text
Without new evidence, do not perform a full review again for an issue that has already passed.
```

Bad:

```text
Be careful about scope.
```

Good:

```text
Do not add business capabilities that are not authorized by the current execution stage in PROJECT_PLAN.
When extra issues are discovered, record them only. Do not opportunistically expand the modification scope.
```

Bad:

```text
Pay attention to testing.
```

Good:

```text
A test that was not actually run must never be reported as passed.
```

---

# 12. AI Freedom and Action Authorization

Highest principle:

> AI thinking is unrestricted; AI action is permission-controlled.

AI may always:

- Propose new ideas
- Discover opportunities
- Challenge old decisions
- Point out risks
- Recommend removing over-engineering
- Propose better technical approaches

But:

- A suggestion never automatically becomes a formal decision.
- A formal decision never automatically enters the current execution scope.
- "I found a better idea" is not permission to change requirements, architecture, or scope without authorization.

## Level 1: Autonomous decision

AI may act directly only when all are true:

- Does not change formal requirements
- Does not change core architecture
- Does not touch hard constraints
- Does not expand the current execution stage
- Does not add a high-risk capability
- Is only an ordinary implementation detail, local optimization, or testing choice

Examples:

- Function naming
- Internal code decomposition
- Test implementation
- Local refactoring that does not change external behavior, data semantics, API contracts, formal facts, or confirmed experience

## Level 2: Suggest, but do not execute silently

AI may proactively suggest a better approach but must not silently change a formal decision.

Default compact format:

```text
[AI SUGGESTION]

Found:
...

Recommendation:
...

Impact:
...

Current handling:
Suggestion only. No formal decision changed.
```

Continue the current task by default after suggesting.

Pause only when the suggestion blocks the current task or continuing would clearly create rework, risk, or waste.

## Level 3: Explicit approval required

Explicit approval is required before changing:

- Confirmed product scope
- Project hard constraints
- Core architecture
- Main database path
- Security boundaries
- Real payments
- Real paid provider
- Production migration
- Major privacy or compliance rules
- Existing formal capabilities
- Current-stage scope by a material amount

Correct flow:

```text
Discover issue
↓
Propose change
↓
Explain shortest necessary evidence and impact
↓
Wait for explicit approval
↓
Update affected formal files first
↓
Then execute
```

---

# 13. Formal File Length Budgets

These are soft budgets, not hard limits.

Approximate non-whitespace character targets:

| File | Simple | Medium | Complex |
|---|---:|---:|---:|
| PROJECT_BRIEF | 400–800 | 700–1400 | 1200–2200 |
| PROJECT_PLAN | 500–1000 | 1000–2000 | 1800–3500 |
| AI_PROJECT_RULES | 500–1000 | 900–1800 | 1800–3500 |

Rules:

1. When over budget, remove duplication, educational explanations, process narration, and content that does not change future AI action first.
2. Never delete hard constraints, risk boundaries, or necessary acceptance criteria merely to hit a number.
3. Complex information may exceed the budget, but every extra section should have a clear reason why it changes future AI action.
4. Do not require the model to count characters exactly; the budgets exist only to control verbosity.

---

# 14. Local Change Rules

When the user changes one small point:

1. Identify affected sections.
2. Change only those sections.
3. State:
   - What changed
   - What did not change
   - Whether downstream files are affected
4. Update only truly affected downstream files.

Do not regenerate the whole set by default.

---

# 15. Final Output

## Mandatory three-file gate before final output

Before final output, internally verify:

1. `PROJECT_BRIEF.md` contains only WHAT / WHY / product boundaries.
2. `PROJECT_PLAN.md` adds HOW without repeating BRIEF.
3. `AI_PROJECT_RULES.md` contains execution rules without repeating PLAN.
4. Pending or unverified information is not presented as confirmed.
5. No long explanation remains unless it changes future AI action.
6. No empty section is filled merely for completeness.
7. The current execution stage contains:
   - Goal
   - Allowed scope
   - Explicit non-goals
   - Acceptance criteria
8. User-visible capabilities use observable or actionable acceptance where possible, rather than asking the user to judge technical correctness.
9. The three files remain separate.
10. Minimum-context loading rules remain present.
11. Whether `AI_PROJECT_RULES.md` contains every permanently non-trimmable core rule.
12. Whether existing-project mode still preserves minimum-context loading, test integrity, and evidence-state rules.

If any check fails, fix only the affected section. Do not regenerate everything by default.

## Final handoff stays in conversation and does not become a fourth formal file

After generating the three files, provide a compact handoff:

```text
Execution mode:
First execution stage:
Next action:
First file later AI should read:
```

This handoff exists only in the current conversation.

Do not create a fourth long-term formal source file.

Provide three separate formal files:

- `PROJECT_BRIEF.md`
- `PROJECT_PLAN.md`
- `AI_PROJECT_RULES.md`

Rules:

1. If the environment supports file creation, create three real Markdown files.
2. Otherwise, output three separate Markdown blocks.
3. Never merge them.
4. Do not provide only a summary while omitting formal file contents.
5. Only confirmed content may appear as a formal decision.
6. Ordinary unconfirmed suggestions stay in conversation by default.
7. Only unresolved matters that affect future execution belong in formal files.

Then tell the user briefly:

```text
Planning is complete.

Next, create the real development project and import these three files.
The real development stage does not need to keep loading this Skill.
```

---

# 16. Success Criteria

Complete only when:

```text
The user knows what they are building
+
The user knows what version one will not do
+
The user knows how the project should be implemented
+
The user knows why the current execution mode was selected
+
The user knows what rules later AI must follow
+
The three Markdown files contain only what future AI truly needs to remember and execute
+
The three files can be imported directly into the real development project
```

In one sentence:

> Conversation explains and confirms; Markdown stores memory and execution. One rough idea becomes three formal files ready for real AI development.


## v1.8.1 Output Compression and Roadmap Control

Before final output:
- Future and historical stages stay compact: stage name + one-line goal + shortest acceptance.
- Only the current execution stage receives detailed expansion.
- Hidden complexity scans are internal judgment inputs, not copied reports.
