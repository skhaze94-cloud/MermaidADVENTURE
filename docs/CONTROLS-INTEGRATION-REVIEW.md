# Controls integration review on 5.8

Base: `6cbd490a5c45249d7477872a8c11a3797815333b`.

The repository had the newer 5.7 control visuals and 5.8 shark/music/world changes, but retained Up + Boost launch detection and visible launch rings. The integration keeps the newer implementation and artwork, imports only the splash mechanic, and adapts input to the existing control feedback and shell HUD.

Fixed during review:

- Boost no longer enters the launch branch near invisible/visible route anchors.
- Independent Jump input retains the existing power-up and earned boss leap trajectory.
- Multi-touch direction ownership prevents releasing one finger from cancelling another finger's movement.
- Keyboard and touch ownership no longer cancel each other on release.
- Pointer capture loss, pause, focus loss and hidden-page transitions clear movement state.
- New jump captions and tutorial dialogue replace outdated Up + Boost instructions.
- Splash scores use the same multiplier for pickup rewards and the story/trial HUD.

All 17 CI regression suites pass locally. JavaScript syntax checks pass. New behavior tests cover pre/post-landing grace, underwater dip, relaunch, multipliers, energy gates, resets, multi-touch, slide diagonals and mixed input. Existing tests cover the expanded worlds, royal tutorial, bosses, electric enemies, stage music and shark. Physical device/browser layout verification remains outstanding.

No art, audio, enemy AI or stage-layout files were replaced. Release version stays 5.8.0 because this is a controls integration into that baseline.
