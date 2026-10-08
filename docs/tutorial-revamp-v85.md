# 8.5 — Ultimate Fun Tutorial Revamp

The lagoon now includes two extra swim-route bends and three solid sky reef islands. A new transparent painted atlas supplies branching lightning, a storm cloud, parting water, a dimensional boulder, floating reefs and hanging reef stone. Existing floor gardens remain, so the route has several silhouettes rather than repeating a single obstacle. Solids draw fully opaque artwork with soft contact shadows; background scenery remains recessed.

King Daddy uses a tutorial-specific hierarchy with narrower connected upper arms and forearms, a longer naturally proportioned tail and an overlapping gold fin hinge. His head follows Sarah smoothly at the neck. Expression changes occur during a small settling nod with a fully opaque face; the mouth has restrained talking motion. Torso, shoulders, elbows, wrists, staff, neck, tail and fin retain separate phases. Other bosses and Sarah’s 8.4 routines are unchanged.

The entrance gathers a cloud, reveals branching thunder and opens curling water crests in one continuous 3.4-second arrival. Reduced motion suppresses the lightning reveal and travelling droplets. No repeated screen flashes or persistent particle systems are added.

After each lesson, the next dialogue waits at least 2.4 seconds and for Sarah to approach its teaching bay. It also waits until flight and boost end, avoiding interruption in mid-action. The rock lesson opens before the boulder; the next lesson opens after the obstacle with room to recover. Decorative practice portals are removed so the real departure gate is unambiguous.

Sky islands use safe collision responses during flight. They stop sideways movement or turn an upward bump into a gentle descent without taking health or cancelling the jump. One contextual speech bubble teaches steering around them. The required practice jump retains a clear corridor; splash combos, energy costs and boss reward jumps are preserved.

`tests/tutorial-revamp-v85.cjs` validates route accessibility using the actual 58×39 collision envelope, solid barriers, safe sky contact, timed/spatial dialogue gates, head tracking, pause, reduced motion and chapter isolation. The existing tutorial test completes every lesson, sparring and departure using real jump physics. All artwork is embedded in the standalone export; its budget is 32 MiB with shared audio embedded once.
