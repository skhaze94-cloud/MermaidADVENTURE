# Sarah Maria Family Adventure 9.1 — Definitive Interface

9.1 consolidates the HUD into one glass rail, simplifies menu typography and buttons, and replaces persistent lesson panels with one-second control cues. Mobile controls use a smaller D-pad and matching Jump, Boost and Bubble buttons, with an always-visible energy strip. Story speech, conversations and combat feedback remain readable.

See [9.1 release notes](docs/interface-v91.md). Run the focused suites in `.github/workflows/ci.yml`; Chromium QA additionally checks five viewport sizes and saves menu/game/cue screenshots. Export the complete offline game with:

```sh
python3 scripts/export-standalone.py Mermaid-Adventure-9.1.html
```

## Previous update: 9.0 — Painted World Adventure


A unified visual overhaul of all chapters: one horizon-aligned painted backdrop, crisp alpha-trimmed scenery with preserved proportions, opaque nearby gardens, seamless single-transform environmental animation, and clear characters and combat above the scenery. Removed duplicate ghost flora, repeated translucent ruins, layered palace washes and post-character Highland tints. Refined the pearl frame, opening panel and dialogue presentation while preserving the existing painted character identities and animations.

Core story stages 1–4 are exactly 30% shorter than 8.7, with identical enemy counts and species composition. Tutorial, Shadow Crab Kingdom, Blackwater Tunnel and timed trials retain their lengths. Stage 1 retains the uninterrupted 17-second waterfall and four-direction boost.

| Chapter | 8.7 length | 9.0 length | Enemies |
| --- | ---: | ---: | ---: |
| Highland Gold | 29,640 | 20,748 | 68 |
| Miguel’s Lagoon | 33,150 | 23,205 | 36 |
| Pearl Palace | 37,050 | 25,935 | 40 |
| Rana’s Rainbow Ruin | 41,600 | 29,120 | 18 |

See [9.0 release notes](docs/painted-world-v90.md). Run the suites in `.github/workflows/ci.yml`. Export the complete offline game with:

```sh
python3 scripts/export-standalone.py Mermaid-Adventure-9.0.html
```

## Previous update: 8.7 Waterfall Adventure


Stage 1’s uninterrupted waterfall now has smooth four-direction swimming and directional boost, including diagonals, with matching collision and energy costs. Three painted eels coil and lunge with visible warning cues. Crisp flowing inlet rings lead into one opaque textured rock shaft, replacing overlapping reef layers. The 17-second descent, whirlpools, treasure, exit checkpoint and all other chapters are preserved.

Keyboard: arrows or WASD to swim; Space to boost. Touch: slide the swim pad and press Boost independently. Neutral boost follows the last swim direction; unlimited boost can be held. The waterfall keeps Sarah inside a safe visible swim area while the current carries the world downward.

Regression coverage includes vertical and diagonal input, multi-touch boosts and release, energy and cooldowns, unlimited boost, visible-position collision, eel encounters, edges, pause, transition continuity, complete descent and retry. Run the suites listed in `.github/workflows/ci.yml`. Native Canvas visual checks and busy-scene timings supplement those tests; physical iPad/device testing remains a release follow-up.

Export all source, images, fonts and soundtrack data into one offline HTML:

```sh
python3 scripts/export-standalone.py Sarah-Maria-Family-Adventure-8.7.html
```

8.6 brings six themed painted sky reef sets, optional airborne rewards in every chapter, full silhouette foreground artwork and stone-matched collision bands. Antonella swims into and out of her palace encounter at full opacity. The 8.5 tutorial, 8.4 jump routines, backgrounds, dialogue and boss attack timings are preserved. See [8.6 release notes](docs/world-polish-v86.md).

The Ultimate Fun Tutorial Revamp gives King Daddy a connected royal rig, smooth neck tracking and expressive poses, with a painted thunder-and-parting-water entrance. Sarah learns through solid coral bends, safe sky reefs and spaced teaching bays. The six 8.4 jump routines and other chapters remain intact. See [8.5 tutorial details](docs/tutorial-revamp-v85.md).

8.3 added a short jump-input buffer, safer keyboard/touch cleanup, velocity-aware airborne turns, and character-specific spring transitions for every articulated boss. See [8.3 release notes](docs/controls-animation-v83.md).

8.2 added a graceful corkscrew jump, coordinated takeoff/tuck/re-entry poses, softer swimming strokes, turning follow-through and slightly fuller proportions. See [8.2 release notes](docs/definitive-sarah-v82.md).

Sarah uses a matching painted 16-part rig, independent shoulders/elbows/wrists, neck and head movement, connected tail segments, individual fin flutter and flowing layered hair. Boosts blend smoothly into a streamlined pose. Cached afterimages match the new rig. Her face is always rigid artwork. See [8.1 release notes](docs/dynamic-sarah-v81.md).

8.0 adds painted pearls, gems, shells, hearts, stars, chests and boost crystals; three distinct tutorial relics; exact live reward numbers; calmer exploration prompts and a rounded display font. Controls, level layouts, dialogue, bosses, movement and scoring values remain as before. Power-ups are protected against duplicate collection, and standalone exports share CSS artwork with the JavaScript asset registry rather than repeating image payloads.

See [8.0 release notes](docs/release-8.0.md) for the artwork and validation details.

The 7.5 backgrounds and textures update adds 24 painted scenery pieces derived from the supplied reef, pearl ruin, luminous coral, crystal and sandbank references. Every chapter gains camera-culled parallax gardens, collision-aligned reef materials, and themed set dressing; the tutorial has dedicated relic and royal court landmarks, and the waterfall has scrolling painted walls. Controls, story, route geometry and boss behavior are preserved.

A shared mesh transform error used a vertical coordinate where a horizontal coordinate was required, distorting animated characters. 7.31 fixes that transform and adds an identity-mesh regression.

Clean painted crab and electric eel pose strips, a luminous jellyfish sprite, independently moving pincers/legs, flowing eel tails, pulsing jellyfish bells and tentacles, and telegraphed burrowing scuttlers. The Shadow Kingdom uses the new crab artwork, including Duke Claw, whose rendering now scales around his own position. Adventure routes are 35% shorter; tutorial and 60-second time trials retain their original length. All music, controls and story mechanics are preserved.

## Previous releases

A static browser family adventure with Sarah Maria, Mermaid Powers, optional King Daddy training, four full story chapters plus the new Shadow Crab Kingdom intermediate chapter, Sarah and Nessie modes, 60-second coin trials, and the existing embedded soundtrack.

**Version 7.0 — The Fantastic Definitive Family Update Spectacular.** Carlo's defeat now awakens Mermaid Power #1, **Mermaid Bubble**: a permanent ranged attack with a short hands-on unlock lesson, dimensional refractive projectile art, controlled hit feedback and a dedicated mobile action button. The temporary **Bubble Rush** pickup triples firing rate while preserving projectile and audio caps. Sarah then descends into the new 22,000-unit **Shadow Crab Kingdom**, a concentrated five-part chapter with ten crab variants, Bubble switches and secrets, a midpoint checkpoint, comic crab behaviour and a three-phase **Duke Claw + Flip the Dolphin** duo boss built around readable teamwork and comedy collisions. After victory, Sarah rises back into the existing adventure with Bubble permanently available.

The second 7.0 pass preserves the 6.5 identity-safe Sarah renderer and established stage lengths, bosses, jumps, power-up synergy, music routing and story systems while adding later-stage Bubble secrets and crab encounters, enemy personality/telegraph accents, handcrafted ambient surprises, refined HUD/button treatment, reduced-motion safeguards, graceful optional-art fallbacks, and stricter particle/projectile/pop-up caps. The update is intentionally additive rather than a ground-up rewrite.

Release 2.0 unifies the painted tutorial and palace environments, introduces six expressive enemy sprites, adds continuous mesh animation to all boss bodies and limbs, and uses a shared set of solid pearl action glyphs in both canvas and HUD. First chapter defeats finish before dialogue opens. Minor enemies patrol and telegraph volleys. Jump variants and the earned two-zone escape retain their existing physics.

Run locally using any static file server with `dist` as its root. No package installation or build is required.

Validation: `node tests/release.cjs`, `node tests/family-expansion.cjs`, `node tests/rana-combat.cjs`, `node tests/surface-leap.cjs`, `node tests/music.cjs`, `node tests/adventure-tools.cjs`. Native canvas rendering scripts require the supplied runtime canvas package. Browser UI, live sound output, and device-specific performance have not been tested in this environment.

Artwork is served as WebP with transparency preserved. Music starts after Play or a sound-button gesture, loops, fades in, softens during dialogue, and pauses when the tab is hidden. Preferences are local to the device.

Title refresh: Khaze · Sarah Games opening, three immediate play actions, optional chapter drawer, a shared articulated Sarah sprite, continuous intro/portal arrival, and restored luminous launch rings. The five jump profiles and physics are unchanged from the earlier offline edition. Validate with `node tests/title-flow.cjs` and the existing jump/combat checks.

Art direction pass: sequential portrait dialogue with keyboard navigation and every reply checked; calmer tutorial composition and a smoothly moving guide; six distinct palace encounters; recessed curtains, floor fountains, fixed throne architecture, and collision-matched gate panels. StorySerif uses bundled DejaVu Serif fonts with the included license. The existing five jumps, music and boss attack patterns remain. `node tests/conversation.cjs` covers every dialogue branch.

Open jumps: Up + Boost now launches from anywhere underwater. Existing rings still offer convenient launches and recharge. Momentum and remaining boost increase the leap; unlimited boost produces a faster, higher flip. The one-use boss double-flip still targets two zones.

Version 3.0: UI-only pearl, sea-glass and gold styling for the title, buttons, chapter drawer, HUD, dialogue, touch controls and results. The illustrated logo headlines the opening; Sarah greets Nessie and the royal seahorse using existing artwork. Local SVG controls and an S monogram favicon replace generic glyphs. Backgrounds, gameplay rigs, physics and attacks are unchanged. Title/control/dialogue/open-jump checks pass; native canvas opening inspected. Browser DOM layout and device QA remain unverified.

Tutorial refresh: twelve seconds of player-controlled lagoon exploration with Sarah’s self-talk; one 3.4-second thunder arrival; a continuous King Daddy guide-to-sparring transition; seven hands-on lessons with keyboard/touch guidance, branching exchanges, renewable practice gifts and optional return-to-practice positioning. King Daddy has independent staff, shoulder, elbow, palm, knee, ankle, head and fabric skinning. Tutorial pearl bubbles, speech balloons and lesson cards use the family palette. Other worlds and jump physics are preserved. Validate with `node tests/tutorial.cjs`, `node tests/conversation.cjs`, `node tests/title-flow.cjs`, `node tests/controls.cjs`, `node tests/open-jumps.cjs` and `node tests/family-expansion.cjs`. Native canvas scenes were visually inspected; browser DOM and device performance remain unverified.

Highland Gold story expansion: 7,600-unit route (previously 3,800), 1.1-second slide into a 6.7-second waterfall descent with lateral steering, boost dodges, animated jelly/puffer hazards, reef ledges, gold, health damage and a pre-fall checkpoint. A shaded grotto continues through new coral obstacles and five fast scuttling crabs to Carlo at x=7,080 and the portal at x=7,430. Tutorial, later chapters and 60-second trials retain their original bounds. Check `node tests/highland.cjs`; native canvas waterfall/grotto scenes inspected. Browser/device QA remains unverified.

Tutorial 2.0: expanded to 7,600 units, with both artificial horizontal swim limits removed. Optional golden conch relics reward exploration; the lesson trail leads to Antonella’s gift lesson, King Daddy’s dedicated arena, and a family farewell at the portal. Shared portals, travel portals, large bubbles, power-up shells and launch rings use the new transparent painted magic atlas. Other chapter gameplay is unchanged. Verified the unrestricted opening, relic rewards, lessons, family dialogue, arena and portal in the runtime harness; inspected native canvas scenes. Browser/device QA remains unverified.


Version 5.1 mobile polish: larger coarse-pointer controls, iPhone/iPad safe-area spacing, clearer pressed-state feedback, resilient multi-touch release/cleanup, and automatic held-input clearing when the browser loses focus or the page is hidden. Gameplay physics, chapter content, bosses, jumps and scoring are unchanged.


Version 5.2 visual/combat polish: enemy attacks now lock and display readable aim telegraphs, creature recoil has stronger motion feedback, Carlo/Miguel/Rana vulnerable windows display a clear BOOST NOW cue, boss HUD openings pulse, player damage has a restrained impact burst, and successful boosted projectile blocks have sharper audiovisual feedback. Core physics, damage values, boss timing windows, story progression and scoring rules are unchanged.


Version 5.3 animation + world richness: Highland Gold story mode is doubled again from 7,600 to 15,200 world units while the 60-second trial remains unchanged. The post-waterfall route now has five visually distinct reused-asset regions (Secret Grotto, Kelp Cathedral, Ancient Shell Ruins, Open Loch Gardens and Carlo’s Court), more checkpoints, treasure, obstacles, power-ups, scuttling crabs and mixed creature encounters. Ambient life across the game now uses animated seahorse, jelly, puffer, eel and swordfish silhouettes instead of one repeated fish type. Tutorial 2.0 gains friendly creature shoals, bubble/relic gardens, shell shrines and dormant mini-portals using the existing tutorial/environment atlases; these are decorative and do not add hazards or change lesson progression. Core jump physics, boss balance and later story chapters are unchanged.


Version 5.4 royal tutorial overhaul: King Daddy now has a distinct 12-second sparring choreography with named Thunder Teapot charge, Triple Tickle Bolt volley, Cloud of Mild Concern, Royal Wobble Wave, Dad Dash, Bubble Beard Blast and a clear green opening. His V4 rig now exaggerates staff swings, tail kicks, rush silhouettes, casting and celebration. Tutorial lesson seven begins with three harmless practice creatures — Professor Puff, Sir Wobble and Noodle — that teach boost contact before King Daddy enters. Queen Antonella now actively gestures, reacts, coaches and celebrates during the tutorial gift/practice sequence, with expanded family comedy dialogue. The opening Sarah Maria logo is explicitly restored as a responsive animated hero image with reduced-motion support. Core story chapters, Highland 5.3 expansion and boss balance outside the tutorial are unchanged.


Version 5.5 Spark Eel Expansion: stages 2, 3 and 4 now use 7,600-unit story routes while time trials remain at 3,800. Stage 2 moves Miguel to the far end of the expanded lagoon and adds additional obstacles, enemies, checkpoints, treasure and Spark/Storm Eels. Stage 3 keeps Queen Antonella’s proven boss arena but unlocks a second-half Royal Electric Gallery after victory, populated with new electric enemies and palace set-pieces. Stage 4 preserves the Rana/Nessie boss arenas and unlocks a second-half Storm Eel escape corridor after the final boss sequence. Spark Eels use a dedicated patrol/notice/coil/charge/lunge/discharge/stun state machine; Storm Eels are larger two-hit elites with multi-bolt attacks. Electric hits drain boost energy and delay boost recovery rather than hard-locking movement. The eel visuals reuse the existing creature atlas with new serpentine deformation, electric glows and lightning overlays inspired by the supplied eel reference art.


Version 5.6 arena + soundtrack overhaul: the supplied remastered soundtrack is mapped by filename to the opening, tutorial, each stage exploration loop, each matching boss, and the Nessie second-threat fight with adaptive crossfades and dialogue ducking. Queen Antonella's 7,600-unit Pearl Palace is now traversable end-to-end before the fight, with the Queen arena moved to the far end, wider alternating obstacle lanes, non-blocking animated gates, and a route audit that keeps the portal reachable. Enemy collision resolution now respects the full world width and pushes roaming AI out of scenery instead of clipping through barriers. Standard enemies tilt toward the player's vertical position while facing them horizontally. A new two-hit Reef Shark predator, styled after the supplied spotted blacktip reference, stalks, telegraphs, lunges, collides with scenery, and can be boost-stunned. The missing intro logo was traced to a malformed WebP and replaced with an inline SVG Sarah Maria wordmark that works in repo and standalone builds without an external image dependency.


Version 5.7 — Definitive Controls & Mermaid HUD: the input presentation has been rebuilt for touch-first play without changing the underlying swim/boost physics. Coarse-pointer devices receive large safe-area-aware pearl controls, an oversized labelled BOOST action, iPad-specific sizing, landscape compaction, multi-touch pointer capture and clear pressed states. Desktop keyboard controls are grouped into a polished control dock and mirror key-down feedback in the HUD. The game HUD now uses sea-glass cards, shell/pearl/starfish charms, a five-shell health display with damage/heal feedback, and a dedicated Mermaid Burst energy instrument. The touch layer stays below critical HUD information and scales for phones, tablets and landscape play.


Version 5.8 Definitive Shark Update: the Reef Shark has been rebuilt as a layered character and a substantially more sophisticated predator. The visual rig now separates articulated tail sections, dorsal and pectoral fins, torso and belly planes, head mass, independently opening jaw, teeth and gold tooth, tracked eye, monocle and chain, top hat, scars, spotting, highlights, wake streaks and dizzy/stun accents. Attack animation now drives the head and jaw independently instead of moving one flat silhouette.

The shark AI now uses a tunable predator controller with patrol, investigate, stalk, circle, lock, charge, lunge, bite, overshoot, recovery and stunned phases. It remembers the player's last position, circles before committing, telegraphs its lock, accelerates aggressively into a lunge, overshoots naturally, and repositions before hunting again. At one remaining hit it enters an enraged profile with faster pursuit, harder charges and shorter recovery. Collision behaviour is proactive as well as corrective: forward sensors inspect the intended attack path, choose upper/lower detours around barriers, and cancel a lunge cleanly before tunnelling through scenery. Core player movement, stage geometry, shark placement and the two-hit balance are otherwise preserved.

Control integration on the 5.8 baseline: **Space / BOOST** always dashes; **J, Shift / JUMP** launches from your current position. Launch rings are removed. Tap Jump within 220 ms before or 240 ms after splashdown to dip underwater and bounce into another flip. Chained bounces award 100/200/300 bonus points and up to three additional treasure multiplier levels (combined cap ×8), lasting four seconds after the bounce. Existing powered jumps, boss escape, sky pickups, shark AI and per-stage music remain intact. The directional pad supports sliding diagonals and mixed keyboard/touch ownership. See `docs/SPLASH-JUMPS.md` for the behavior and regression coverage.


Version 5.9 Painted Shark & AI Polish: a transparent four-pose gentleman shark atlas replaces the simplified procedural model whenever artwork is loaded. Tail and fin motion uses a bounded 6×4 mesh while preserving facial detail. Charge orientation follows the committed velocity; aerial Sarah no longer takes underwater shark contact damage, and stunned sharks are harmless until recovery. Obstacle detours retain their chosen side briefly to reduce indecisive steering. Other enemies use facing hysteresis and stable patrol anchors instead of drifting anchors on every collision. Fixed the fallback boss vulnerability cue’s undefined height. Separate Boost/Jump, splash chains, chapters, bosses, music and power-ups remain. Regression: `node tests/shark-polish-v59.cjs`; CI runs all existing focused suites. Native canvas scenes checked; physical iPad and live browser audio/performance remain unverified.

Audio audit: the eleven planned chapter/boss MP3s were referenced but absent from GitHub. Scene routing and gain remain, with the included Bubble Bell Adventure loop used immediately instead of failed requests. Planned track names remain metadata for future asset delivery. Identical source cues reuse one audio deck. The offline export embeds this soundtrack, all art, fonts and source.


Version 6.0 Tutorial Revamp: the lagoon has eleven hand-placed coral shelves, pearl columns, hanging crystal reefs and stairs with alternating swim passages, clear lesson bays and a spacious unchanged King Daddy arena. Four new transparent reef sprites replace the old two rocks and repeating column layer. Distant reef vistas, subtle light shafts and coral arrival/arena daises add depth. Dynamic teaching rings select obstacle-free heights. Daddy’s existing articulated rig now has four painted facial expressions, neck-pivot head turns toward Sarah and subtle speech nods, exclusively in the tutorial. His single opening arrival gains friendly seahorse escorts and a water-entry bubble burst. Updated two stale Jump hints. Other chapters, controls, combat timings, music and scoring remain unchanged. See `tests/tutorial-v6.cjs`; tutorial progression and all existing focused regression suites pass.


Version 6.0.1 stability audit: maintenance-only improvements on top of Release 6.0. Fixes the malformed small header logo dependency, resets the Stage 4 storm-seal one-shot state on every fresh load, caches expanded-stage metadata, hardens adaptive music switching against orphaned crossfades and blocked-playback retry churn, corrects the Definitive Shark fallback wake orientation, and refreshes browser adventure-tool build metadata. No 6.0 tutorial, painted-shark, stage-layout, control, boss, movement, jump or balance changes are removed.


Version 6.1 Clarity + Predator Arena: the visual hierarchy has been simplified so gameplay reads cleanly over the painted worlds. Ambient fish, bubbles, drifting motes, foreground flora, obstacle decorations, Palace effects and launch-pad bubbles are reduced or made more translucent while solid geometry, pickups, attack telegraphs, sharks and bosses remain high contrast. Stage 4 is now a continuous 2,700–7,240 hunt arena during the Rana fight rather than an old compact boss box followed by a separate corridor. Rana dynamically follows Sarah across the expanded space, re-targets attacks and jungle hazards around her position, and steers around solid arena blockers. Six aggressive Stage 4 sharks are distributed across the hunt space; each has 4 HP and a segmented overhead bar, while sharks elsewhere use 3 HP. Shark steering now uses smoothed targets, acceleration limits, heading hysteresis and stable rendered pitch to eliminate left/right chatter and jitter near obstacles.


Version 6.2 Treasure + Scoring: a comprehensive reward-graphics pass inspired by the supplied pearl, gem, starfish, score, combo and stage-clear reference sheets. The HUD now uses a glossy shell score plate with live treasure/chest counters, a five-notch combo meter and x2/x3/x5 shell multipliers. Ordinary collectibles render as stage-varied pearls, pink/aqua/purple gems and star coins, while chests, hearts and boost pickups use richer jewel-style artwork. World score feedback now uses short-lived sticker/ripple popups instead of plain text, and real gameplay events trigger compact centre-screen reward banners for Combo, Perfect, Treasure Bonus, Pearl Bonus, Heart +1, Time Bonus and Stage Clear. Every five-item treasure chain now awards a deliberate +250 combo milestone; story stage clears retain the +500 tier; fast complete trial clears can earn a +1000 Perfect bonus. Trial and story result screens now use large score plates, bonus chips and one-to-three star ratings while keeping the 6.1 clarity rules and playfield visibility intact.


Version 6.3 The Length Update: story pacing is deliberately sequential rather than equal-length. Stage 1 is 45,600 world units; Stage 2 is 51,000 (+11.8%); Stage 3 is 57,000 (+11.8%); and Stage 4 is 64,000 (+12.3%). Existing encounters are redistributed across the larger routes instead of multiplying enemy counts, creating longer clean swim/jump stretches, fewer simultaneous enemies, more processing headroom, and a clear sense that every chapter is larger than the last. Tutorial and 60-second trial layouts remain compact.

Version 6.4 Jump + Enemy Overhaul: desktop Jump now has full parity with touch. A permanent in-game desktop Jump button sits beside the Boost instrument, J and either Shift key trigger the same action, the world cue now correctly says J / SHIFT rather than SPACE, and the control reflects live JUMP, SPLASH and SUPER JUMP states plus powered-jump benefits. Main story stages now deliberately double their enemy rosters by inserting the extra encounter into the next large route gap rather than stacking duplicates on top of existing enemies. The long 6.3 maps therefore gain roughly twice the action while keeping readable spacing.

Spark and Storm Eels receive a full presentation/AI polish: facing hysteresis, smoother drift/recovery, stable rendered pitch, richer electric halos and wake arcs, luminous dorsal accents, cleaner charge telegraphs, stun stars and an elite HP strip. Regular enemies now use species-specific movement profiles instead of one shared float routine: swordfish flank and dart, puffers hold distance, jellyfish track vertically, ordinary eels weave, and seahorses orbit. They also gain softer grounding shadows, rim highlights, head glints and species-appropriate trails. Off-screen AI work is reduced to preserve performance with the doubled roster.


## 7.1 Adventure Select + Blackwater Tunnel

- Revamped start menu with direct selection for the prologue, all four main chapters, Shadow Crab Kingdom, and the new Blackwater Tunnel interlude.
- Added The Blackwater Tunnel between Miguel's Lagoon and the Pearl Palace: severely limited visibility, a midpoint checkpoint, Bubble Rush support, and a huge arena reveal.
- Added Baron Bite, a giant boss-scale version of the painted top-hat reef shark with 8 HP, telegraphed locked charges, recovery openings, Bubble support, and a two-tempo wounded phase.
- Rana Rex now pursues a delayed remembered target with acceleration and speed caps. He can catch up when Sarah creates a large gap, but he no longer mirrors her position every frame.
- Existing 7.0 Shadow Crab Kingdom, Mermaid Bubble progression, stage lengths, Sarah face restoration and legacy bosses remain intact.


## 7.2 Icon Upgrade Spectacular

- Rebuilt Sarah's health display as dimensional pearl-heart medallions with distinct full, empty, damage and heal states.
- Upgraded score, pearl/chest counters, combo beads, result stars and reward banners into a cohesive sea-glass / shell / pearl HUD language.
- Added higher-detail canvas models for pearls, star coins, gems, treasure chests, heart pickups, Mermaid Burst crystals and Bubble Rush.
- Added seven custom Adventure Select SVG emblems for the Family Lagoon, Carlo, Shadow Crab Kingdom, Miguel, Blackwater Tunnel, Pearl Palace and Rana.
- Refined Bubble Power, boss HUD, objective/checkpoint, mobile action, tutorial and utility-control icon presentation.
- Preserved all 7.1 gameplay, stage lengths, Sarah face protection, Mermaid Bubble, Blackwater, Shadow Crab Kingdom and bounded Rana pursuit.
- 7.2 deliberately reuses existing animation loops and does not introduce a new particle system; reduced-motion fallbacks remain supported.

## 7.51 visual polish

Every chapter gains curated landmarks, softer reef contours, richer parallax and restrained seabed shimmer. Three new painted backdrops give the Shadow Kingdom, Blackwater grotto and Rainbow Temple their own atmosphere. Reef objects no longer have panel-like outline frames. All gameplay routes, controls, dialogue and combat stay intact.
