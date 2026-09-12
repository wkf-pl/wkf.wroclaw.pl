---
target: homepage
total_score: 16
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
target_identity: "file:/home/forseti/Kod/wkf.wroclaw.pl/src/app/(frontend)/page.tsx"
target_fingerprint: "sha256:01538a5b6404494bae796f9cfa69ff8c25008a976ba74858dedb7a53ad62c4de"
target_path: /home/forseti/Kod/wkf.wroclaw.pl/src/app/(frontend)/page.tsx
timestamp: 2026-09-09T22-24-34Z
slug: src-app-frontend-page-tsx
---
# Homepage Critique

Method: dual-agent (A: critique_design_review · B: critique_detector_evidence)

## Design Health Score

| Nielsen heuristic | Score | Assessment |
| --- | ---: | --- |
| 1. Visibility of system status | 2/4 | Event carousel state exists, but the page offers weak feedback about what joining or subscribing will do. |
| 2. Match between system and the real world | 3/4 | Familiar event, news, location, and calendar language works well. “Sections” and “Our Club” remain vague to a newcomer. |
| 3. User control and freedom | 2/4 | The core page is easy to scroll and links are recognizable, but the hero presents several peers without a clear primary path. |
| 4. Consistency and standards | 2/4 | The visual system is coherent, while several destinations and accessible labels do not match their visible purpose. |
| 5. Error prevention | 1/4 | Placeholder `#top` destinations and a non-functional Join action allow users to make apparently valid choices that go nowhere. |
| 6. Recognition rather than recall | 2/4 | Event facts and grouped navigation are recognizable, but visitors must infer what WKF is, how it helps initiatives, and how to participate. |
| 7. Flexibility and efficiency of use | n/a | Not a primary criterion for this persuasive homepage. |
| 8. Aesthetic and minimalist design | 3/4 | The visual language is distinctive and restrained, though repeated placeholder imagery makes the lower half feel less authored. |
| 9. Help users recognize, diagnose, and recover from errors | 1/4 | Dead links fail silently and the empty event state removes the entire section instead of explaining what is happening. |
| 10. Help and documentation | n/a | Not a primary criterion for this persuasive homepage. |

**Total: 16/32 (50%) — Acceptable, with significant improvements needed.**

## Design Specificity Verdict

**Visually authored, strategically interchangeable.** The Deep Night / Lantern Amber / Parchment Ivory palette, local night panorama, official mark, slab-serif typography, framed cards, and constellation ornaments form a memorable identity. The information architecture is still a standard hero → featured item → news → category tiles pattern. If the logo and place image were removed, the page would not clearly communicate WKF’s legal personality, nonprofit cultural role, umbrella function for smaller initiatives, or the practical path into the community.

- **LLM visual assessment:** strong local art direction and coherent atmosphere; generic persuasion journey and insufficient institutional proof.
- **Deterministic source scan:** 0 findings; the CLI returned a clean JSON result.
- **Runtime visual detector:** 1 unique page-level signal appeared on both desktop and mobile, but the detector exposed neither the rule name nor source location. This remains unresolved and is not used as the sole basis for any priority.
- **Overlay:** detector overlay elements existed in headless browser DOMs, but no user-visible overlay is claimed. Screenshots, DOM geometry, landmarks, image state, heading sequence, and overflow measurements were used as fallback evidence.

## Overall Impression

The page creates an immediate sense of place and genre. It feels like a Wrocław fantasy club, not a commercial entertainment product, and the featured event gives credible evidence that the club is active. The persuasive sequence stops too early, however: the page shows activity before explaining the organization, gives the strongest institutional facts only in the footer, and ends without a real invitation. This weakens both principal jobs identified in the product brief: converting interested people into participants and establishing trust with cultural institutions, grant reviewers, and venue partners.

The cognitive load is high in 4 of 8 applicable checks. The first viewport offers three header links plus two equally weighted hero actions; the event section exposes several competing links; and the footer adds seven more choices. Grouping, chunking, progressive disclosure, and the amount of prose are otherwise controlled.

The emotional journey is strongest at the opening panorama and featured event. It drops at the non-functional Join action, partially recovers through concrete event details, then drops again through repeated nebula placeholders and a footer where legal proof is present but visually recessive. There is no warm, credible closing invitation.

## What Is Working

1. **A distinctive local identity.** The Wrocław night panorama, club mark, restrained navy/amber palette, and framed theatrical treatment create a recognizable atmosphere aligned with “The Cartographer’s Constellation.”
2. **The featured event is the strongest proof point.** A real date, venue, image, description, and calendar action demonstrate actual club activity more effectively than generic claims would.
3. **The responsive foundation is sound.** Both 1440 px and 390 px views rendered without horizontal overflow, failed images, or missing image alternatives. The information stacks predictably, and the carousel source includes pause behavior for pointer and keyboard focus.

## Priority Issues

### 1. [P1] The primary “Join” action is a dead end

**Why it matters:** This is the most conversion-critical promise on the page, yet it resolves to `#top`. A potential member receives no next step, and an institutional visitor sees an unfinished interaction. It is more damaging than omitting the action because it breaks trust at the moment of intent.

**Fix:** Decide what “Join” means operationally—attend an open meeting, start formal membership, or contact the club—and link to that real destination. Give it clear primary emphasis and use the calendar as the secondary action.

**Suggested command:** `impeccable shape`

### 2. [P1] The homepage does not tell the required trust-to-membership story

**Why it matters:** The product strategy calls for “who we are → what we actually do → when to meet us → why to trust us → how to join.” The current page begins with a generic welcome, moves directly into events, and relegates KRS, address, and statute to the footer. It never explains the club’s legal personality, nonprofit cultural mission, or role as a hub for smaller initiatives.

**Fix:** Recompose the homepage around five short proof-bearing beats: identity and mission; concrete areas of activity; next encounter; institutional trust and umbrella role; final human invitation. Use real facts already supported by the organization and avoid fabricated achievements.

**Suggested command:** `impeccable shape`

### 3. [P1] Link destinations and labels undermine reliability

**Why it matters:** Cooperation, privacy, and cookie links also resolve to `#top`; the hero calendar uses an environment-specific absolute destination while the page exposes the local `/events/calendar.ics`; and the Discord control carries an email label. These mismatches are especially damaging for evaluators assessing organizational maturity and for assistive-technology users.

**Fix:** Audit every visible homepage destination and accessible name against its rendered purpose. Replace placeholders with real pages or temporarily remove the controls; use one canonical calendar route; correct the Discord accessible label.

**Suggested command:** `impeccable harden`

### 4. [P2] Mobile hierarchy is visually strong but operationally weak

**Why it matters:** At 390 px the page is approximately 4,051 px tall, the organization name disappears from the header, the hero consumes about 688 px, and the only join opportunity remains at the top. Several measured controls are below 44 px high: top navigation is about 38 px and some event/footer links are 19–38 px. The amber emphasized word also crosses a bright yellow part of the façade, weakening contrast.

**Fix:** Preserve the atmospheric hero while reducing its mobile height, retain a compact textual brand cue, enlarge true interactive hit areas, improve the headline overlay/contrast, simplify the event actions, and repeat the chosen primary invitation near the end.

**Suggested command:** `impeccable adapt`

### 5. [P2] The implemented icons violate the selected raster-only direction

**Why it matters:** The current page renders 25 SVG elements through the shared `Icon` component, despite the explicit decision that icons must be raster graphics rather than SVGs or font glyphs. This is a direct design-system mismatch, not merely a stylistic preference.

**Fix:** Define a small, consistent high-DPI PNG/WebP icon set with fixed semantic names, sizes, and accessible behavior. Replace system-icon rendering in one controlled batch, while retaining CMS custom raster icons. Do not substitute Unicode characters or an icon font.

**Suggested command:** `impeccable polish`

## Persona Red Flags

- **Jordan, first-time visitor:** understands “fantasy” and “Wrocław,” but not the formal identity of WKF, what participation looks like, or whether Join means membership, Discord, or attending an event.
- **Riley, stressed or assistive-technology user:** encounters dead destinations, inconsistent calendar routes, an incorrect Discord label, small targets, and an event section that disappears completely when there are no events.
- **Casey, mobile visitor:** traverses a very long page with a tiny top brand/navigation area, a dominant hero, dense event actions, and no second opportunity to act.
- **Marta, institutional evaluator:** needs legal status, cultural purpose, accountable contact, activity evidence, and the umbrella role early. Instead, KRS/address/statute appear only in the footer while cooperation and legal links look unfinished.

## Minor Observations

- Strengthen the local gradient behind the event title; the detailed photograph competes with the white type.
- The event title link and “More…” link duplicate the same destination. One clear detail action would reduce competition.
- Four uses of the same nebula image make demo content look like missing evidence rather than a deliberate motif.
- “Founding of WKF” records a milestone but does not yet give a visitor a reason to engage.
- Institutional details in the footer are useful but visually weak relative to the page’s decorative cards.

## Questions to Consider

1. What should the primary Join action do: invite visitors to the next open meeting, explain formal membership, or start a direct contact/Discord conversation?
2. Which trust fact should appear before the event: legal personality and KRS, nonprofit cultural purpose, or the umbrella role for smaller initiatives?
3. Should the next pass address only the three P1 trust and integrity issues, all five priorities including mobile and raster icons, or begin with link hardening as an isolated low-risk change?

## Run Notes

- Target slug: `src-app-frontend-page-tsx`.
- Ignore list: `.impeccable/critique/ignore.md` was absent; no rules were ignored.
- Independence: Assessment A completed before the parent read Assessment B detector findings.
- CLI detector: completed successfully with 0 source findings.
- Browser visibility: the site was inspected at 1440×1200 and 390×844 in fresh headless Playwright contexts against the existing healthy local Docker application.
- Overlay injection: `detect.js` loaded successfully and overlay DOM elements were present at both widths; no user-visible browser tab was available, so no visible-overlay claim is made.
- Live-server cleanup: the temporary Impeccable server on port 8400 was stopped; its PID no longer exists and the port is closed. The pre-existing project Docker application was not modified or stopped.
- Temporary cleanup: browser helper scripts were removed; evidence screenshots and the isolated detector result were retained only until parent synthesis.
- Snapshot and trend: written successfully. The current trend contains one run at 16/32, with 0 P0 and 3 P1 issues; no earlier comparable snapshot exists.
