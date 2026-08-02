# State Machine and Dependency Inventory

## Runtime dependencies

- React / React DOM — UI composition.
- Zod — shared client/server contracts and model-output validation.
- react-markdown + rehype-sanitize — safe Markdown preview with raw HTML disabled.
- JSZip — lazy-loaded, three-file ZIP export.

Development dependencies: Vite, strict TypeScript, Vitest, Testing Library, Playwright, jsdom, and Vercel Node types. No large UI framework or state-machine library is used.

## Transition table

| Current state | Allowed action | Next state | Gate / invalidation |
| --- | --- | --- | --- |
| `idea_input` | submit valid idea | `brief_clarification` | Idea must be non-trivial |
| `brief_clarification` | answer up to 1-3 blocking questions or receive draft | `brief_clarification` / `brief_review` | Model cannot choose the next stage in prose; response status is schema-validated |
| `brief_review` | revise BRIEF | `brief_review` | Research, PLAN, and RULES are invalidated |
| `brief_review` | explicitly confirm | `research_loading` | GitHub access is forbidden before this transition |
| `research_loading` | evidence succeeds | `research_review` | Maximum 12 candidates, maximum 5 deep reads |
| `research_loading` | skip / recoverable error | `plan_review` / `recoverable_error` | Confirmed BRIEF is preserved |
| `research_review` | select and apply changes | `plan_review` | Only selected changes are stored; BRIEF-target changes are appended after confirmation |
| `research_review` | skip | `plan_review` | No suggestion enters a formal file |
| `plan_review` | revise PLAN | `plan_review` | RULES is invalidated; BRIEF/research remain |
| `plan_review` | explicitly confirm | `rules_generation` | RULES is forbidden before this transition |
| `rules_generation` | schema + artifact gate pass | `completed` | Produces only `AI_PROJECT_RULES.md` |
| any stable state | recoverable failure | `recoverable_error` | Saves the previous stable state and all confirmed artifacts |
| `recoverable_error` | retry | previous stable state | Retries only the failed stage |
| `completed` | edit BRIEF | `brief_review` | Research, PLAN, RULES invalidated |
| `completed` | edit PLAN | `plan_review` | RULES invalidated |

The reducer ignores events that violate these transitions; UI labels are not used to infer state.
