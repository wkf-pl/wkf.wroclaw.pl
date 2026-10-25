# Icon preparation

Read this reference when converting source artwork or repairing icon quality.

## Source contract

For a source stem `name`:

- `name-s.png` supplies only the Small tier.
- `name-m.png` supplies only the Medium tier.
- `name.png` supplies both tiers.
- A tier-specific file overrides the shared file for that tier.
- A source set that cannot provide both tiers is incomplete and should fail before writing assets.

Normalize names to the repository's lowercase kebab-case convention. Inspect archives with `unzip -l` before extraction, and extract into a task-specific temporary directory.

## Visual contract

Each output is a monochrome alpha mask:

- canvas: transparent RGBA PNG;
- Small: 96×96;
- Medium: 192×192;
- visible glyph: optically centered on both axes;
- closest visible margin: aligned with the canonical `dice` icon for that tier;
- edges: antialiased but no softer than the tested `dice` baseline;
- interior: intentional negative space remains transparent; dust, isolated pixels, and accidental pinholes are removed.

The renderer uses the current validated defaults:

| Tier   | Canvas | Margin | Supersampling | Pre-threshold blur |
| ------ | -----: | -----: | ------------: | -----------------: |
| Small  |     96 |      8 |            4× |            0.75 px |
| Medium |    192 |     12 |            4× |            1.25 px |

These are implementation defaults, not a substitute for visual review. If the source has deliberately asymmetric visual weight, adjust the working source rather than silently breaking the centering tests.

## Avoid pixelated Medium variants

Do not resize a completed 96×96 icon to 192×192. Start Medium from:

1. the supplied `-m` reference;
2. the shared original reference; or
3. a higher-quality canonical shape already in the repository.

Raster-to-raster enlargement preserves jagged boundaries and was the cause of the rejected `filled-star`. The accepted repair derived each tier from the corresponding canonical `star` mask, filled its enclosed interior, and asserted exact alpha equality after that operation.

When an icon is a semantic sibling, encode the relationship in a test where practical:

- filled vs outlined: same tier dimensions and outer shape, only enclosed regions filled;
- left vs right: exact mirror when the design calls for it;
- alternate state: same anchor, scale, and optical center.

## Semantic fills

Distinguish geometric cleanup from requested meaning.

- “Filled liquid” means the liquid region becomes opaque while the air region stays transparent.
- “Filled cork” means the cork body becomes opaque without closing the bottle neck or other intentional holes.
- “Filled icon” does not mean thickening every contour.

For a noisy reference, make the semantic edit on a working source before the generic render step. Flood-fill only regions whose boundaries have been visually confirmed. After rendering, fill small enclosed alpha components only when they are obvious artifacts; use the renderer's per-name `--fill-small-holes` option rather than applying it to the entire batch.

## Visual review

Review a contact sheet or the files directly:

- S and M side by side;
- transparent and light neutral backgrounds;
- native size and at least 4× enlargement;
- replacement next to the prior icon when available;
- related variants next to each other.

Look specifically for clipped extrema, unequal margins, gray haze, stair-stepped diagonals, accidental closed holes, isolated specks, and semantic differences between tiers.
