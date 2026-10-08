# 9.0 — Painted World Adventure

## What caused the muddiness

The runtime accumulated several generations of scenery: the original scrolling flora, atlas-cell decorations with large empty margins, repeated translucent ruins, a second grotto painting and colour washes, and foreground decoration rendered after gameplay. The Highland pass could tint Sarah herself. Environmental motion used fourteen individually offset horizontal image slices, producing visible joins. Some native canvas engines also misinterpreted numeric font weight 1000, making small labels enormously oversized.

## Rendering changes

- One original painted background per area, using slow bounded parallax. The actual painted water horizon is aligned to the physical swim/jump surface. The grotto uses a clean underwater crop with a light cave grade.
- Trimmed reef/pearl atlas crops preserve their natural proportions. Sparse nearby gardens and landmarks use near-full opacity rather than overlapping ghost copies.
- Decorative flora, caustics and the clipped 52-pixel seabed edge render before obstacles, enemies, rewards and Sarah. The Highland current, tint and landmarks also render before actors. Combat telegraphs, jump flourishes and story transition effects retain their intentional layering.
- Removed the legacy flora sheets, repeated tutorial ghost vistas, duplicate palace colour washes and faded backdrop curtains. Solid route artwork and the 8.6 collision bands remain intact.
- Environmental ornaments use one affine sway, with their aspect ratio preserved. No slice seams or overlapping translucent strips. Scenery respects reduced-motion settings and viewport culling.
- Refined the pearl game frame, title panel, release seal and dialogue surfaces. Touch panels avoid backdrop blur. Canvas font weights stay within 900 for consistent rendering; reward amounts remain unchanged.

## Route changes

Core story world lengths are exactly 70% of 8.7: 20,748 / 23,205 / 25,935 / 29,120. Enemy rosters remain 68 / 36 / 40 / 18, including unchanged shark/eel counts. Collectibles, boss locations, launch metadata, checkpoints and route objects follow the shorter routes. Stage 1 preserves the 4,060-unit waterfall opening and takes the extra reduction from the later route, retaining the tested waterfall transition and 17-second descent. Boss and portal clearance are preserved.

The tutorial stays 7,600, Shadow Crab Kingdom 14,300, Blackwater Tunnel 10,270 and timed trials 3,800. Controls, six jump routines, score values, boss attacks, soundtrack and dialogue remain intact.

## Verification

The 44 CI regression suites cover controls, jumps, every major boss, stage access, enemy AI, scoring, offline export and the waterfall. The new 9.0 regression checks exact length ratios, unchanged enemy/species counts, bounded objects and rewards, rendering order, rendering without gameplay changes and excluded-stage lengths. Existing geometry assertions were updated to the new route lengths without removing their checks.

Native Canvas scenes are visually inspected for the tutorial, inlet, grotto, lagoon, palace, Rainbow Ruin, Shadow Kingdom and Blackwater, plus five waterfall transition/encounter scenes. Rendering checks are reproducible with `tests/render-overhaul-v90.cjs` and `tests/render-waterfall-v87.cjs` using the supplied runtime canvas dependency.

A local browser run could not be completed because Chromium was unavailable and its download failed. Browser UI, live audio, physical iPad and low-end device performance remain unverified. Native render timings do not establish browser FPS.

The CI export creates a complete standalone HTML with embedded artwork, fonts, source and soundtrack. VERSION, game labels, browser title, README and export artifact agree on 9.0.
