# Changelog

Each release below corresponds to a completed production deployment, listed from the public release forward. Changes are described relative to the previous production release. Dates use Europe/Warsaw time, and hashes identify the deployed application source. Failed deployment attempts and staging-only changes are excluded.

## 1.0.0 - Public release - 2026-10-24

**public launch** - made the WKF website publicly available at its canonical address and ensured that visitors are consistently directed there. (`e01e898`)

## 1.1.0 - URL aliases and editor improvements - 2026-10-25

- **URL aliases** - editors can create short or alternative addresses for existing content, with visitors redirected to the selected destination and validation preventing conflicting routes.
- **layout block navigation** - editors can name layout blocks and retain the selected tab while working with nested content, making complex pages easier to navigate in the administration panel.
- **icons and spacing** - expanded the icon choices available to editors and refined spacing in composed content, listings, and tabbed sections.
- **production access control** - added an operator-controlled Microsoft Entra sign-in switch for temporarily restricting production access.
- **off-site backups** - reduced off-site backup storage growth by reusing unchanged media, strengthened backup integrity checks, and required backup tooling qualified on staging to reduce recovery risks.

(`3a5082a`)

## 1.1.1 - Content layout spacing fixes - 2026-10-26

**content layout spacing** - corrected spacing around decorated sections, home page content, column headings, and page blocks, improving the consistency of content layouts across screen sizes. (`95c6a8e`)

## 1.2.0 - Page templates, draft previews, and flexible listings - 2026-11-12

- **page templates** - editors can configure and preview shared layouts for the blog, events, event series, members, partners, categories, and tags, including information drawn from the item being displayed.
- **draft previews and trash** - editors can preview unpublished page and site-wide content changes before publishing them. Authorized users can move content to the trash, restore it, or permanently delete it according to their permissions.
- **flexible listings** - editors can combine listing conditions, show content related to the current or a selected item, and include partners and member profiles alongside existing content types. A shared listing editor provides carousel and other presentation options.

(`5f8d3a7`)

## 1.3.0 - User groups and content change history - 2026-11-15

- **user groups** - administrators can create user groups, assign content to a group as its author, and let group members work with that content within their role permissions.
- **content change history** - authorized administration-panel users can inspect a read-only history of content changes, including who performed each action and when.
- **blog index template** - the blog index now uses its published page template, including its search and sharing metadata. Editors no longer maintain special system pages for the blog and events indexes.
- **profile photos and administration cleanup** - member profile photos can be managed directly in the profile editor, including unpublished photo changes. Removed the separate profile-photo and club-section administration areas.
- **error and maintenance pages** - visitors receive branded missing-page and error screens with recovery actions. Added maintenance fallback pages for service interruptions.
- **database monitoring** - added production database availability monitoring and diagnostic activity records to help maintainers investigate outages.

(`a34bf04`)
