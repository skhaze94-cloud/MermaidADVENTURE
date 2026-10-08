# 8.3 — Controls & Animations

## Review findings and changes

- Keyboard actions now share one physical-key mapping for WASD, Jump (J/Shift), Bubble (F/K), Boost (Space) and Pause. Typing into editable elements does not move Sarah. Repeated jump/attack key events cannot leak into held movement, and K releases the Bubble highlight correctly.
- A 160 ms jump-input buffer catches a press just before cooldown or energy recovery. It only applies when nearly ready; energy costs remain enforced. Pause, dialogue, blur, hidden tabs and stage resets cancel pending inputs.
- Keyboard-only input is cleared when controls are suspended, alongside independent touch pointers. Sliding off directional buttons into diagonals remains supported. Jump buttons also support native keyboard activation without firing twice after a pointer press.
- Sarah’s corkscrew progress accounts for actual airborne vertical velocity. Faster downward steering can complete its rotation before water entry. Existing boost/jump separation, early/late splash-bounce grace and boss-reward double flips remain intact.
- Refined Sarah’s hand gestures, tail follow-through and loose hair motion, retaining the established proportions and connected shoulder/collar rig.
- Carlo, Miguel, Rana, King Daddy, Antonella and Nessie use distinct critically damped joint transitions that carry velocity through changes in attack pose. All named attack families are recognized, including royal waves/blooms and Rana’s retaliation. Pincers snap through release, wing tips follow the manta’s fold, tentacle tips curl during rushes, and the royal staffs have their own smooth motion channel.
- Boss afterimages no longer rewind a live rig clock. Restart clears stale pose state. The shadow dolphin follows its actual travel direction, pitches smoothly, and moves its tail and flipper independently. Shark tail phase is integrated over time, avoiding sudden phase jumps when speed changes.

## Validation

Reviewed enlarged articulated boss release poses and Sarah’s standard/double-turn jump sequences. Added checks for physical-key mapping, typing/pause isolation, jump buffering/cancellation, fast-dive spin completion, spring continuity, boss-specific timing, historical draw safety and stage reset. Existing combat, touch, open jump, splash-bounce, shark AI, tutorial and export regressions remain required in CI.

No levels, collision shapes, enemy rosters, boss health, attack durations or damage values changed. No new art/audio files or particle emitters were added. Physical iPad testing has not been performed.
