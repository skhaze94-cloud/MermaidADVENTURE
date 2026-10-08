# 8.1 — Dynamic Sarah Update

Sarah now has matching independently animated painted parts, replacing the single-surface bob used in 8.0. The update is limited to her character presentation and release/version metadata. Level graphics, UI styling, dialogue, controls, collisions, scoring and boss behaviour are unchanged.

## Movement

- Separate shoulders, elbows and wrists for both arms, with alternating swimming strokes.
- Neck and head rotation follow swimming direction; boosts blend into a slight head tuck and streamlined arms.
- A connected two-segment tail carries two independent terminal fins; a third side fin flutters separately.
- Back hair, a front lock and a trailing strand have different phase offsets and gentle mesh flow.
- Existing jump/spin transforms carry the rig, with a lighter airborne arm pose and additional hair flow.
- The opening scene, entrances, portal travel, regular gameplay and waterfall all use the same Sarah renderer.
- Boost afterimages use one reusable small offscreen surface, refreshed at most every 70ms. No extra particle systems or gameplay work.
- The face is a rigid painted head; it never passes through triangle deformation. Pause stops pose transitions; reduced motion uses a still articulated pose. The original Sarah image remains as a missing-art fallback.

## Artwork and implementation

`dist/assets/sarah-parts-v81.webp` contains 16 isolated padded sprite parts, with the segmented arm cells superseded by `dist/assets/sarah-arms-refined-v81.webp`, two continuous arm silhouettes. `dist/sarah-dynamic-v81.js` defines normalized crops, parented joints and bounded animation curves. The atlas is included in the artwork loading gate and offline HTML registry. Small reusable meshes bend only hair, scales and fins; their dimensions are fixed even when Sarah is shown larger on the opening screen.

Built-in image generation used the existing `sarah-mermaid.webp` as the identity reference. Prompt set:

1. Preserve Sarah’s child-friendly brown-eyed face, olive skin, wavy brown hair and pearl clip, lavender scaled short sleeves and luminous turquoise/violet tail. Create a transparent 4×4 atlas of torso, rigid head, back hair, front hair lock, far upper arm/forearm/hand, near upper arm/forearm/hand, proximal and distal tails, upper/lower/side fins and a hair strand. Fully isolated overlapping parts, no baked limbs, no background or text.
2. Preserve the exact atlas positions and character identity. Replace hollow sockets and cut cross sections with solid painted rounded skin, sleeve and scale attachments for seamless overlapping joints. Preserve transparency and facial detail.

The result was mechanically cropped, resized and packed as a transparent WebP; no image-generation API key or CLI fallback was used.

## Verification

The arm refinement removes visible shoulder/elbow/wrist cut-piece seams. Continuous painted arms use soft blended elbow and wrist skinning, gentler strokes and calibrated near/far proportions, while retaining the separate motion channels. Both arms preserve their full fingers and remain attached through swimming and boost poses.

A further built-in image-generation prompt used the original Sarah image: two complete isolated arms, smooth natural child proportions, tapered wrists, moderate soft open hands, lavender short sleeves, no segmented tubes, sockets, caps or elbow/wrist outlines; transparent background. The result was mechanically cropped and packed into a padded 1024×512 WebP. The generated full arm span is calibrated to 69/64 game units; continuous arm skinning has dedicated joint-continuity and size checks.

All 35 focused regression checks and JavaScript syntax checks pass. The new regression covers independent animation channels, boost transitions, face protection, pause/reduced-motion behaviour, missing-art fallback, bounded drawing and unchanged gameplay state. Native canvas visual checks cover enlarged swimming/look/boost/airborne poses, the in-level model, boost afterimages and the opening scene. Offline HTML embeds all 39 shared assets plus fonts and soundtrack, parses all embedded source and remains below 30 MiB.

The native canvas development rig benchmark measured a 1.1ms median render and approximately 1 MiB of reusable mesh textures in this environment. Native canvas development timings are not physical-device performance guarantees. Physical iPad touch testing was not performed for this character-only change.

### Shoulder and collar alignment

Restored the painted arm aspect ratios instead of flattening them vertically. The near sleeve now covers the original torso sleeve at the shoulder socket. Both arms, the collar, head and front hair share the torso transform so gentle body motion does not pull the joints apart. The neck is anchored at the centre of the collar and turns around that point, with smaller look and boost angles. Reviewed enlarged swimming, boost and airborne poses, both directions and the opening scene. Tail motion remains unchanged.
