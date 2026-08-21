# AGENTS.md

## Documentation policy
- Update documentation only when asked to.
- Use `.agents/skills/package-docs` for root `README.md`, `app/README.md`, `docs/`, and documentation snippets.
- Do not force documentation edits for purely internal changes with no user-facing or maintainer-facing impact.

## TypeScript and design

- Prefer TypeScript strict-mode compatible code and avoid `any`.
- Prefer explicit names over abbreviations.
- Prefer explicit return types in public functions and services when they improve readability.

## Tests and validation

- Prefer focused unit tests for isolated logic and broader integration or e2e coverage when changes cross module or transport boundaries.
- When fixing a bug, first add a test that reproduces it, then make it pass.
- At the end of the task, summarize changed files, explain the approach, mention risks or follow-up work, and state exactly what was and was not validated.
