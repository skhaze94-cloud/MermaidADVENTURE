# 7.5 Painted Worlds

Two RGBA WebP atlases contain 24 scenery pieces painted from the eight supplied texture references. The source images were mechanically cropped, resized and packed into equal 384-pixel cells. No external image requests are required.

Tutorial and palace use pearl architecture; Highland and jungle use sand, stone and sponge gardens; Rana and Shadow use luminous coral and crystals; Blackwater uses subdued stone reefs. Separate far and middle layers scroll at 0.18 and 0.43 camera speed. Only visible cells are evaluated. Scenery is decorative: obstacle materials preserve the original collider coordinates and dimensions. Reduced motion disables plant sway. Missing scenery art falls back to the existing renderer. Both atlases participate in the artwork loading gate.

The waterfall gains bounded scrolling reef pieces beside the existing current and hazards. Two malformed Blackwater gradient colors from the preceding route shortening were restored. Dialogue, sprites, audio, jumps, enemy AI and stage boundaries remain unchanged.

Validation: all 33 focused regressions, native canvas renders of eight chapter locations, syntax checks and standalone export. Native canvas timing is a development comparison, not an iPad frame-rate guarantee.
