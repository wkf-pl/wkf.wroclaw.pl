---
name: package-docs
description: Use when README.md or docs/ in this repository must be created, restructured, or synchronized with code changes, especially after configuration, integration, or behavior changes.
---

# Repository Docs

Use this skill for documentation stored in:

- root `README.md`
- `docs/`
- documentation snippets embedded in repository files
- optional `CHANGELOG.md` files when the repository decides to use them

## Core rules

- Keep `README.md` concise. They must give a fast overview, short setup or usage guidance, and links to deeper material. Do not turn them into walls of text.
- Use `docs/` for detailed material.
- Whenever `docs/` contains useful files, link to them from the corresponding `README.md`.

## Required README shape

For root `README.md` keep this order when the content exists:

1. Overview
2. How to run or integrate
3. Configuration or environment
4. Short, focused examples
5. Links to deeper docs

If a section becomes long, move the detail into `docs/` and leave only a short summary plus links in `README.md`.

## Required docs/ structure

Start with a single file in `docs/` for each topic:

- `docs/ADR.md`
- `docs/API.md`
- `docs/Integration.md`
- `docs/Architecture.md`
- `docs/Examples.md`

You must start with the single-file form. Only split a topic into a subdirectory when that single file would become too large or unreadable. When you split:

- keep the original top-level file as the table of contents for that topic
- use that top-level file to link to the files in the subdirectory
- add short descriptions of what each linked file contains

Examples:

- `docs/ADR.md` with links into `docs/adr/`
- `docs/API.md` with links into `docs/api-reference/`
- `docs/Examples.md` with links into `docs/examples/`

Do not create subdirectories eagerly. The top-level file remains mandatory after the split.

## Changelogs

- Do not add or update changelogs unless the task or repository policy explicitly requires it.
