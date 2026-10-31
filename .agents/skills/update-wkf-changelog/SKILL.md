---
name: update-wkf-changelog
description: Update this project's CHANGELOG.md from newer commits on master when explicitly invoked. Never update the changelog automatically or as a side effect of other work.
---

# Update the WKF changelog

Extend the root `CHANGELOG.md` only when the user explicitly requests this update or invokes `$update-wkf-changelog`. Do not create schedules, hooks, background jobs, or automatic changelog updates.

## Select commits

1. Read `CHANGELOG.md` and resolve the commit hash from its last release entry.
2. Verify that commit is an ancestor of the local `master` branch.
3. Inspect every newer commit through `master`, ordered from oldest to newest. Review the commit subject, body, and diff rather than relying on the subject alone.
4. Add exactly one release entry per commit. Do not combine, omit, or reorder commits.
5. If there are no newer commits, leave the file unchanged and report that it is current.

Do not fetch, pull, switch branches, or modify `master` unless the user separately requests it. If the last documented commit cannot be resolved or is not an ancestor of `master`, stop and explain the mismatch instead of guessing the range.

## Assign versions

Continue from the latest documented version and never increase the major version.

- Increase the patch version for bug fixes, CSS or presentation corrections, maintenance changes, small adjustments, and minor infrastructure or scheduling refinements.
- Increase the minor version for new visitor, editor, administration, or substantial operational functionality.
- When a commit contains changes of different significance, use the highest applicable increase.

Preserve existing release versions and entries unless the user explicitly asks to revise them.

## Write release entries

Follow the existing changelog layout and write in English, as required by the repository documentation policy.

- Give each release a concise title, date, and short commit hash.
- Explain the purpose and observable effect for website visitors, editors, or administration-panel users.
- For infrastructure changes, explain why the change matters to the application, such as its effect on availability, reliability, recovery, cost, or security.
- Omit implementation details such as migrations, schemas, tables, generated files, framework internals, cache mechanics, manifests, or file-by-file changes unless they are essential to understanding the outcome.
- Use one short paragraph when the commit delivers one coherent change.
- Use an unordered list when the commit combines distinct changes. Give each distinct change its own outcome-focused bullet, then place the commit hash after the list so it does not appear to belong to only one bullet.
- Do not claim benefits or user-visible behavior that the diff does not support.

Append entries after the current final entry so the file remains chronological from the public release toward newer releases.

## Validate and report

- Confirm that the added hashes exactly match the selected commit range and order.
- Confirm that every selected commit has one entry and one version.
- Run the narrowest relevant formatting check, then run the repository-required `pnpm format`.
- Do not run application tests for a documentation-only update unless another change makes them relevant.
- Preserve unrelated working-tree changes.
- Report the added release range, assigned versions, changed files, assumptions, and exactly what was and was not validated.
