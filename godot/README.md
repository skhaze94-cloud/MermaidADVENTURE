# Sarah Maria — Highland Gold, Godot 4 (animation & performance v0.5)

This project is the **Godot-native vertical slice** of Mermaid Sarah's first story chapter, built from the existing HTML 9.1 repository. It is a real Godot scene and scripts rather than a webpage embedded in a Godot window. The browser version in `dist/` remains available and unchanged. Godot loads the existing artwork and MP3 directly from `res://dist/assets/`.

## Open the project

1. Download/clone the full `godot/highland-gold-level-1-prototype` branch, including `dist/assets`.
2. Open **Godot 4.4+** (standard edition, not .NET required).
3. Import **`project.godot` at the repository root**, not the `godot/` directory.
4. Allow asset import, then press **F5**. You can inspect `godot/highland_level.tscn` and its native child nodes in the scene editor.
5. Play in landscape orientation. Current project window is 1400 × 960 with stretch scaling.

## v0.5: native animation and performance update

**Focus:** make Sarah and nearby sea creatures move more expressively while reducing avoidable rendering work. Level 1 routes, collisions, waterfall timing, pickups, Carlo and the source HTML remain unchanged.

### Animation
- **State-blended Sarah rig:** independent idle/swim/boost/leap/turn/hit animation blends use time-based exponential smoothing. Tail and fin undulation respond to movement speed; arms move into a boost posture, hair settles after turns, and the head counter-rotates lightly to preserve facial clarity. Instant horizontal facing flips avoid zero-width sprite distortion.
- **Native enemy sprites:** crabs, eels and jellyfish are now preconstructed `Sprite2D` instances with per-enemy `AtlasTexture` regions. Atlas animation, flip, float and tilt are updated only for enemies within the camera view. Puffer and swordfish illustrations retain their existing hand-drawn motion.
- **Underwater garden motion:** far/mid reefs and sparse foreground plants sway only while on-screen at a capped 24 Hz; the waterline glints redraw at up to 30 Hz unless camera motion requires earlier refresh.

### Performance and diagnostics
- **Pooled particle bursts:** ten `CPUParticles2D` emitters are created at level load and recycled for boosts, hits and pickups. No transient particle node or one-shot timer is allocated per burst.
- **Enemy visual LOD:** expensive sprite changes are capped at approximately **30 Hz in High** and **20 Hz in Economy**. Gameplay collision checks and enemy motion retain their original update rules. Sprite renderers are hidden during the waterfall.
- **Shader and scene caching:** grotto shader parameters are sent only when the depth profile changes; 2.5D scenery position updates skip subpixel camera travel; off-screen garden sprites are hidden.
- **HUD invalidation:** the native `CanvasLayer` retains a status snapshot and redraws only on material display changes. Boost/progress bars are quantised for legibility and to avoid costly repaints on 120 Hz displays. Pause screens do not continuously rebuild the gameplay painter.
- **Economy light culling:** `F4` disables the dedicated Sarah/Carlo `PointLight2D` effects as well as the higher-cost postprocessing passes.
- **Real-time performance monitor:** press **F6** in the running game to see actual Godot FPS, visible/total native enemies, particle pool size, and the quality preset. Hidden by default; the widget refreshes twice per second.
- **Regression tests:** Godot's headless suite checks sprite visibility and throttling, particle pool boundedness, Sarah's blends, HUD redraw suppression, F6 toggling, economy lights, and the established waterfall/pickup/portal logic.

**Important:** 24/30/20 Hz refer to the *visual animation work cadence*, **not a limit on the game's frame rate**. This update does not claim a measured FPS increase on Windows, Android or Web until hardware profiling has been performed. The on-screen F6 FPS monitor provides a way to quantify performance on each target.

### Key new files
`godot/animated_enemies.gd` (native enemy atlas pool) and
`godot/performance_overlay.gd` (opt-in live performance counters).
`godot/sarah_rig.gd`, `godot/native_fx.gd`, `godot/world_depth.gd`, `godot/foreground_depth.gd`, `godot/water_surface.gd`, `godot/premium_hud.gd`, `godot/highland_level.gd`, and `godot/level1_smoke_test.gd` were also updated.

## v0.4: comprehensive graphics overhaul

This is a **full visual-presentation pass** on the *existing Level 1*, rather than a new level, a 3D engine rewrite, or a replacement HTML build.

### Upgraded original artwork and in-game graphics
- **Native premium HUD:** a dedicated `CanvasLayer` above all screen shader passes; responsive translucent rounded glass-and-pearl cards, custom illustrated heart meters, smoother boost bar, scoring and collectible readout, boss health, slim route ruler, touch control skins, and readable pause/victory screens. The root gameplay painter no longer renders a second, conflicting interface.
- **Sarah lighting and silhouette:** her articulated `Sprite2D` artwork remains intact, with a small soft `PointLight2D` that responds to boosting. Turning no longer squashes her facial art through zero scale.
- **Water surface:** the old ruler-straight line is replaced with a native Node2D drawing layered, gently moving wave highlights and 32 deterministic sparkle/foam glints. Visual-only; swimming and collision remain unchanged.
- **Creature makeover:** original painted crab/eel/jelly strips remain, with glow and motion accents; the previously circular placeholder **puffers and swordfish** receive custom, multi-tone fish silhouettes, eyes, fins and highlights.
- **Rewards and jewels:** pearls, health, crystals and treasure chests are redrawn as more dimensional, detailed collectibles with limited four-point specular glints.
- **Waterfall:** the side walls are now textured using the repository's reef art in manageable sections; extra soft lighting shafts and spray improve the sense of speed without multiplying opaque walls or altering the tested 17-second descent.
- **Cinematic grading:** a standalone GPU depth-sensitive edge shader adds very light framing, rather than strong blur or bloom. High graphics preset uses it; Economy disables it.
- **Visual QA automation:** an optional Linux/Xvfb graphics-preview workflow renders four Level 1 scene checkpoints and uploads PNG artifacts for manual inspection when the runner supports software OpenGL.

### Fidelity and performance principles
1. Keep *original painted artwork*, not random stock illustrations, for established Sarah/Carlo/crab/eel designs.
2. Use shallow overlays and preserve the transparency of atlases; never draw the opaque background twice.
3. Maintain original obstacle geometry, enemy timing, movement, pickups, health and checkpoints.
4. Cull deep/offscreen art in the existing 2.5D composer and keep mobile-friendly quality controls: **F3** reduces animation and **F4** disables expensive depth passes.
5. Maintain a strict automated Godot scene import/runtime suite, plus optional **real rendered PNGs**; final GPU/device visual signoff still requires reviewing those captured images and playing in Godot.

### New files
`godot/premium_hud.gd`, `godot/water_surface.gd`,
`godot/shaders/cinematic_grade.gdshader`,
`godot/capture_level1_previews.gd`, and
`.github/workflows/godot-graphics-preview.yml`.

## v0.3: multi-layer texturing and subtle 3D-style depth

This version adds a deliberate **2.5D** visual composition: the game still plays entirely in 2D, but different artwork planes move at different relative speeds to imply underwater distance. It does **not** convert the levels into polygonal 3D geometry or alter collision physics.

- **One opaque, painted Highland background** rendered by `PaintedWorldDepth` using `painted_depth.gdshader`. It adds gentle underwater colour grading, a subtly animated water layer, and darker grotto tones without duplicating ghost scenery.
- **Two independently positioned reef gardens**: the far layer travels at **0.58×** camera speed and the middle layer at **0.83×**; both use original `reef-garden-v75.webp` atlas regions rather than new placeholder scenery.
- **Near-field vegetation** at **1.13×** camera speed, drawn sparingly and at low opacity. Foreground silhouettes are hidden during the waterfall so they cannot cover the descent.
- **Nineteen obstacle sprites with relief shading**, using the exact original collision rectangles. The new `reef_rock_relief.gdshader` provides directional top-light and wet-looking shading without painting a second opaque reef on top.
- **Three complementary underwater effects layers**: a screen-texture refraction pass with a deliberately restrained ~1.2 pixel displacement; the existing GPU caustics pass; and a low-opacity mist/light-shaft shader. Refraction normally renders **behind Sarah and the HUD** so characters and UI remain sharp.
- **Texture-safe atlas colour shading**: sprite shaders work on Godot's already-textured fragment colour and preserve alpha rather than darkening or accidentally double-multiplying transparency.
- **Quality controls**: `F4` toggles between *High* (all passes) and *Economy* (no refraction or mist). `F3` reduces motion/effects. The painted world and collision geometry remain intact in either setting.
- **Viewport overscan and screen-space layer culling** to avoid exposing background edges when the camera pans or windows resize.

### Native rendering order

```
-3   PaintedWorldDepth       shader-painted backdrop + far/mid reefs
-1   ReliefReefObstacles     19 depth-lit, collision-aligned sprites
-1   NativeUnderwaterFX      screen refraction > caustics > depth mist
 0   Main gameplay drawing  enemies, collectibles, portal, HUD
 0   SarahAtlasRig           expressive, crisp articulated mermaid
 0   CarloNativeBoss         native boss lighting / tween reactions
+2   SparseForegroundDepth   intermittent translucent closest plants
```

The waterfall temporarily places water effects over the shaft and hides the scrolling landscape/foreground. No later chapter is modified by this Level 1 upgrade.

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
| F4 | Toggle High / Economy depth shading and native actor lights |
| F6 | Toggle live FPS / active-sprite performance monitor |
| Controller left stick / D-pad | Analogue movement |
| Controller A | Jump |
| Controller B | Boost |
| Controller X | Mermaid Bubble |
| Controller Start | Pause |
| Touchscreen | D-pad plus on-screen actions |

## Files and editing

```
project.godot                       # Import the repository root
godot/highland_level.tscn           # Editable 2.5D scene, depth planes, texture lighting and actors
godot/highland_level.gd             # Level progression, combat and gameplay state
godot/highland_data.gd              # Geometry and source-driven enemy/treasure timings
godot/sarah_rig.gd                  # State-blended native skeletal swimming animation
godot/animated_enemies.gd           # Pooled native enemy Sprite2D atlas animation
godot/native_fx.gd                  # Shader passes, fixed CPUParticles2D pool, Tweens
godot/performance_overlay.gd        # Toggleable in-game FPS/LOD monitor
godot/carlo_boss.gd                 # Boss sprite, native 2D light, hit/defeat animation
godot/world_depth.gd                # Opaque background, 0.58× and 0.83× reef parallax
godot/foreground_depth.gd           # Low-opacity close vegetation 1.13× camera speed
godot/reef_obstacles.gd             # Native sprites aligned to collision rectangles
godot/shaders/painted_depth.gdshader
godot/shaders/reef_material.gdshader
godot/shaders/reef_rock_relief.gdshader
godot/shaders/subtle_refraction.gdshader
godot/shaders/depth_mist.gdshader
godot/shaders/underwater_caustics.gdshader
godot/level1_smoke_test.gd         # Godot engine integration checks
dist/assets/                        # Original textures/soundtrack; NOT duplicated
```

## Testing and known limitations

GitHub Actions runs Godot 4.4.1 in headless editor mode, imports assets and scripts, tests waterfall/pickups/victory, verifies all native shader passes, 0.58×/0.83× depth planes, relief obstacle materials, rig joints, particles, quality toggles and boss light nodes, and launches the game scene. Automated success means compilation and gameplay logic are validated; **it is not a substitute for visual inspection on a GPU or a physical Android device**.

The current project is a **prototype**, not yet a faithful full-feature replacement for HTML 9.1. Its enemy roster and AI, detailed Carlo attack sequencing, hand-painted scenery alignment, dialogue, all story panels, full sprite-deformation rig, menu UX and native release packaging still need porting and QA. Physics/collisions still use the source-inspired gameplay implementation rather than fully separate Godot `CharacterBody2D` / `Area2D` components. Music uses the source MP3 with limited tweens, not a full adaptive audio mixer.

Recommended next phases: visually test the shader and rig in a Godot editor window; separate collision/player/enemy scenes and introduce `CharacterBody2D` where gameplay parity can be maintained; convert detailed animation curves to `AnimationPlayer` / `AnimationTree`; re-create all enemy attack telegraphs and Carlo phases; then package Windows and Android exports.

## Credits

Artwork and soundtrack derive from assets already in this repository. Their copyright status does not change. Godot Engine is MIT-licensed.
