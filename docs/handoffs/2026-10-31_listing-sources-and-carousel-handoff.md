# Handoff: Listing sources and Carousel consolidation

## Snapshot

- Date: 2026-10-31
- Source: `wkf.wroclaw.pl`, branch `feature/page-templates`, commit `2ba34d5`
- Target: a dedicated Listing branch created before page-template implementation
- Status: planned; no production implementation has started
- Why this handoff exists:
  - Complete the reusable Listing foundation before page templates depend on it.
  - Add Partners and Member Profiles as Listing sources.
  - Consolidate the standalone Carousel block into the existing `carousel` Listing view.

## Goal

Deliver one generic Listing block that:

- supports `partners` and `member-profiles` in filtered and manual selection;
- renders both sources in every Listing view: cards, carousel, compact, grid, and tiles;
- sort the views in a alphabetical order;
- preserves anonymous public-access rules and stable sorting;
- replaces every stored standalone `carousel` block with `listing` plus `view: 'carousel'`;
- removes the standalone Carousel schema and renderer without losing current content, drafts, or version history.

## Scope

### In scope

- Extend the Listing source registry, hidden listing index, hydration, cache invalidation, admin fields, and frontend presentation for:
  - `partners`, labelled `Partnerzy` in the admin;
  - `member-profiles`, labelled `Wizytówki` in the admin.
- Keep manual editorial order for both new sources.
- Make Carousel exclusively a Listing view.
- Make Carousel-specific limit and pagination behaviour explicit in the Listing form and resolver.
- Migrate current documents and all stored versions from standalone Carousel blocks to Listing blocks.
- Backfill published Partners and Member Profiles into `content-listing-items`.
- Update generated Payload types, seed data, tests, and the content-listing ADR after implementation.

### Out of scope

- Page-template Globals, route renderers, regions, and the legacy/template switch.
- Route renaming (`/tag`, `/category`, `/dokumenty`, and nested file routes).
- Contextual `Bieżący element` operands for template routes.
- New relationship conditions for related posts, partner events, or partner cycles.
- Event-status conditions and the planned event `Terminarz` view.
- OR conditions or condition groups; Listing conditions remain AND-only.
- Removing the existing `MemberProfilesBlock`. It still supports per-placement `contextLabel`, which a generic Listing item does not currently model.

## Current State

### Done or already available

- Listing sources are centralized in `src/modules/content/listing-conditions.ts` but currently contain only:
  - `pages`, `posts`, `events`, `event-cycles`, and `documents`.
- `ListingBlock` already exposes `view: 'carousel'`.
- `ContentList` already delegates the carousel view to `ContentCarousel`.
- A separate `CarouselBlock` duplicates Listing selection mode, sources, manual items, conditions, sorting, presentation fields, and empty-state configuration.
- The standalone Carousel differs mainly by `slideLimit` and the absence of URL pagination.
- `content-listing-items` provides one denormalized public index queried by all generic Listings.
- Existing integration tests cover Listing lifecycle, index synchronization, manual order, conditions, and standalone Carousel behaviour.
- Existing unit and E2E coverage includes `ContentCarousel` and the homepage Carousel.

### Not done

- Partners and Member Profiles are not accepted Listing sources.
- They are not indexed, hydrated, or rendered by generic Listing components.
- Partner and Member Profile hooks invalidate their own public caches but do not synchronize `content-listing-items`.
- Generic presentation components assume fields such as `title`, `heroImage`, `category`, and `tags`; those assumptions do not hold for Member Profiles and only partially hold for Partners.
- Standalone Carousel block tables and version tables still contain persisted content.
- The seed and E2E fixtures still create `blockType: 'carousel'`.

### Next

Start with characterization tests for existing Listing and standalone Carousel behaviour, then deepen the source abstraction before adding either new source.

## Relevant Artifacts

- `src/modules/content/listing-conditions.ts` - source registry and source/condition compatibility.
- `src/modules/content/content-listing.ts` - query, manual order, hydration, source unions, and sorting.
- `src/modules/content/content-listing-index.ts` - source projection, URL generation, synchronization hooks, and backfill primitive.
- `src/collections/ContentListingItems.ts` - hidden denormalized index schema and database indexes.
- `src/collections/Partners.ts` - Partner fields, public drafts, and current invalidation hooks.
- `src/collections/MemberProfiles.ts` - profile access, lifecycle hooks, moderation fields, and public fields.
- `src/modules/members/public-members.ts` - current anonymous public-profile query.
- `src/app/(frontend)/_components/ContentList.tsx` - view dispatch.
- `src/app/(frontend)/_components/ContentCard.tsx` - source-specific card metadata and excerpts.
- `src/app/(frontend)/_components/ContentCarousel.tsx` - source-specific Carousel rendering and accessibility behaviour.
- `src/app/(frontend)/_components/ContentTile.tsx` - tile assumptions that must also support the new sources.
- `src/app/(frontend)/_components/ListingBlockSection.tsx` - generic Listing resolver and URL pagination.
- `src/blocks/Listing.ts` - admin schema; already contains the Carousel view.
- `src/blocks/Carousel.ts` - duplicate schema to migrate and remove.
- `src/app/(frontend)/_components/CarouselBlockSection.tsx` - duplicate resolver to remove after data migration.
- `src/blocks/MemberProfiles.ts` - retain unless a separate decision replaces per-entry context labels.
- `src/modules/cache/invalidate-public-data.ts` - source-to-cache-tag mapping and current Partner/Profile invalidators.
- `src/blocks/contentLeafBlocks.ts` - remove the standalone Carousel only after migration safety is proven.
- `docs/ADR/0001-content-listing-index-and-public-data-cache.md` - update source coverage and consequences after implementation.
- `tests/integration/content-listing-index.integration.spec.ts` - publication lifecycle and index projection.
- `tests/integration/content-listing.integration.spec.ts` - filtered/manual Listing and stored Carousel fixtures.
- `tests/unit/content-list-frontend.spec.tsx` and `tests/unit/content-carousel.spec.tsx` - all-view rendering.
- `tests/e2e/homepage-calendar.e2e.spec.ts` - seeded standalone Carousel that must become a Listing carousel.
- `tests/integration/listing-conditions-migration.integration.spec.ts` - precedent for block-table and version-table migration coverage.
- `scripts/seed.ts` - contains a standalone Carousel fixture.

## Decisions Already Made

- Carousel is a Listing view, not a separate content block.
- The separate Carousel block must be migrated and removed rather than maintained as an alias indefinitely.
- Listing conditions remain combined with AND.
- `Najnowsze` and `Najstarsze` use `significantDate`; do not introduce a competing source-specific sort meaning.
- Existing sources must work in carousel view.
- Partners and Member Profiles must work in every Listing view, including Carousel.
- Public Listing reads use anonymous public access (`overrideAccess: false`, `user: null`, public request context).
- Member Profile cards use the public profile image mechanism; they must not assume the generic Media upload relation.
- Existing Carousel accessibility behaviour must survive consolidation: pause on focus/hover, page-visibility and viewport checks, reduced-motion support, inert inactive slides, labelled controls, and keyboard-safe links.

## Required Design Changes

### 1. Deepen the Listing source abstraction

- Extend the source registry with `partners` and `member-profiles`.
- Rename `TaxonomizableCollectionSlug` and `TaxonomizableDocument`; the generic Listing will no longer contain only taxonomizable collections. Prefer names such as `ContentListingSource` and `ContentListingDocument`.
- Centralize source labels instead of repeating local label maps in block definitions.
- Separate `allListingSources` from condition-specific source sets:
  - title can support all sources;
  - category and tag must not automatically become applicable to Partners or Member Profiles;
  - event-only and hierarchy-only conditions retain their current scopes.
- Add focused tests for mixed-source condition compilation so new sources do not accidentally receive predicates for fields they do not have.

### 2. Extend the denormalized index

Add source projections without forcing all source documents through one field selection object.

Partner projection:

- `title` <- `name`
- `url` <- `/partners/{slug}`
- `excerpt` <- `excerpt`
- `heroImage` <- `heroImage`
- category/tags/parent/cycle/event dates <- empty

Member Profile projection:

- `title` <- `publicName`
- `url` <- `/members/{slug}`
- `excerpt` <- normalized text extracted from `about`
- generic `heroImage` <- empty; the hydrated profile uses `photo` through `getMemberProfileImageURL`
- category/tags/parent/cycle/event dates <- empty

Implementation requirements:

- Add both values to the `content-listing-items.source` schema and migration enum.
- Add source-specific `select` definitions; selecting Page/Event-only fields from Partner/Profile collections must be avoided.
- Extend `syncContentListingItem`, source guards, URL generation, and backfill loops.
- Add synchronization hooks to Partners and Member Profiles without disturbing existing lifecycle hooks.
- Extend `tagsBySource` and make Partner/Profile changes invalidate `public:content-listings` in addition to their current tags.
- Preserve transaction coupling: a failed index update must fail the canonical write.
- Backfill every published Partner and Member Profile during migration with the existing synchronization primitive and migration skip context.
- On `down`, remove their index rows before reverting source enums.

### 3. Extend hydration and presentation

- Add Partner and Member Profile variants to `PublicContentListItem`.
- Hydrate them in the same batched, anonymous, access-controlled manner as current sources.
- Avoid spreading new `switch` statements across every view. Introduce a narrow presentation adapter or explicit source helpers for:
  - display title;
  - image rendering strategy;
  - excerpt/summary;
  - kind label and metadata;
  - optional taxonomy;
  - source-specific secondary actions.
- Partner title is `name`; Member Profile title is `publicName`.
- Partner images use `CmsImage`; Member Profile images use `getMemberProfileImageURL` and the existing profile-image rules.
- Reuse `MemberProfileCard` where its markup matches the requested view, but do not force generic cards to pretend a profile has `heroImage`, `category`, or `tags`.
- Cover cards, carousel, compact, grid, and tiles for both new sources.
- Do not expose owner-only or hidden moderation fields through Listing rendering.

### 4. Consolidate Carousel into Listing

The Listing already has the `carousel` view; this task removes the duplicate path.

- When `view === 'carousel'`:
  - force query page to `1`;
  - disable URL pagination and do not render `ContentPagination`;
  - use a bounded item limit equivalent to the old `slideLimit`;
  - present that field as `Maksymalna liczba slajdów` or another Carousel-specific label in the admin.
- Keep ordinary Listing pagination unchanged for other views.
- Continue rendering through `ContentList` -> `ContentCarousel`.
- Remove `CarouselBlockSection` and the `carousel` renderer case only after stored blocks and versions are migrated.
- Remove `CarouselBlock`, its export, label component, thumbnail registration, generated types, and leaf-block registration only after migration verification.

### 5. Migrate stored Carousel blocks safely

Do not remove `CarouselBlock` from the Payload config and rely on an automatically generated drop migration. Stored content exists in current documents, drafts, historical versions, seed data, and tests.

Recommended two-step migration inside the same feature branch:

1. Keep both schemas temporarily and migrate standalone Carousel rows to Listing rows.
2. Verify the migrated data, then remove the standalone block schema and drop its tables in a following migration.

The data migration must cover live and version tables for every owner that uses `createContentLayoutField`:

- Pages;
- Posts;
- Events;
- Event Cycles, including both layout paths;
- Partners;
- Homepage Sections.

Preserve:

- block ID, parent document/version, `_path`, and editorial order;
- presentation fields (`frame`, `surface`, and related surface fields);
- selection mode;
- source order;
- manually selected item order and polymorphic relationships;
- all condition rows and their values;
- sort;
- empty message.

Set:

- `blockType`/target table to Listing;
- `view` to `carousel`;
- `pagination` to `false`;
- Listing item limit/page size from `slideLimit`.

The migration must map old block-row primary keys to new Listing block-row primary keys before copying child source, item, and condition rows. Nested blocks rely on `_path`; copying only top-level layouts is insufficient. The `down` migration must reconstruct standalone Carousel blocks and their children before dropping the corresponding Listing rows.

## Assumptions And Open Questions

### Assumptions

- The dedicated Listing branch starts from the current commit or a later commit containing no page-template implementation.
- The current Carousel visual and accessibility behaviour is the compatibility baseline.
- The standalone `MemberProfilesBlock` remains available because of its per-entry `contextLabel`.
- New sources use the current generic condition behaviour: a condition applies only to compatible sources. Tightening mixed-source validation is a separate decision unless needed to prevent invalid queries.

### Open questions to settle before schema migration

- Significant date for Partners and Member Profiles:
  - recommended default: leave it empty and rely on deterministic title/source/ID fallback;
  - do not silently treat `updatedAt` or `createdAt` as editorially significant;
  - using Partner `publishedAt` requires an explicit product decision, and Member Profiles have no equivalent editorial field.
- Carousel limit field:
  - decide whether to reuse `pageSize` with a conditional label or introduce a neutral `itemLimit` used when pagination is disabled;
  - the migration mapping from `slideLimit` must remain lossless either way.
- Generic Listing view labels for profiles:
  - confirm whether existing Listing `cards`, `grid`, `compact`, and `tiles` should visually align with current Member Profile `card`, `grid`, and `list`, or receive new unified CSS.

## Risks And Edge Cases

- Adding new values to `listingSources` without splitting condition support would incorrectly mark Partner/Profile sources as category- and tag-capable.
- Reusing the current global `contentListingSourceSelect` for new collections may select nonexistent fields and fail synchronization.
- `ContentCard`, `ContentTile`, `ContentList` compact mode, and `ContentCarousel` currently access source-specific fields directly; updating only one view will leave runtime failures in the others.
- Member Profile photos are not Media uploads and require their existing URL helper and storage policy.
- Hook ordering matters for Member Profile image reconciliation and index projection.
- Partner/Profile cache invalidators currently omit `contentListings`; stale Listing results are possible unless tags are extended.
- Autosaves must not repeatedly rewrite identical index entries; retain the published-version `updatedAt` check.
- Removing Carousel tables before copying all version rows can make historical versions unreadable and is not recoverable from current documents alone.
- Manual Carousel order, condition arrays, nested block paths, and old draft versions are high-risk migration cases.
- A source with no significant date sorts after dated content for newest/oldest and then deterministically by title/source/ID; tests must lock this behaviour once the open question is resolved.
- A Listing containing only unpublished or inaccessible manual items must still preserve its current empty-state behaviour.

## Test Plan

### Characterization first

- Preserve current standalone Carousel selection, ordering, limit, empty state, frontend markup, and accessibility tests before changing the schema.
- Preserve current Listing carousel rendering before consolidating resolvers.

### Unit coverage

- Source registry and Polish labels include Partners and Wizytówki.
- Source/condition compatibility does not treat the new sources as taxonomizable.
- Partner and Member Profile presentation works in cards, carousel, compact, grid, and tiles.
- Carousel Listing hides/disables pagination and respects the migrated limit.
- `ContentCarousel` retains focus, hover, visibility, reduced-motion, controls, and inactive-slide behaviour.
- Remove or rewrite tests that assert a separate `CarouselBlock` only after migration coverage exists.

### Integration coverage

- Partner index lifecycle: publish, update, autosave without published change, unpublish, republish, trash/delete, and rebuild missing index entry.
- Member Profile index lifecycle with the same transitions and anonymous read restrictions.
- Correct index projection for partner `name`/`excerpt`/image and profile `publicName`/`about`/photo strategy.
- Filtered and manual Listings return both new sources, preserve manual order, paginate ordinary views, and exclude inaccessible drafts.
- Migration `up` converts standalone Carousel blocks in current rows and version rows, including nested layouts and all child data.
- Migration `down` restores equivalent standalone Carousel blocks.
- Isolated database validation runs `up -> down -> up` and compares representative block data after each transition.

### E2E coverage

- Update the homepage Carousel fixture to `blockType: 'listing', view: 'carousel'` and keep its public rendering assertions.
- Add at least one browser path proving Partner and Member Profile Listing cards link to `/partners/{slug}` and `/members/{slug}`.
- Re-run the existing member-profile image assertion for a profile displayed through generic Listing.

## Validation

### Ran for this handoff

- Read-only repository inspection of current Listing, Carousel, index, source collections, cache invalidation, migrations, seed, and relevant tests.
- `git status --short` was clean before this handoff file was created.
- No application code, schema, migration, generated type, or test was changed.

### Required during implementation

Run narrow checks first, then broaden:

1. `pnpm generate:types`
2. `pnpm generate:importmap` if removed admin block labels change the import map
3. targeted unit tests for Listing/Carousel presentation and block configuration
4. targeted integration tests for the listing index, generic Listing, and migration
5. targeted homepage Carousel and Member Profile browser tests
6. isolated migration `up -> down -> up`
7. `pnpm typecheck`
8. `pnpm lint`
9. `pnpm test:unit`
10. `pnpm test:integration`
11. `pnpm format`
12. `pnpm pre-push`

State explicitly if full browser E2E, build, or production-data migration qualification remains unrun.

## Recommended Next Steps

1. Create the dedicated Listing branch and add characterization tests for the duplicate Carousel paths.
2. Introduce the deeper source registry/types and source-specific index projection boundary.
3. Add Partner indexing, hydration, presentation, hooks, and lifecycle tests.
4. Add Member Profile indexing, hydration, presentation, hooks, and lifecycle tests.
5. Make Listing Carousel-specific limit/pagination behaviour explicit while retaining the current visual component.
6. Implement and integration-test the two-step standalone Carousel data migration.
7. Remove the standalone Carousel schema, resolver, labels, fixtures, and dead tests.
8. Update seed data, E2E fixtures, generated types/import map, and ADR 0001.
9. Run focused validation, migration round-trip, full unit/integration suites, formatting, and pre-push checks.

## Resume Prompt

```text
Read docs/handoffs/2026-10-31_listing-sources-and-carousel-handoff.md and implement the Listing foundation on the dedicated Listing branch. Start with characterization tests and the source abstraction; do not begin page-template work or route renaming. Preserve public access, migration reversibility, existing Carousel accessibility, and all stored versions.
```

## Deferred Work

- Page-template implementation and per-route legacy/template rollout.
- `Bieżący element` contextual operands.
- Related event/cycle/partner conditions and event status filtering.
- Event `Terminarz` view.
- Route normalization and redirects.
