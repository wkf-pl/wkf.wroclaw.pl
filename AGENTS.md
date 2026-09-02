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

## Development servers and previews

- Never leave development servers, preview servers, Playwright web servers, or other long-running background processes running after completing a task.
- Use `WKF_ALLOW_NEXT_DEV=1 pnpm preview:temporary -- <port>` for a temporary Next.js preview. Set this opt-in only for local development commands, use a dedicated port in the `3100-3199` range, and do not run `next dev` directly as an unattended background process.
- The temporary preview helper must remain in the foreground. It limits the preview lifetime, records the process group, terminates the entire group on exit, verifies that the port is no longer listening, and removes the dedicated `tmp/wkf-preview-next-<port>` directory.
- If a long-running process cannot use the helper, record its process group when starting it, install cleanup traps, terminate the entire process group before completing the task, and verify that every task-created listening port is closed.
- Before completing a task that started local services, run `ss -ltnp | grep -E ':31[0-9][0-9]\\b'` and confirm that no task-created preview remains.
