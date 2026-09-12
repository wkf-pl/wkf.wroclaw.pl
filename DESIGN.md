---
name: Wrocławski Klub Fantastyki
description: A lifted nocturnal system mapping paths into Wrocław's fantasy community.
colors:
  deep-night: '#001422'
  night-abyss: '#000d17'
  constellation-panel: '#031d2e'
  raised-night: '#0a2638'
  lantern-amber: '#f3a313'
  lantern-glow: '#ffbd38'
  parchment-ivory: '#f4efe5'
  mist-silver: '#c7cbd0'
  lantern-line: 'rgb(243 163 19 / 82%)'
  button-ink: '#052033'
typography:
  display:
    fontFamily: "Roboto Slab, Georgia, 'Times New Roman', serif"
    fontSize: 'clamp(2.7rem, 7vw, 5.5rem)'
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: 'normal'
  headline:
    fontFamily: "Roboto Slab, Georgia, 'Times New Roman', serif"
    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)'
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 'normal'
  title:
    fontFamily: "Roboto Slab, Georgia, 'Times New Roman', serif"
    fontSize: 'clamp(1.5rem, 3vw, 2.15rem)'
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: 'normal'
  body:
    fontFamily: "'Arial Narrow', 'Roboto Condensed', Arial, sans-serif"
    fontSize: '1.08rem'
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: 'normal'
  label:
    fontFamily: "'Arial Narrow', 'Roboto Condensed', Arial, sans-serif"
    fontSize: '0.82rem'
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: '0.18em'
rounded:
  compact: '0.35rem'
  control: '0.4rem'
  panel: '0.75rem'
  media: '0.8rem'
  pill: '999px'
  circle: '50%'
spacing:
  xs: '0.5rem'
  sm: '0.75rem'
  md: '1rem'
  lg: '1.5rem'
  xl: '2rem'
  section: 'clamp(2.5rem, 6vw, 5rem)'
components:
  button-primary:
    backgroundColor: '{colors.lantern-glow}'
    textColor: '{colors.button-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    padding: '0.6rem 1rem'
    height: '2.75rem'
  button-outline:
    backgroundColor: 'transparent'
    textColor: '{colors.parchment-ivory}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    padding: '0.65rem 1rem'
  input:
    backgroundColor: '{colors.constellation-panel}'
    textColor: '{colors.parchment-ivory}'
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    padding: '0.6rem 0.75rem'
    height: '2.75rem'
  chip:
    backgroundColor: 'transparent'
    textColor: '{colors.lantern-glow}'
    typography: '{typography.label}'
    rounded: '{rounded.pill}'
    padding: '0.3rem 0.65rem'
  content-card:
    backgroundColor: '{colors.constellation-panel}'
    textColor: '{colors.parchment-ivory}'
    rounded: '{rounded.panel}'
    padding: '1.25rem'
---

# Design System: Wrocławski Klub Fantastyki

## Overview

**Creative North Star: "The Cartographer's Constellation"**

The system imagines WKF as a chart drawn across a nocturnal Wrocław: people, events, and smaller initiatives become points connected by lantern-amber routes. Deep navy fields establish calm institutional weight, while warm light, restrained ornament, and fantasy imagery invite visitors into the community rather than presenting the club as a distant authority.

Its voice is atmospheric, credible, welcoming, and quietly fantastical. The visual system is lifted and theatrical: important media and featured surfaces read as illuminated objects staged above a deep background, with cast shadows, localized glow, and layered image treatments. The framing remains tactile and restrained so the experience supports trust instead of becoming spectacle.

**Key Characteristics:**

- Deep nocturnal canvases with distinct tonal layers rather than generic black.
- Lantern-amber routes, borders, and interaction cues used as deliberate points of guidance.
- Parchment-ivory reading color softened by cool silver secondary text.
- Lifted featured surfaces, cinematic image overlays, and controlled pools of warm light.
- Framed, tactile, and restrained components with modest curvature and precise state changes.
- Raster-only iconography that behaves as authored visual material, never as a font glyph or generic vector symbol.

## Colors

The palette combines Deep Night, Lantern Amber, and Parchment Ivory: a cool, civic nocturne animated by rare, warm signals.

### Primary

- **Lantern Amber** (`lantern-amber`): The primary route-making color for borders, dividers, emphasized words, and interaction cues.
- **Lantern Glow** (`lantern-glow`): The brighter active and focus color used when an interactive element needs to come forward.

### Neutral

- **Deep Night** (`deep-night`): The principal page canvas and the visual baseline for public surfaces.
- **Night Abyss** (`night-abyss`): The deepest layer behind media, overlays, and theatrical vignettes.
- **Constellation Panel** (`constellation-panel`): The standard raised content surface.
- **Raised Night** (`raised-night`): A lighter navy plane used for secondary layering and gradient transitions.
- **Parchment Ivory** (`parchment-ivory`): The principal high-contrast reading and heading color.
- **Mist Silver** (`mist-silver`): Supporting copy, descriptions, and secondary information.
- **Button Ink** (`button-ink`): Dark text on filled Lantern Glow controls.

### Named Rules

**The Lantern Route Rule.** Amber traces paths, frames important content, and marks interaction; it does not become a broad decorative fill.

**The True Night Rule.** Use layered navy surfaces for darkness. Generic pure black is reserved for shadow and image control, not the page canvas.

## Typography

**Display Font:** Roboto Slab with Georgia and Times New Roman fallbacks  
**Body Font:** Arial Narrow with Roboto Condensed and Arial fallbacks

**Character:** The slab-serif display voice gives headings a literary, civic weight without imitating ornamental fantasy lettering. The condensed sans-serif body voice keeps dense event, document, and community information direct and space-efficient.

### Hierarchy

- **Display** (700, fluid up to 5.5rem, 0.98 line-height): Singular page and listing titles with a short, balanced measure.
- **Headline** (700, fluid up to 2.8rem, 1 line-height): Section titles and block headings.
- **Title** (700, fluid up to 2.15rem, 1.05 line-height): Card titles and featured content labels.
- **Body** (400, 1.08rem, 1.75 line-height): Long-form reading and substantive descriptions.
- **Label** (700, 0.82rem, 0.18em tracking): Eyebrows, content kinds, and compact metadata; use uppercase sparingly.

### Named Rules

**The Chronicle, Not Costume Rule.** Typography may feel literary and storied, but it must never imitate runes, blackletter, or game-interface display fonts.

## Layout

The public site uses a centered shell capped at 76rem with 3rem total horizontal breathing room on wide screens. Reading-led content narrows to 52rem, lists and filters commonly use 62rem, and multi-column blocks expand to 70rem. This creates a clear rhythm between immersive framing, comfortable reading, and browsable collections.

Layouts combine two-column feature compositions, three-column content grids, and a twelve-column CMS-authored block grid. Major vertical intervals are fluid, usually growing from approximately 2.5rem to 5rem. The main collapse points are 62rem and 48rem: complex grids reduce columns first, then become a single reading column. Compact header and footer changes occur around 34rem, while member grids complete their collapse around 32rem. Component containers also respond at 62rem and 48rem so nested blocks remain usable independently of the viewport.

**The Guided Expansion Rule.** Let media and browsable collections occupy the wider shell, but return prose and decision-making content to a narrower measure.

## Elevation & Depth

The chosen philosophy is lifted and theatrical. Depth comes from a hybrid of deep tonal planes, photographic overlays, localized amber glow, text shadow over imagery, and cast shadows beneath selected surfaces. Featured events, hero media, and other high-value evidence may read as staged objects; ordinary lists remain closer to the background so the hierarchy retains meaning.

### Shadow Vocabulary

- **Featured Media Lift** (`0 1.2rem 3rem rgb(0 0 0 / 36%), 0 0 1.8rem rgb(243 163 19 / 10%)`): A cast shadow paired with a restrained Lantern Amber halo for hero media and prominent visual evidence.
- **Card Lift** (`0 0.7rem 1.6rem rgb(0 0 0 / 18%)`): A quieter shadow for reusable profile and content cards.
- **Narrative Focus** (`0 3px 22px rgb(0 0 0 / 65%)`): A protective shadow that keeps large display text legible over cinematic imagery.

### Named Rules

**The Staged Evidence Rule.** Reserve the strongest lift and glow for real imagery, featured activity, and proof-bearing content; depth must reinforce importance rather than decorate every panel.

**The Warm Light Rule.** Glow is localized and amber. Avoid diffuse blue neon, multicolor bloom, or uniform halos around every component.

## Shapes

The form language uses gently curved rectangles for content and controls: compact icon and label frames sit near 0.35rem, controls near 0.4rem, and cards or media frames near 0.75rem to 0.8rem. Tags use full pill geometry, while compact social and carousel controls use true circles. Thin amber borders make silhouettes legible against related navy layers.

Raster icons must be supplied as transparent PNG or WebP assets at sufficient source resolution for their rendered size. Use explicit dimensions and preserve hard, intentional silhouettes. Existing SVG-rendering icon components are a legacy implementation exception, not authority for new work.

**The Authored Mark Rule.** Every icon is a raster graphic designed or exported for its role; never substitute an SVG, icon font, or Unicode character.

## Components

Components are framed, tactile, and restrained: their borders clarify affordance, their curvature makes them approachable, and their depth changes only when hierarchy or interaction calls for it.

### Buttons

- **Shape:** Gently curved controls using the compact control radius.
- **Primary:** Lantern Glow fill with Button Ink text, a thin matching border, strong label weight, and compact vertical padding.
- **Hover / Focus:** Increase separation with a controlled lift or contrast change and a clearly visible Lantern Glow focus treatment.
- **Secondary / Outline:** Transparent Deep Night surface with Parchment Ivory text and a Lantern Amber border.

### Chips

- **Style:** Full-pill labels with Lantern Glow text and a translucent Lantern Amber border over the current navy plane.
- **State:** Keep them visually quiet at rest; strengthen border or background contrast for active and focus states without turning them into bright capsules.

### Cards / Containers

- **Corner Style:** Gently curved panels using the standard panel radius.
- **Background:** Constellation Panel or a closely related translucent navy plane.
- **Shadow Strategy:** Use Card Lift for reusable content and Featured Media Lift only for signature or evidence-bearing cards.
- **Border:** A thin, translucent Lantern Amber frame.
- **Internal Padding:** Usually 1.25rem, expanding fluidly toward 2.25rem for large editorial cards.

### Inputs / Fields

- **Style:** Constellation Panel fill, Parchment Ivory text, compact curvature, and a translucent Lantern Amber stroke.
- **Focus:** Move the border toward Lantern Glow and retain a clearly visible keyboard focus indicator.
- **Error / Disabled:** Preserve text legibility and communicate state with text and contrast, never with color alone.

### Navigation

Navigation is text-led, spacious, and visually integrated with the hero on immersive pages. Links use Parchment Ivory at rest and Lantern Glow on hover or focus. Button-style items gain a compact amber frame; icon-only actions may use raster assets only. At small widths, preserve usable labels and targets before reducing ornament or hiding the long brand name.

### Constellation Frame

Section headings pair symmetrical amber rules with small emblem positions to create a mapped, ceremonial threshold between content regions. Emblems must be raster graphics. Current vector-rendered placeholders should be migrated separately when the affected UI is changed.

## Do's and Don'ts

### Do:

- **Do** use deep navy layers, cinematic imagery, and localized Lantern Amber light to create a credible nocturnal stage.
- **Do** reserve meaningful lift for featured activity, real media, and evidence-bearing content.
- **Do** keep components framed, tactile, and restrained even when the surrounding composition is theatrical.
- **Do** preserve the approved WKF logo and give it clear space on Deep Night surfaces.
- **Do** use transparent raster PNG or WebP icons with explicit dimensions and sufficient resolution for high-density displays.
- **Do** maintain strong focus visibility, readable contrast, and reduced-motion behavior.

### Don't:

- **Don't** use gaming neon, tavern-fantasy kitsch, or impersonal corporate-blue interface styling.
- **Don't** use SVG icons, icon fonts, emoji, or Unicode characters as substitutes for raster icon artwork.
- **Don't** turn Lantern Amber into a large-area background or apply glow uniformly to every surface.
- **Don't** give every card the strongest theatrical shadow; a hierarchy without a quiet plane has no depth.
- **Don't** use decorative fantasy typefaces that undermine institutional credibility or long-form readability.
- **Don't** fabricate visual proof, partner marks, endorsements, or activity imagery that the organization cannot substantiate.
