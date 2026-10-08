# Sarah Maria — Highland Gold, Godot 4 (native upgrade v0.2)

This project is the **Godot-native vertical slice** of Mermaid Sarah's first story chapter, built from the existing HTML 9.1 repository. It is a real Godot scene and scripts rather than a webpage embedded in a Godot window. The browser version in `dist/` remains available and unchanged. Godot loads the existing artwork and MP3 directly from `res://dist/assets/`.

## Open the project

1. Download/clone the full `godot/highland-gold-level-1-prototype` branch, including `dist/assets`.
2. Open **Godot 4.4+** (standard edition, not .NET required).
3. Import **`project.godot` at the repository root**, not the `godot/` directory.
4. Allow asset import, then press **F5**. You can inspect `godot/highland_level.tscn` and its native child nodes in the scene editor.
5. Play in landscape orientation. Current project window is 1400 × 960 with stretch scaling.

## v0.2: actual Godot engine advantages

| System | Engine-native improvement |
| --- | --- |
| **Sarah character** | Native layered `Sprite2D` atlas regions, parent-child head/arms/hair/tail/fin joints, procedural swimming motion, smooth directional turns, boost pose and rigid painted facial artwork |
| **Underwater lighting** | `ShaderMaterial` applied to a `ColorRect`: animated caustics, waterline fade and depth-dependent light; effect runs in Godot's shader renderer rather than per-particle Canvas JavaScript |
| **Underwater atmosphere** | `CPUParticles2D` swim bubbles and one-shot burst emitters on impacts, treasure and boosts, with a generated soft bubble texture |
| **Boss feedback** | Carlo has his own `Sprite2D`, `PointLight2D` vulnerability tint, a hit scale `Tween` and an animated defeat |
| **Controls** | Analogue gamepad thumbstick with radial dead zone; D-pad and A/B/X/Start buttons; optional gamepad rumble on boost, collision and boss hits; existing keyboard/touch remain |
| **Presentation** | Look-ahead camera smoothing, tweened impact flashes and native music ducking during waterfall entry/outflow |
| **Authoring** | Independent, editor-visible `NativeUnderwaterFX`, `SarahAtlasRig`, and `CarloNativeBoss` nodes in the main scene |

The animated rig uses the **original Sarah body, hair, tail, fin and arm artwork** but does not yet reproduce all of the browser version's custom 16-part mesh deformation. It is a native joint-based foundation for further rigging work.

## Current gameplay

The current playable Level 1 retains the full 20,748-unit Highland Gold route, the 1.8-second waterfall entry, 17-second four-direction descent, 1.6-second outflow, 12 timed waterfall hazards (including eels), 22 timed waterfall pearls, Carlo's boss area, post-fall obstacle geometry, pickups, checkpoints, health and portal completion. The boss attacks and overall enemy roster are still simplified relative to the HTML release.

## Controls

| Input | Action |
| --- | --- |
| WASD / arrow keys | Swim in four directions |
| Space / Shift | Boost |
| J | Leap from underwater |
| B / Z | Mermaid Bubble (after Carlo) |
| P / Esc | Pause |
| R | Restart |
| M | Mute / unmute music |
| F3 | Reduce / restore animated effects |
| Controller left stick / D-pad | Analogue movement |
| Controller A | Jump |
| Controller B | Boost |
| Controller X | Mermaid Bubble |
| Controller Start | Pause |
| Touchscreen | D-pad plus on-screen actions |

## Files and editing

```
project.godot                       # Import the repository root
godot/highland_level.tscn           # Real Godot scene and native editable child nodes
godot/highland_level.gd             # Level progression, combat and gameplay state
godot/highland_data.gd              # Geometry and source-driven enemy/treasure timings
godot/sarah_rig.gd                  # Sprite2D/AtlasTexture procedural skeletal rig
godot/native_fx.gd                  # Shader layer, CPUParticles2D, Tween feedback
godot/carlo_boss.gd                 # Boss sprite, native 2D light, hit/defeat animation
godot/shaders/underwater_caustics.gdshader
godot/level1_smoke_test.gd         # Godot engine integration checks
dist/assets/                        # Original textures/soundtrack; NOT duplicated
```

## Testing and known limitations

GitHub Actions runs Godot 4.4.1 in headless editor mode, imports assets and scripts, tests waterfall/pickups/victory, verifies the native shader, rig joints, particle and boss light nodes, and launches the game scene. Automated success means compilation and gameplay logic are validated; **it is not a substitute for visual inspection on a GPU or a physical Android device**.

The current project is a **prototype**, not yet a faithful full-feature replacement for HTML 9.1. Its enemy roster and AI, detailed Carlo attack sequencing, hand-painted scenery alignment, dialogue, all story panels, full sprite-deformation rig, menu UX and native release packaging still need porting and QA. Physics/collisions still use the source-inspired gameplay implementation rather than fully separate Godot `CharacterBody2D` / `Area2D` components. Music uses the source MP3 with limited tweens, not a full adaptive audio mixer.

Recommended next phases: visually test the shader and rig in a Godot editor window; separate collision/player/enemy scenes and introduce `CharacterBody2D` where gameplay parity can be maintained; convert detailed animation curves to `AnimationPlayer` / `AnimationTree`; re-create all enemy attack telegraphs and Carlo phases; then package Windows and Android exports.

## Credits

Artwork and soundtrack derive from assets already in this repository. Their copyright status does not change. Godot Engine is MIT-licensed.
