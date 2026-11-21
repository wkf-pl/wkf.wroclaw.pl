---
name: update-wkf-changelog
description: Update the WKF CHANGELOG.md from confirmed production application deployments when explicitly requested. Use deployment history rather than merges to master.
---

# Update the WKF changelog

Update the root `CHANGELOG.md` only when the user explicitly requests it or invokes this skill. Preserve existing releases unless the user asks to revise them. The public release is `1.0.0`.

## Identify production releases

1. Read the last changelog entry and match it to an actual production deployment. Use GitHub Actions history for `.github/workflows/deploy-production.yml` and check the run summary or job logs for the phase and deployed source SHA. The workflow's head SHA alone does not establish what was deployed. For deployments outside GitHub Actions, use Azure revision history, logs, and recorded deployment details to confirm what actually served production traffic.
2. Select each subsequent completed deployment that released a distinct application version to production, in deployment order. Include verified manual releases, including a release activated during recovery after failed workflow attempts. Exclude staging, failed attempts, provisioning or bootstrap without an application rollout, backup runs, and repeat deployments of the same currently serving release with no release changes.
3. Compare each deployed source tree with the immediately preceding production release. Read the relevant diffs and commit details for the whole range. One deployment can contain several merges. Add one entry per qualifying deployment.
4. If no new production releases are confirmed and the history is complete, leave the file unchanged and report that it is current. If evidence is missing, state what could not be verified and avoid guessing. If source objects are unavailable locally, use read-only repository access or a temporary checkout to inspect the verified SHAs.

## Assign versions

Continue from the last documented version. Increase the minor version and reset the patch to zero for new visitor, editorial, administrative, or substantial operational functionality. Increase the patch version for fixes, CSS and presentation adjustments, and small maintenance or infrastructure changes. If a deployment combines both, use a minor increment. Keep the major version unchanged.

## Write release entries

- Write in English and append entries in chronological order. Use `## VERSION - Title - YYYY-MM-DD` with the production deployment date in Europe/Warsaw and the short SHA of the deployed application source.
- Start each change with a short bold label followed by a hyphen, as in `**user groups** - administrators can assign content to a group as its author.` Use this format in standalone paragraphs and list items.
- Use one short paragraph for one coherent change and place the hash at its end. Use an unordered list for distinct changes and put the hash on its own line after the list. Format the hash as ``(`e01e898`)`` in the changelog.
- Describe observable effects for visitors, editors, administrators, or operators. For infrastructure, explain the effect on availability, reliability, recovery, cost, or security. Mention implementation details only when necessary to understand the effect. Support each claim with the diff or deployment evidence.

## Handle staging summaries

When asked for a staging summary, keep it in the chat and use the same description format. For testing or promotion readiness, compare the exact staging source SHA with the currently deployed production SHA so the summary includes changes from earlier staging runs that have not reached production. Use the previous successful staging deployment as the baseline only when the user asks for the changes in that individual staging rollout. State the baseline and mark any staging version as provisional.

## Validate and report

Match entries, dates, and hashes against the confirmed production deployments. Check release order and version increments. Run the targeted formatting check and the repository-required `pnpm format`. Preserve unrelated working-tree changes. Report the updated version range, evidence gaps, and checks performed.
