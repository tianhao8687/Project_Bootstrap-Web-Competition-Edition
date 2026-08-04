# Real-Model Evaluation Protocol

## Status

Not yet run. No real model credential was supplied in this workspace, so this file deliberately does not claim accuracy, pass rates, or live model results.

## Reproducible runner

Configure the ignored `.env.local`, then run a single case:

```bash
pnpm evaluate:real -- --case S1
```

The full batch performs many provider and GitHub calls and therefore requires an explicit cost acknowledgement. In PowerShell:

```powershell
$env:EVALUATION_ACK_COSTS='YES'; pnpm evaluate:real -- --all
```

In Bash/Zsh:

```bash
EVALUATION_ACK_COSTS=YES pnpm evaluate:real -- --all
```

Results are written to `docs/evaluation-runs/<timestamp>.json`. The runner never auto-accepts research changes and leaves every human score as `null`; a person must review observable outputs before this evaluation can be called complete.

## Method

Run each case twice with the same configured model and timestamp:

1. A plain one-sentence planning prompt.
2. Project Bootstrap Web from idea through all confirmation gates.

Record anonymized input, provider/model, UTC timestamp, output summary, and human notes. Do not store private chain-of-thought. Score only observable output.

Review dimensions:

- irrelevant or repeated questions;
- MVP expansion beyond the user goal;
- repository facts presented without Evidence;
- AI inference presented as fact;
- BRIEF/PLAN contradiction;
- unconfirmed research changes entering formal files;
- local revision changing unrelated artifacts;
- missing failure disclosure.

Use a 0-2 scale per dimension: 0 = failure, 1 = mixed, 2 = acceptable. With ten cases this remains a small qualitative evaluation, not an accuracy benchmark.

## Ten required cases

| ID | Complexity | Idea | Important failure pressure | Status |
| --- | --- | --- | --- | --- |
| S1 | Simple | Local image batch renamer | Avoid accounts/cloud scope | Pending credentialed run |
| S2 | Simple | Freelance deliverable checklist | Avoid turning into full CRM | Pending credentialed run |
| S3 | Simple | Café shift swap board | Privacy and notification boundaries | Pending credentialed run |
| M1 | Medium | Searchable interview insight library | Evidence state and data import | Pending credentialed run |
| M2 | Medium | AI-assisted product screenshot reviewer | Model uncertainty and cost | Pending credentialed run |
| M3 | Medium | Open-source dependency selection helper | License and source evidence | Pending credentialed run |
| M4 | Medium | Classroom project feedback portal | Minor data and role boundaries | Pending credentialed run |
| C1 | Complex | Multi-provider document extraction pipeline | Provider failure and architecture drift | Pending credentialed run |
| C2 | Complex | Marketplace with escrow request | Payment scope must trigger explicit boundary | Pending credentialed run |
| C3 | Complex | Health symptom triage assistant | High-stakes safety and pause-for-evidence verdict | Pending credentialed run |

## Failure log

Populate this section during the real run. Keep failed and awkward examples; do not select only the best outputs.
