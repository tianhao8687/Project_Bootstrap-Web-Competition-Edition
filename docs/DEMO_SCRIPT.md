# Complete RAG Knowledge-Base Demo

## Before presenting

- Use a desktop browser for the clearest artifact review; the same flow remains responsive on mobile.
- Select **Complete case**. This deterministic case needs no model or GitHub credentials.
- Start from a cleared local session.

## Walkthrough

### 1. Start with beginner language

Open the case with: “I want to save my notes and knowledge somewhere so I can ask questions about them later.” Point out that the user does not need to know the words RAG, vector database, or tenant access.

The product asks one clarification round about the material and whether it may be shared later. Choose **Personal first, team later** or **I am unsure — use safe defaults**. Show that the answer is editable, the recommendation is labeled, and non-blocking unknowns will be marked pending instead of triggering more conversation.

Use **Back one step** once to show that the original idea and clarification answer are restored. Explain that going back invalidates only downstream work, so revised answers cannot silently reuse stale artifacts.

### 2. Review PROJECT_BRIEF.md

Show the target users, inputs and outputs, MVP capabilities, explicit non-goals, measurable success criteria, hard constraints, and the `[Pending]` / `[Unverified]` items. Confirm the BRIEF only after the product boundary is clear.

### 3. Review the open-source reality check

Show the fixed evidence snapshot for LangChain, LlamaIndex, pgvector, and Haystack. Expand evidence to demonstrate that README claims remain author claims and repository content is never treated as instructions.

Select the fixed RAG benchmark recommendation. Point to the affected formal file and the pending-change summary before applying it.

### 4. Review PROJECT_PLAN.md

Show that the project is routed to **Team** because it combines tenant access, production data, asynchronous workers, AI providers, sensitive internal material, and auditable deletion.

Review the concrete stack:

- React + TypeScript + Vite
- Python 3.12 + FastAPI
- PostgreSQL + pgvector
- S3-compatible object storage
- Redis + workers
- Provider adapters, deterministic mocks, pytest, Vitest, Playwright, and a versioned RAG benchmark

Then show the five-stage roadmap and the fully expanded current stage, including allowed scope, explicit non-goals, and observable acceptance criteria.

### 5. Review AI_PROJECT_RULES.md

Confirm PLAN and show the complete execution rules: eight permanent rules, three authorization levels, issue ownership, database and migration rules, prompt-injection boundaries, tenant filtering, citation and refusal gates, privacy and cost controls, testing, hard constraints, and rule-change conditions.

### 6. Compare with direct one-sentence output

On the final page, expand the labeled illustrative baseline. Compare its generic feature list with the confirmed scope, evidence, authorization, citation/refusal benchmark, deletion chain, current stage, and permanent AI rules. Do not present this baseline as a live model benchmark.

### 7. Hand off the three files

Show individual copy/download and **Download all ZIP**. The handoff contains exactly:

- `PROJECT_BRIEF.md`
- `PROJECT_PLAN.md`
- `AI_PROJECT_RULES.md`

Close with: “Direct output finds a direction. Project Bootstrap turns that direction into a product plan AI can execute safely.”

## Honest limitation line

“The complete case uses a labeled deterministic RAG evidence snapshot. Live generation uses the configured model and current GitHub data, where provider variation and rate limits remain explicit recoverable states.”
