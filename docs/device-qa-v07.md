# Godot v0.7 device QA

Automated coverage uses simulated viewports/input and Linux software OpenGL. No physical phone or tablet has been connected in this session. CI screenshots demonstrate composition, not device performance.

| Profile | Resolution | Coverage |
| --- | --- | --- |
| Small landscape phone | 640 × 360 | Safe area, controls, waterfall, pause |
| Wide landscape phone | 844 × 390 | Notch/home inset, controls, waterfall, pause |
| 4:3 tablet | 1024 × 768 | HUD, controls, waterfall, pause |
| Wide tablet | 1280 × 800 | HUD, controls, waterfall, pause |
| Desktop | 1920 × 1080 | Expanded viewport, waterfall, pause |
| Portrait phone | 390 × 844 | Rotation instruction and paused input |

## Before signing off a physical-device release

1. Run an exported Android build on a phone and a tablet; test iPad only after an iOS export is built/signed on macOS.
2. Play through inlet, the full 17-second descent, outflow, death/retry and Carlo. Verify health, collision, rewards and checkpoint rollback.
3. Hold one finger on diagonal steering while tapping/holding Boost with another. Slide to neutral, release both fingers, rotate, background and resume. Inputs must clear without unwanted attacks.
4. Verify the real notch/navigation/home indicator does not overlap controls. Check every control at normal viewing distance.
5. Test a Bluetooth controller: connect, disconnect and reconnect while playing; test analogue dead zone, jump, boost, pause and touch/controller switching.
6. Compare High, Economy and Reduced Motion. Use F6 with a keyboard, or the Godot remote profiler, to record frame-time spikes, draw calls and memory during a full descent and busy combat.
7. Play for at least 15 minutes to check thermal throttling and battery use. Test live audio, speaker/headphones, background/resume and muted transitions.

Record device model, OS, build commit, renderer/preset, frame-time observations and pass/fail for each step. Keep physical-device results distinct from CI software rendering.
