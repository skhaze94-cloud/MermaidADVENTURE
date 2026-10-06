const assert=require('node:assert/strict'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`
mode='sarah';stage=0;loadStage();state='playing';nessie.x=350;assert(updateNessieMeeting());assert.equal(activeDialogueId,'nessie-meet');finishDialogue();assert.equal(boostUnlimited,9);assert(!updateNessieMeeting());
stage=3;loadStage();state='playing';boss.hp=0;boss.active=true;ranaNext('defeated');updateRana(4);assert.equal(activeDialogueId,'final-boss-win');assert(!familyPortalOpen());finishDialogue();assert(isNessieFinal());assert.equal(health,5);updateNessieFinal(2.9);assert.equal(activeDialogueId,'nessie-crown');finishDialogue();assert.equal(nessieTwist.phase,'transform');updateNessieFinal(2.9);assert(boss.active);assert.equal(nessieTwist.phase,'charge');assert(!familyPortalOpen());
// Every attack family is reachable, has a warning, and ends with an opening.
invincible=100;nessieTwist.sequence=0;for(const attack of ['volley','rush','wave']){nessieNext('charge');assert.equal(nessieTwist.attack,attack);updateNessieFinal(1.3);assert.equal(nessieTwist.phase,attack);for(let i=0;i<170;i++)updateNessieFinal(1/60);assert(boss.vulnerable);}
// Guarded contact cannot damage the boss; each opening accepts one boost hit.
nessieNext('charge');nessie.x=boss.x;nessie.y=boss.y;dashTime=.3;updateNessieFinal(.01);assert.equal(boss.hp,7);
for(let i=0;i<7;i++){nessieNext('open');boss.hitCooldown=0;nessie.x=boss.x;nessie.y=boss.y;dashTime=.3;updateNessieFinal(.01);assert.equal(boss.hp,6-i);assert(bossLeapReady);}
assert.equal(nessieTwist.phase,'defeated');assert(!familyPortalOpen());updateNessieFinal(3);assert.equal(activeDialogueId,'nessie-win');finishDialogue();assert(familyPortalOpen());
// Death retries Nessie's fight, never Rana; stage reload clears the twist.
state='playing';retryStory();assert(isNessieFinal());assert.equal(boss.hp,7);assert.equal(nessieTwist.phase,'charge');assert.equal(health,5);assert(!familyPortalOpen());
mode='story';stage=3;loadStage();assert(!isNessieFinal());assert(isRana());assert.equal(nessieTwist,null);boss.hp=0;rana.victoryReady=true;assert(familyPortalOpen());mode='trial';stage=0;loadStage();assert(!updateNessieMeeting());
`);console.log('Nessie subplot passed: meeting and gift, Rana handoff, crown dialogue, transformation, three attacks, guarded/open combat, seven hits, ending, retry and mode isolation.');
