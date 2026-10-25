# Repository integration

Read this reference when assets must become selectable or replace existing WKF icons.

## Canonical paths

- Registry and URL contract: `src/modules/icons/icon-registry.ts`
- Assets: `public/assets/icons/{small,medium}/{name}.png`
- Raster component: `src/components/RasterIcon.tsx`
- Picker options: `src/modules/icons/icon-picker-options.ts`
- Shared icon fields: `src/modules/icons/fields.ts`
- Generated schema types: `src/payload-types.ts`
- Migration index: `migrations/index.ts`

The registry is the source of truth for names, labels, categories, selectability, keywords, and asset URLs. Shared fields distribute those options to all Payload consumers; do not patch individual collections with private copies.

## Registry changes

For each new selectable icon:

1. Choose the canonical lowercase kebab-case name.
2. Add a unique Polish label.
3. Choose one existing editorial category: `action`, `content`, `games`, `fantasy`, `community`, or `contact`.
4. Add search keywords that describe the object and likely editorial intent.
5. Keep the registry arranged consistently with its surrounding entries.

Replacing pixels under an existing name requires no enum migration. Adding, removing, or renaming a selectable name changes the Payload schema and does.

## Tests

Update current expectations rather than copying historical counts.

`tests/unit/raster-icons.spec.ts` is the main asset contract. It verifies:

- unique registered names and labels;
- exact PNG dimensions and alpha;
- exact inventory parity between registry and both tier directories;
- visible bounds, centering, margins, and sharpness;
- semantic relationships such as mirrored arrows and filled stars;
- absence of application SVG assets.

Also update:

- `tests/unit/raster-icon-picker.spec.ts` for total selectable count and meaningful category placement;
- `tests/unit/navigation.spec.ts` for the option count and label ordering;
- `tests/e2e/admin-navigation.e2e.spec.ts` for picker count and UI behavior.

Add a focused invariant when a user reports a specific visual regression. A generic “file exists” assertion would not have caught the pixelated `filled-star`.

## Payload types and migrations

When registry names change the schema:

1. Generate types with the repository command, normally `pnpm generate:types`.
2. Create a named migration with `pnpm migrate:create <descriptive-slug>`.
3. Inspect the generated TypeScript and JSON.
4. Confirm the `up` migration adds every new value to every affected enum exactly once.
5. Confirm `down` represents the prior enum set and does not remove unrelated values.
6. If generated function parameters are unused under this repository's strict TypeScript settings, destructure only `{ db }`.
7. Ensure `migrations/index.ts` imports and registers the new migration in order.
8. Apply and inspect status only in the authorized environment.

Payload may warn about unrelated identifiers longer than PostgreSQL's 63-character limit. Preserve and report that warning, but do not conflate it with an icon migration failure.

## Suggested focused validation

Use the project's configured runtime or container:

```bash
pnpm exec vitest run \
  tests/unit/raster-icons.spec.ts \
  tests/unit/raster-icon-picker.spec.ts \
  tests/unit/navigation.spec.ts
pnpm typecheck
pnpm lint
pnpm format
pnpm format:check
git diff --check
```

For migrations:

```bash
pnpm exec payload migrate:status
```

For the admin picker, verify the exact current result count, all new Polish labels in their intended groups, search by canonical slug, and actual image rendering. Fixture setup that bypasses normal editor permissions should use the Payload Local API with `overrideAccess: true`, restore changed data in `finally`, and use browser authentication only for the UI assertions.

Do not leave preview servers, temporary users, modified globals, or task-created listening ports behind.
