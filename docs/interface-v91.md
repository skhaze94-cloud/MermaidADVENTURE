# 9.1 — Definitive Interface

## Presentation

- One HUD rail groups score, chapter, health/time and pause. Decorative shells, multiplier beads and redundant labels are removed. Small phones show the essential score/health/chapter information without extra counter pills.
- Nunito is used consistently for interface text and numerals, with stronger contrast, quieter borders and fewer shadows. The illustrated title logo and painted world artwork remain.
- Matching menu buttons provide a clear primary adventure action; the chapter drawer stays scrollable. Conversation cards, rewards and subtitles share the same visual language.
- Mobile D-pad direction buttons are 50px on normal phones, 44px on narrow phones and 56px on large tablets, reduced from the previous 68–90px targets. Jump/Boost/Bubble use matching 58px buttons (48px wide on narrow phones, 64px on large tablets).
- A compact energy strip stays visible above mobile actions. Bubble availability remains on its button; its extra HUD panel appears only during Bubble Rush. Powered jump and rush feedback retain distinct borders.

## Cues and controls

Tutorial practice steps show a short, single-line cue for one second. Drawing repeatedly cannot restart it, pausing freezes its timer, waiting for a practice marker does not consume it, and loading a stage resets it. Waterfall help also expires after one second; the first boss lesson lasts at most one second. General toast duration is one second. Story speech and conversations retain their timing.

Keyboard controls, sliding/diagonal D-pad input, multitouch ownership, pointer cancellation, jump timing, boosts, attacks, enemies and level lengths retain their 9.0 behavior. Action targets remain at least 44px.

## Verification

45 focused regression suites cover game behavior and the new cue lifecycle. The offline export embeds its assets and passes syntax/size checks. CI runs Chromium at 1440×1000, 390×844, 320×568, 844×390 and 1024×768 to check HUD/control bounds, nonoverlapping mobile controls, target sizes, the visible energy strip, actual pointer release and hint expiry. CI retains menu/game/tutorial screenshots for each viewport. Emulated touch coverage does not substitute for a physical-device play session.
