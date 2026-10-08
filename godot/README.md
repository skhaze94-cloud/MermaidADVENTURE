# Godot 4 — Highland Gold Level 1 (first playable port)

This is an **independent Godot gameplay prototype** of the first story chapter of Sarah Maria Family Adventure 9.1. The HTML game in `dist/` has not been replaced. The project is deliberately located at the **repository root** (see `project.godot`) so Godot can import the original `dist/assets/*.webp` and `*.mp3` directly without doubling the artwork in Git.

## Open and run
1. Clone or download the **whole repository**, including the `dist/assets` directory. Do **not** import just the `godot/` folder.
2. Install Godot 4.4 or newer (standard edition; **no .NET SDK** required).
3. Godot Project Manager → Import → browse to the root `project.godot` → Import & Edit.
4. Let textures and the MP3 import, then press **F6** on `godot/highland_level.tscn` or **F5** for the project.
5. Best played in a landscape window. For desktop: arrows/WASD swim, Space/Shift boosts, J jumps, P/Esc pauses, R restarts. Bubble attack is B/Z after defeating Carlo. Touch D-pad and actions are drawn on touchscreen devices.

## What is already playable
- The 20,748-unit Highland Gold story route and camera follow.
- Painted Highlands, Sarah artwork, reefs, flora, crabs, eels, jellyfish, Carlo, and original MP3 from the HTML repository.
- Four-direction swimming; 40%-energy boosts; steerable sky jumps; energy recharge.
- The 1.8-second waterfall entry, 17-second descent, 1.6-second outflow, four-direction steering, boost dodging, three timed eel hazards, twelve total timed hazards and 22 pearl opportunities.
- Post-fall obstacle geometry, moving enemy encounters, chest/pearl/heart/boost pickups, score, health, respawn checkpoints.
- A simplified, multi-hit Carlo fight with readable green damage windows, Mermaid Bubble unlock and exit portal.
- Simple desktop/touch controls, pause, reset, victory panel and music loop.

## Port status (important)
This is a **new Godot implementation**, not a one-to-one engine conversion. It intentionally ships as a playable *vertical slice*, not a finished replacement for HTML 9.1. The first level's route dimensions, major milestones and waterfall timing derive from `dist/highland.js`. Some source details have been deliberately simplified:
- Sarah's intricate 16-part 8.1 articulated mesh is replaced with her complete painted sprite and basic tilt/float animation.
- The current enemy cast is a hand-selected source roster (not the full 68 enemies), without every original telegraph/attack or AI behaviour.
- Carlo's original 2D articulated boss rig, dialogue sequences and his exact attack pattern are **not** reproduced; the port uses a simplified encounter.
- Some terrain skins are stretched from the existing transparent painted images. Background crop and scene lighting need editor-side visual polish.
- Source game music is reused, but HTML's Web Audio fades and dynamic cues are not yet ported.
- The existing HTML version's later chapters, menus, Shadow Kingdom transition and tutorial are outside this Level 1 prototype.
- **GitHub Actions validates this project with Godot 4.4.1 headless editor import, scene launch and gameplay assertions** (waterfall duration and transitions, pickups, route geometry, Carlo state and portal victory). The game has **not** been visually or interactively play-tested in a native window; animation, mobile controls, audio and performance still require hands-on QA.

## Layout

```
project.godot                   # Import this root in Godot
dist/assets/                    # Existing painted artwork and MP3
godot/highland_level.tscn       # Start scene
godot/highland_level.gd         # Input, draw, gameplay, boss, waterfall, UI
godot/highland_data.gd          # Route locations and enemy/treasure manifests
godot/default_bus_layout.tres   # Audio
```

## Next milestones
1. Run the Godot editor locally, inspect the Debugger panel and test movement/gamepad/touch rendering in an actual window.
2. Capture screenshot and compare the first 4,060 units, waterfall, grotto and Carlo with HTML 9.1.
3. Convert Sarah's painted 16-part rig into an AnimationTree or skeletal animation scene.
4. Port the source's full enemy roster, AI, dialogue, particle effects and quest/bubble unlock sequences.
5. Split this initial self-contained Node2D into separately reusable Player, Enemy, Waterfall, Boss, World, and HUD scenes.
6. Build/export smoke tests for desktop and Android.

## Credits
All artwork/music derives from assets already committed to this repository. Copyright and license of those assets are unchanged. Godot Engine is MIT licensed.
