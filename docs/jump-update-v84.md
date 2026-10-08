# 8.4 — The Jump Update

Sarah automatically cycles through six routines on successful jumps: Pearl front flip, Moon backflip, Coral corkscrew, Starfish float, Dolphin dive and Rainbow cartwheel. Ordinary jumps receive all six; no additional button, power-up or timing trick is required. Splash combo relaunches continue the sequence.

Each routine has its own rotation timing, shoulder gestures, tail curl, fin spread, coloured ribbon and landing droplets. The existing painted face, arm proportions and continuous shoulder/arm rig are retained. Quintic rotation easing and soft envelopes return the pose to swimming alignment at water entry. Actual vertical velocity still advances the animation when downward steering shortens flight.

The showcase is cosmetic: jump height, speed, steering, energy cost, splash grace period, score multipliers and boss reward mechanics remain unchanged. Powered leaps tighten the poses; every boss reward routine keeps its double rotation. Nessie and King Daddy use their existing animations. Reduced motion removes the aerial rotation and decorative orbit trails.

`dist/jump-showcase-v84.js` defines the routines and bounded canvas flourishes. `assignJump84` is called only by successful launch creation. Draw calls do not advance the sequence or modify physics. No new image assets, timers or persistent particle systems are required.

Validation: `node tests/jump-showcase-v84.cjs` checks all six standard launch trajectories against each other, accepted/rejected input sequencing, finite pose samples, distinct limbs, boss double turns, rendering isolation and reduced motion. The full CI suite also covers splash chains, fast dives, mobile controls and the previous Sarah rig regressions.
