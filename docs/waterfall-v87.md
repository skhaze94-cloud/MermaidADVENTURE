# 8.7 — Waterfall Adventure

Only Stage 1’s waterfall and its edition label change. The 8.5 tutorial, 8.6 sky routes and foregrounds, Sarah’s jump routines, other chapters and boss encounters retain their previous behavior.

## Movement and encounters

- Four-direction swimming in the shaft, with exponentially smoothed acceleration and a visible safe movement envelope. The downward current still carries the scene through its 17-second descent.
- Boost in any direction, with normalized diagonal speed, the usual 0.4 energy cost, a short cooldown, and last-direction fallback. Unlimited boost can be held. Keyboard and the existing multi-touch pad use the same input path.
- Three painted eels, with independent tail deformation, coil warnings and a short sideways lunge. A boost defeats swimming hazards; reefs remain dangerous.
- Hazard and treasure checks use the same rendered screen positions as Sarah, including vertical displacement. Dodging vertically now avoids actual contact, rather than merely moving the artwork.

## Presentation and efficiency

Crisp vector ripple rings and specular crests mark the inlet. One opaque cliff wall per side replaces the three overlapping sets of translucent reef scenery. The wall uses the original Highland stone material, with pixel-matched mirrored seams. A distant underwater backdrop, clear whirlpools, moving water streaks and two-axis bubble wakes retain depth without obscuring encounters. Sarah banks, looks and animates with her local swimming velocity.

Static backdrop lighting, source-image resampling and wall masks are cached once; only two reusable surfaces are retained. Animated scenery is viewport culled. Pull-in and outflow preserve the same hero across an uninterrupted transition.

## Verification

42 regression suites and all JavaScript syntax checks passed. Waterfall coverage includes directional and diagonal controls, multi-touch release/cancellation, energy, cooldown, unlimited boost, vertical collision avoidance, eel combat, boundaries, pause, steering at 30/60/120 Hz, death/retry, the full descent, checkpoint and transition continuity. Native Canvas renders cover the approach, pull-in, mid-shaft, eel encounter and outflow.

The native CPU rendering benchmark at 1400×960 measured a final waterfall median of 5.33 ms and P95 of 6.05 ms over 24 warmed frames. These are local rendering timings, not physical-device/browser FPS claims. The richer background costs more than the old sparse waterfall; caching avoids repeatedly resampling and masking the textures. Physical iPad and low-end device checks remain a follow-up.

The standalone HTML embeds all source, 41 shared graphics/fonts assets and soundtrack data. No external runtime script or asset downloads are needed.
