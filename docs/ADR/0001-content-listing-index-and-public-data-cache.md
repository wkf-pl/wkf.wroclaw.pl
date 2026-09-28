# 0001. Content listing index and public data cache

- Status: Accepted
- Date: 2026-08-21

## Context

Public listings combine pages, posts, events, and event cycles. Previously, every collection was
queried separately for a record count equal to the page number multiplied by the page size. The
application then merged, sorted, and trimmed the results. Query cost, data transfer, and memory use
grew linearly with the page number. Fetching the complete `layout` only to generate an excerpt added
further cost.

Public reads of these collections have one access variant: anonymous. Signing in to the application
does not broaden the visibility of public pages, posts, events, or cycles. Protected documents and
files still require dynamic access checks and are outside this decision.

## Decision

### Denormalized listing index

We introduce a hidden Payload collection named `content-listing-items`. It has no admin interface,
REST, or GraphQL endpoint, and external mutations are forbidden. Every published source document
has one record identified by the unique pair of source and document ID.

The index stores only fields needed by listings: the document source, ID, and update time; title;
URL; excerpt; sort and event dates; visibility; image; taxonomies; parent page; and event cycle.
Database indexes cover the source-ID pair, sort date, title, parent, cycle, and event dates.

Hooks on Pages, Posts, Events, and EventCycles read the canonical published version in the same
transaction as the document write. They upsert the index or remove the record after unpublishing.
A draft autosave is skipped when the published version's update time has not changed. Deleting a
source also deletes its index record.

A listing performs one query with the correct `page` and `limit`, `depth: 1`, and restricted
`select` and `populate` values. It does not fetch `layout`. Existing filters remain unchanged, and
ties are resolved consistently by title, source type, and ID. `sortDate` is the event start or
publication date, falling back to the creation date.

We chose a Payload collection over a SQL view because it uses the same relationships, access
control, types, and migration mechanism as the rest of the application. A regular view would still
require expensive joins across versioned tables. A materialized view would require a separate
refresh mechanism that would be harder to bind transactionally to publication.

### Generating `listingExcerpt`

When a page is published with an empty `listingExcerpt`, the field is populated from the first
non-empty paragraph in the first rich-text block. Headings and empty paragraphs are skipped, text
from links and formatted elements is preserved, whitespace is normalized, and the result is
truncated at a word boundary to 500 characters. A manually entered value is never overwritten. If
there is no paragraph, the field remains empty.

The migration backfills excerpts for existing published pages in batches. Runtime code no longer
reads `layout` to build a listing.

### Public data cache

The cache stores data rather than complete static HTML. Content listings, the member profile
directory, filtered media listings, and homepage data are cached for five minutes. Content,
partner, and profile details; event, cycle, and post relationships; and the sitemap are cached for
one hour. An infrastructure boundary wraps `unstable_cache`, so domain logic does not depend
directly on the Next.js cache interface. `connection()` prevents database reads during `next build`
without disabling the Data Cache. Public HTML remains dynamically rendered.

Keys include every query argument, including normalized sources, block kind and mode, page, page
size, sorting, filters, and the editorial order of manually selected media. Manually selected media
are fetched in one query and restored to editorial order. Relationship reads receive tags from both
sides of the relationship; for example, a partner's events carry both `events` and `partners` tags.

Broad collection tags plus `content-listings`, `homepage`, and `public-sitemap` tags invalidate
dependent data after creation, publication, updates, unpublishing, and deletion. A partner change
invalidates partner, event, event-cycle, and sitemap data. A profile change invalidates its
directory and detail data plus the details of pages, posts, events, cycles, and partners that may
embed the profile; changing a profile image performs the same invalidations except for the sitemap.
Category and tag changes also cover media listings, while a media or web-access-setting change
invalidates the entire public cache. These broad dependencies are intentional because documents
fetched at greater depth contain embedded relationship data.

Every cached read uses an anonymous user and public-site context and does not bypass access control.
This also applies to partners, profiles, media, and event and cycle relationships. Member-only events
and cycles remain hidden on public routes even from an authenticated user. Protected documents and
files, authentication, ICS calendars, and `robots.txt` remain dynamic and outside the cache defined
by this decision.

### Single replica

Next Data Cache is not shared between independent application replicas. Until a shared cache is
introduced, the Azure Container App uses `minimumReplicas: 0` and `maximumReplicas: 1`. After a
restart or cold start, the cache is rebuilt from PostgreSQL. This limit prevents consecutive
requests from being served by replicas with different local cache states.

## Rejected alternatives

- Fetching multiple collections and merging them in memory retains the linear cost of deep
  pagination.
- Cache Components require a broader rendering migration; the cache boundary allows that option to
  be revisited later.
- A cache per role offers no value for content with one anonymous public variant and increases both
  the number of variants and the risk of permission leaks.
- Redis and multiple replicas add operational cost before traffic demonstrates a need for horizontal
  scaling.
- Complete static HTML would require maintaining a dependency graph across detail views, listings,
  the homepage, and the sitemap. A tagged data cache provides simpler, controlled invalidation.

## Consequences and risks

A deep listing page fetches no more than the page size, regardless of its page number. Reads are
simpler and do not require large rich-text structures. The cost is denormalization and the need to
keep the index synchronized.

A hook failure rolls back the write transaction, so the source and index cannot diverge. Projection
logic errors can still produce a technically consistent but incorrect record; integration tests
cover the complete publication lifecycle. Cache invalidation after synchronization uses broad tags
and may cause more re-fetching than a minimal dependency graph. A single replica limits throughput
and availability during restarts.

## Migration and rollback

The migration creates the table, relationships, and indexes, then generates missing excerpts and
builds the index of published documents in batches. Migration context disables secondary
synchronization and cache invalidation. `down` removes the index collection and its types but keeps
generated excerpts because editors may have changed them after migration.

Rolling the application back requires running the `down` migration before starting a version that
does not know about the index. Returning to multiple replicas first requires either a shared cache
or removal of the data cache that depends on local state.

## Further development

If one replica becomes a constraint, the cache infrastructure layer can move to shared storage
without changing domain queries. Replica count can then increase, and tags can be narrowed based on
measurements. Cache Components remain a possible path after their use in the application stabilizes
and profiling confirms the benefit.
