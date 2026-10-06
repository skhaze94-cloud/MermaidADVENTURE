# Sarah Maria Family Adventure 5.0 — Definitive baseline

Continue future game work from this release. The live app is `dist/index.html`; load scripts in the order declared there. The source repository and its version history are authoritative. This is a complete static game; it has no build-time or network API dependency.

## Architecture

- `game.js`: controls, movement/jumps, main loop, stage lifecycle, HUD, shared rendering.
- `performance-v5.js`: bounded simulation substeps, reusable mesh layouts, 24 MiB LRU texture cache, UI helpers.
- `family.js`, `tutorial.js`, `tutorial-two.js`: King Daddy, Queen Antonella, Tutorial 2.0, family story and environment.
- `highland.js`: extended Highland story chapter and 17-second waterfall.
- `rana.js`: Rana encounter state machine, attack geometry and damage.
- `nessie-twist.js`: crown quest, betrayal, final encounter and retry checkpoint.
- `boss-v4.js`, `boss-v4-crops.js`: all six articulated bosses and painted atlas bounds.
- `polish.js`: shared artwork, creature animation, mesh rendering and effects.
- `conversation.js`, `music.js`: dialogue navigation and audio lifecycle.
- `assets/`: complete runtime art/audio; preserve atlas coordinates when replacing textures.

## Performance changes

1. Consume elapsed gameplay time in substeps no larger than 1/60 second, bounded to 100 ms per displayed frame. Previously the update discarded elapsed time above 35 ms, visibly slowing swimming during sustained low frame rates. Catch-up remains bounded after long stalls.
2. Reuse mesh topology and affine coefficients; avoid allocating triangle arrays for every sprite section. Sarah's 8×8 grid keeps her deformation functions and animated parts while reducing triangles from 192 to 128.
3. Cache prepared sprite crops as immutable ImageBitmaps where OffscreenCanvas supports them. Rasterize at twice logical sprite resolution. Cap cache storage at 24 MiB and close evicted bitmaps; retain original-art fallback if a bitmap is unavailable/not ready. Mesh layout cache is separately bounded to 48 entries.
4. Paint HUD at most 20 times/second from the frame loop, rather than on each simulation substep. Reuse unchanged indicator markup and cache DOM lookups while invalidating detached elements after menu rebuilds.
5. Skip offscreen portal/boss rendering, preserving their simulation and using generous bounds for appendages and effects.
6. Remove only the unreachable legacy final-boss/tentacle renderers. Keep active fallback renderers and every level, mechanic, conversation and asset.

## Local rendering measurement

1400×960 native canvas, 4 warm-up frames and 24 measured frames per scene, same assets and camera states. Median milliseconds per draw, not browser FPS. Headless tests cannot measure phone GPU, DOM layout, thermal throttling or browser compositing.

| Scene | Before (ms) | 5.0 (ms) | Reduction |
|---|---:|---:|---:|
| Highland | 7.41 | 5.28 | 29% |
| Palace | 5.12 | 4.36 | 15% |
| Rana lasers | 6.25 | 5.47 | 12% |
| Waterfall | 2.78 | 2.10 | 24% |

Run `node tests/benchmark.cjs` with CODEX_PRIMARY_RUNTIME_NODE_MODULES pointing to installed @napi-rs/canvas. The harness waits for cached bitmap decoding before measurement. Visual comparison is in `tests/render-hero-v5.cjs`.

## Release checks

`tests/performance-v5.cjs`: equivalent movement/timer progress at 20, 30, 60 and 120 Hz, paused simulation, bounded stall recovery, batch cleanup and topology reuse.

Existing checks cover controls, menu flow, tutorial, all boss state machines, dialogue branches, open jumps, power-ups, waterfall, crown handoff, ending and checkpoint retries. All passed for this release. Rendered checks cover Sarah deformation and Rana's attack states. Browser/device performance remains to be verified on target hardware.

Do not change collision geometry merely to fit decorative art. Do not reduce effects or scenery as a performance shortcut without explicit direction. Preserve the variable-step public update helpers for deterministic scenario tests; the displayed game loop calls advanceSimulation.
