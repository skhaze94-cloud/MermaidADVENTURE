# Living Reef 7.31 artwork

Production assets: `dist/assets/crab-poses-v731.webp`, `eel-poses-v731.webp`, and `jelly-v731.webp`.

The built-in image generation tool was used with the supplied reference artwork. Source alpha was preserved, pose cells cropped and packed, and assets encoded as WebP. No runtime image processing is required.

Prompts:
- Crab: clean transparent animation strip matching the orange-red spiky middle-size reference crab; four whole-character frames in one row: idle, walking with alternating legs and raised left claw, both claws raised preparing attack, and open claw extended attacking. Consistent scale and perspective, blue expressive eyes, golden underside, polished painted children's underwater adventure art. No background, scenery, VFX, text, or neighboring fragments.
- Eel: four whole-character frames in one row, each facing right: gently curving swimming eel, opposite tail curve, coiling for electricity, and open-mouth lunge with stretched tail. Consistent cobalt blue scales, golden lightning dorsal fins, cream belly and expressive eyes, matching the supplied reference. Transparent background; no scenery, external lightning, splash, bubbles, text, or neighboring fragments.
- Jellyfish: one luminous blue-violet jellyfish based on the upper-row third reference jellyfish; translucent domed bell with pink inner organs, flowing lavender ruffled tentacles and thin cyan tendrils, all fully visible. Polished painted children's underwater game art. Portrait composition on a transparent background; no scenery, bubbles, platforms or text.

Animation uses bounded cached triangle meshes and localized claw, leg, tail, bell and tentacle movement. The shared renderer's horizontal affine coefficient now uses the third vertex's X coordinate correctly. An identity-transform regression guards against future distortion.
