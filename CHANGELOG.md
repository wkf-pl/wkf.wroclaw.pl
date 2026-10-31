# Changelog

Each release below corresponds to one commit on `master`, listed from the public release forward.

## 1.0.0 - Public release - 2026-10-24

Made the WKF website publicly available at its canonical address and ensured that visitors are consistently directed there. (`e01e898`)

## 1.0.1 - Staging PostgreSQL start alert - 2026-10-24

Added an automatic alert when the normally dormant staging database starts, helping maintainers detect unexpected activity and control infrastructure costs. (`f5de458`)

## 1.1.0 - Block editor and Entra sign-in tooling - 2026-10-24

- Made complex page layouts easier to edit with clearer block names and more intuitive controls for nested content.
- Added an operator-controlled Microsoft Entra sign-in switch that can temporarily restrict the production website to authenticated users.

(`bc79707`)

## 1.1.1 - Responsive layout refinements - 2026-10-24

Improved visual consistency across screen sizes by correcting spacing in composed content, listings, and tabbed sections. (`fb3b612`)

## 1.1.2 - Local database restore fixes - 2026-10-24

Made local copies of production and staging data more dependable, so maintainers can reproduce and diagnose application issues without manual restore workarounds. (`7a5f33a`)

## 1.2.0 - Off-site backup storage format v3 - 2026-10-25

Reduced off-site storage growth by reusing unchanged media and strengthened backup integrity checks, making disaster recovery more reliable without changing everyday visitor or editor workflows. (`f635c52`)

## 1.2.1 - Production backup deployment consistency - 2026-10-25

Reduced the risk of unusable production backups by running the backup process with a release already proven in staging. (`1ae6a0f`)

## 1.2.2 - Production backup schedule - 2026-10-25

Moved the daily production backup to 00:49, keeping automated data protection in a predictable nightly window. (`88641b2`)

## 1.2.3 - Expanded raster icon library - 2026-10-25

Expanded the icon choices available to editors, making it easier to give navigation and content elements clear, distinctive visual cues. (`8747edb`)

## 1.3.0 - URL aliases - 2026-10-25

Editors can create and manage short or alternative addresses for existing content. Visitors are redirected to the correct destination, while validation helps prevent conflicting or broken routes. (`3a5082a`)

## 1.3.1 - Content layout spacing fixes - 2026-10-26

Improved the rhythm and readability of grouped sections, home page layouts, column headings, and listing grids across different screen sizes. (`95c6a8e`)

## 1.4.0 - Draft previews and content trash - 2026-10-26

- Editors can preview unpublished changes to pages and site-wide content before making them public.
- Authorized users can move content to the trash, restore items deleted by mistake, or permanently remove them, with actions limited by their role.

(`62ab132`)

## 1.5.0 - Condition-based listing filters - 2026-10-31

Editors can build more precise listings and carousels by combining conditions in the administration panel, giving visitors more relevant content without requiring a separate code change for every filter. (`2ba34d5`)
