# 8.0 — Treasure Edition

Painted collectibles, a pearl-and-sea-glass scoring interface, readable rounded display typography and three distinct tutorial artifacts. Exact reward amounts come from gameplay state, never pre-painted numbers. Dialogue and direct skill lessons remain visible; exploratory and exit instruction cards are quieter. Boost pickups now say **BOOST +8s**, matching their effect. A taken power-up cannot grant its effect again.

## Artwork

- `dist/assets/treasures-v8.webp`: 16 padded 256px cells. Pearl, ruby, aqua and amethyst; star coin, chest, heart and infinity crystal; orange and pink starfish, scallop and spiral shell; conch, sand dollar, crown and compass.
- `dist/assets/reward-frames-v8.webp`: six padded 512px frame cells, with transparent centres for live text.
- `dist/fonts/treasure-display.ttf`: Fredoka variable display font, bundled with its SIL Open Font License.

Created with image generation using the supplied treasure and scoring reference sheets, then mechanically cropped, resized and packed as transparent WebP atlases. No runtime image generation or external font service is needed.

Treasure prompt: premium dimensional pearl/coral/sea-glass game art, 4×4 atlas, isolated objects, consistent lighting, transparent background, no text, numbers or labels, readable at 48px.

Frame prompt: pearl-shell, turquoise splash, gold crown, pink heart, treasure chest and three-star frame ornaments; 3×2 atlas; transparent background and empty central text areas; no fixed scores or words.

## Verification

JavaScript syntax and all 34 focused CI regressions, including live score amounts, duplicate pickup prevention, preload registration and preserved character captions and jump teaching. Native canvas visual checks cover tutorial, Highlands, palace, Rana and the collectible/reward artwork. Offline export parses every embedded script, validates the shared asset registry, embeds soundtrack and fonts, and stays below 30 MiB.

Gameplay routes, controls, character and boss animation systems, point values, soundtrack routing and the 7.51 environment artwork are preserved. Native canvas checks do not replace physical-device touch testing.
