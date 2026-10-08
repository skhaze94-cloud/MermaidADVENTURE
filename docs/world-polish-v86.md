# 8.6 — World Polish & Sky Adventure

## What changed

- Six newly painted, transparent-background sky reef sprites: Highland granite and heather, Colombian jade and orchids, gilded pearl marble, purple shadow slate, cyan crystal limestone and carved rainbow sandstone.
- Six optional airborne obstacles per story chapter, arranged in three two-ledge clusters with open gaps, bonus hearts/boosts, and clear boss/portal approaches. Time trials get a shorter two-ledge route and keep their exact coin totals and minute timer.
- Foregrounds use alpha-trimmed whole painted objects, rather than narrow transparent atlas slices stretched into panels. Shading applies only to painted pixels. Transparent gutters remain transparent; solid rock interiors stay opaque.
- Three contiguous collision bands follow each rock's mass. Decorative coral/fronds do not create invisible rectangular walls. Swimmer and enemy collision share the same bands. Airborne collisions stop movement into stone without damage or cancelling the jump.
- Antonella's previously low-opacity “projection” is now a fully opaque swim-in, pause and swim-out cameo. Both painted and fallback palace rendering use the same appearance. She starts and finishes outside the viewport. Her dialogue and boss fight timings remain unchanged.
- Foreground surfaces use a bounded 8 MiB cache, visible-object culling and reused collision lists. Asset loading clears fallback caches when artwork becomes available.

- Fixed the pre-existing empty-launch-point jump error in Blackwater; jumping there now uses an open-water reference point, without restoring jump portals.

## Preserved

Existing backgrounds, chapter lengths, story dialogue, controls, six Sarah jump styles, splash-bounce grace periods, boss reward jumps, attack schedules, damage/scoring rules, tutorial 8.5, waterfall sequence and Nessie's finale. The finale still clears its arena as before.

## Validation

41 automated suites cover the existing game plus new six-chapter route connectivity, solid sky collision, ordinary unpowered landings, reward clearance, trial totals, idempotent setup, opaque/offscreen Antonella entrances and tutorial isolation. Native Canvas contact sheets reviewed all six chapter themes. Keyboard and touch event regressions pass. Offline export embeds source, music, fonts and all artwork with no external script links.

Native Canvas timing is a server-side rendering benchmark, not a mobile GPU measurement. No physical iPad/device testing was available. Collision bands approximate painted rock outlines; flowers and coral tips are decoration. Sky routes in Blackwater remain subject to its existing darkness and Sarah's light.

## New art

`dist/assets/sky-reefs-v86.webp` was created with the built-in image-generation tool. Prompt: six isolated side-on floating reef islands in a transparent 3-by-2 atlas, with opaque stone interiors, detailed layered materials and restrained plants; Highland, jungle, pearl palace, shadow, grotto and rainbow motifs; no text, characters, coins or background.
