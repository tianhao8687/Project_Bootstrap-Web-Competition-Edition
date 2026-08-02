# Deployment Guide

## Vercel

1. Import this repository as a Vite project.
2. Use Node.js 20 or newer and pnpm.
3. Add `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, and optionally `GITHUB_TOKEN` as server environment variables.
4. Add `APP_MAX_RESEARCH_REPOS=5` and `APP_REQUEST_TIMEOUT_MS=30000` unless stricter limits are desired.
5. Deploy and verify `/`, `/api/bootstrap`, and `/api/research` from the same origin.

Run the non-credentialed structural smoke gate first:

```bash
pnpm smoke:deployment -- https://your-project.vercel.app
```

This checks the application shell, API method/input gates, and accidental server-variable-name exposure. It does not replace the credentialed live BRIEF → research → PLAN → RULES check below.

Do not prefix secrets with `VITE_`; Vite exposes such variables to browser bundles.

## Smoke gate

- New browser session opens in under two seconds on a normal connection.
- Demo mode completes without credentials.
- Live mode generates and confirms BRIEF before any GitHub request.
- Research returns 3-5 evidenced repositories or an honest no-result/rate-limit state.
- PLAN and RULES are gated by explicit confirmation.
- Refresh restores the session; clear-local-data removes it.
- The result screen copies and downloads exactly the three formal Markdown files.

## Rollback

Deployments are stateless. Roll back to the previous Vercel deployment if a server adapter regresses. Do not change the generated core snapshot manually; revert or resynchronize through `scripts/sync-core.mjs` and review `core-source.json`.
