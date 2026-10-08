# 8.2 — Definitive Sarah

Sarah-only animation refinement, using the same painted assets and established rig entry points.

- Slightly fuller arms, torso and tail connections; arm artwork retains its original aspect ratio within 3%.
- Coordinated swimming: offset shoulder strokes, delayed elbows and wrists, a stronger travelling tail wave and independent fin flutter.
- Underwater takeoff gathers the limbs; boosting streamlines her reach; bubble casting adds a brief hand gesture.
- A complete corkscrew with smooth angular acceleration and deceleration. Standard jumps use a relaxed tuck, powered jumps a tighter tuck, heart jumps a wider opening, and splash combos an extra perspective twist. Boss-powered jumps retain two full turns.
- Midair tail curl and counter-moving arms/hair; fins reopen ahead of water entry. Whole-character perspective compression is capped at 7.5% to preserve facial proportions.
- Landing follow-through settles exponentially, and direction changes produce a delayed tail flick. The head and shoulders remain parented to the collar/torso.
- Reduced-motion mode disables the spin and secondary motion; paused animation state remains frozen.

Jump height, speed, collision, damage, boost costs, bounce timing and scoring are unchanged. Nessie and King Daddy retain their prior jump animation. Levels, backgrounds, enemies and audio are unchanged.

## Validation

Reviewed enlarged swim, boost and jump poses, including the full corkscrew sequence. Automated checks cover joint continuity, natural arm proportions, bounded deformation, smooth jump endpoints, boss double rotation, non-mutating pose evaluation, landing/charge/cast transitions, character isolation, pause, reduced motion and offline export. The renderer remains below its existing 180-stamp budget and uses the same two atlases; a local native-canvas sample measured approximately 1.2 ms per rig render. Physical iPad performance has not been measured.
