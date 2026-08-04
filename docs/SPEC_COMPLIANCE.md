# Specification Compliance Matrix

Source: `Project_Bootstrap_Web_Competition_Edition_Spec_v1.0.docx` (2026-08-02).

Status meanings: **Verified** has direct source, command, test, or runtime evidence; **Implemented / external run pending** is present but still needs real credentials; **External delivery pending** requires a repository/deployment destination owned by the user.

| Spec section | Requirement | Current evidence | Status |
| --- | --- | --- | --- |
| 0 | BRIEF → research → PLAN → RULES; evidence restraint; explicit research approval; preview/copy/download/recovery | Reducer, four pages, Evidence schemas, ZIP helper, localStorage; unit + browser tests | Verified |
| 0.2 | No login, database, payments, multi-model routing, automatic code merge, broad search, or fourth formal file | No such dependencies/routes; artifact gate rejects common fourth-file names | Verified |
| 0.3 | Demonstrable flow | The earlier short artifact set was superseded on 2026-08-04 by the complete deterministic RAG case in `docs/DEMO_SCRIPT.md` | Product direction updated |
| 1 | Independent web repository and honest upstream disclosure | Public repository, README and `COMPETITION_CHANGELOG.md`; workspace is an independent Git repository | Verified |
| 1.2 | Pinned snapshot, source manifest, reproducible sync, CI verification | `core-source.json`, `sync-core.mjs`, `verify-core-snapshot.mjs`, CI workflow | Verified |
| 2 | Non-technical users, restrained tone, facts vs author claims vs inference | Beginner-language one-round clarification, “I am unsure” safe default, product copy, research prompt, Evidence kinds and source allow-list | Verified by tests; live model run pending |
| 3 | F1-F9 MVP functions only | Live project input plus complete RAG case, hard one-round clarification, artifacts, research, approval, export/recovery, four-repository evidence snapshot | Verified |
| 3.1 | <2s initial interaction, visible call stages, Zod, one repair, recoverable timeouts, 375px, bilingual single state machine | Lazy chunks, loading pages, structured adapter tests, mobile/English E2E | Verified locally; network timing depends on deployment |
| 4 | Code-owned explicit state machine, safe backward traversal and downstream invalidation | `src/state/machine.ts`, forward/back transition tests and `docs/STATE_MACHINE.md` | Verified |
| 5 | Research only after BRIEF confirmation; 3-6 queries; candidate/deep-read caps; README/license/manifest evidence; evidenced cards and non-binary verdict; confirmed writeback only | API gates, GitHub adapter, four-part research UI with expandable Evidence, reducer | Verified with mocked API and E2E; live run pending |
| 6 | Shared Zod domain/API models; no private reasoning storage | `src/types/domain.ts`; only messages, artifacts, compact evidence and decisions stored | Verified |
| 7 | `/api/bootstrap` and `/api/research`; specified recoverable errors | Vercel handlers, handler integration tests, retry/skip UI | Verified with mocks |
| 8 | OpenAI-compatible server adapter; phase-scoped context; JSON gates; evidence linkage; local revisions | `model.ts`, phase-scoped `core.ts`, handler context tests, artifact/evidence gates | Verified with mocks; real provider run pending |
| 9 | Server-only GitHub token, fixed UA, timeout, finite retry, size caps, api/raw host boundary, weak Star signal, honest license status | `github.ts`; retry/rate/missing-license/manifest/injection tests; deterministic license Evidence | Verified with mocks |
| 10 | Start, Clarification, Workspace, Research and Result pages; verdict first; four-part balanced assessment; expandable evidence; impact labels; labeled direct-output comparison; bright tool UI | React pages, visual browser inspection, screenshots | Verified |
| 11 | React/TS/Vite, lightweight CSS, Node serverless handlers, Zod, safe Markdown, JSZip, Vitest/RTL/Playwright, reducer | `package.json`, source tree and production build | Verified |
| 12 | Server secrets, sanitized Markdown, README injection boundary, response cap, license caveat, local-only persistence | API/client boundaries, rehype-sanitize, adapter limits, integration tests | Verified |
| 13.1 | Unit, integration, error, E2E and accessibility coverage | 34 Vitest checks + 14 Playwright scenarios, clarification/comparison/session migration/back traversal, keyboard/mobile/overflow/performance/browser-error gates | Verified locally |
| 13.2 | Ten real-model comparative cases with honest failures | Protocol and ten cases exist in `docs/EVALUATION.md` | Implemented / external run pending |
| 13.3 | Flow, research, restraint, recovery, security and deployment gates | Local gates pass; `pnpm smoke:deployment` is ready but needs a deployed origin | External delivery pending |
| 14 | Stage-by-stage implementation with actual command records | `IMPLEMENTATION_STATUS.md` and command outputs | Verified locally |
| 15.1 | Full Definition of Done including public GitHub/deployment URLs and ten real cases | Public GitHub repository exists; deployment URL and real model run remain outstanding | External delivery pending |
| 15.2 | Demo walkthrough | `docs/DEMO_SCRIPT.md` now documents the complete RAG case rather than abbreviated formal files | Product direction updated |
| 16 | README, environment example, deployment, changelog, evaluation and demo files | Root/docs artifacts present | Verified |

## Remaining completion evidence

1. Run all ten cases with a user-selected real OpenAI-compatible provider and record outputs/failures.
2. Deploy to the user-selected Vercel project, record the URL, and run the deployed smoke gate.
