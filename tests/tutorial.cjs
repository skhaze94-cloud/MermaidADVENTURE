'use strict';
const assert=require('node:assert/strict'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`
mode='sarah';selectedStartStage=-1;start();introTime=entranceDuration();updateIntro(.016);assert.equal(state,'playing');assert.equal(training.step,-2);
assert.equal(W,7600);nessie.x=1800;updateTraining(.016);assert.equal(nessie.x,1800);nessie.x=4200;updateTraining(.016);assert.equal(nessie.x,4200);nessie.x=220;for(let i=0;i<240;i++)updateTraining(1/60);assert.equal(training.swimSeconds,0);assert.equal(training.entryDone,false);
nessie.vx=100;for(let i=0;i<715;i++)updateTraining(1/60);assert.equal(training.step,-2);for(let i=0;i<10;i++)updateTraining(1/60);assert.equal(training.step,-1);assert(!dialogueSeen.has('daddy-intro'));
for(let i=0;i<210;i++)updateTraining(1/60);assert.equal(training.entryDone,true);assert.equal(training.step,0);assert.equal(state,'dialogue');assert.equal(activeDialogueId,'daddy-intro');finishDialogue();
for(const ring of TRAINING_RINGS){nessie.x=ring.x;nessie.y=ring.y;updateTraining(.016);}assert.equal(training.step,1);assert.equal(activeDialogueId,'daddy-rock');finishDialogue();
nessie.x=3840;updateTraining(.016);assert.equal(training.step,2);finishDialogue();keys.add('ArrowRight');burst();updateTraining(.016);assert.equal(training.step,3);assert.equal(activeDialogueId,'daddy-jump');finishDialogue();
// Use real physics, not manually toggled leap flags, for each lesson.
function jumpToRight(){energy=1;dashCooldown=0;leap.cooldown=0;keys.clear();keys.add('ArrowUp');keys.add('ArrowRight');burst();assert(leap.active);keys.delete('ArrowUp');let guard=0;while(leap.active&&guard++<350){updateSwimmer(1/60,1,0);updateTraining(1/60);}assert(guard<350);keys.clear();}
nessie.x=4090;nessie.y=440;jumpToRight();assert.equal(training.step,4);finishDialogue();tutorialResetPosition();assert.equal(nessie.x,4540);jumpToRight();assert.equal(training.step,5);assert.equal(health,4);assert.equal(activeDialogueId,'antonella-welcome');finishDialogue();
for(const p of powerups.filter(p=>!p.sky))collectPowerup(p);assert.equal(health,5);assert(training.heart&&training.boost);assert(boostUnlimited>0);
boostUnlimited=0;updateTraining(.016);assert(powerups.find(p=>p.type==='boost'&&!p.sky).taken===false);collectPowerup(powerups.find(p=>p.type==='boost'&&!p.sky));nessie.x=5760;nessie.y=440;jumpToRight();assert.equal(training.step,6);assert.equal(activeDialogueId,'daddy-trial');finishDialogue();
for(const e of training.practiceEnemies){nessie.x=e.x;nessie.y=e.y;dashTime=.2;updateTrainingBoss(.016);}assert(training.practiceCleared);assert.equal(training.practiceHits,3);
nessie.x=6600;const gx=training.guideX,gy=training.guideY;updateTrainingBoss(.001);assert(boss.active);assert(Math.abs(boss.x-gx)<1);assert(Math.abs(boss.y-gy)<1);for(let i=0;i<130;i++)updateTrainingBoss(1/60);assert(training.bossEntry>=2);
for(let i=0;i<3;i++){boss.clock=9;boss.hitCooldown=0;nessie.x=boss.x;nessie.y=boss.y;dashTime=.2;updateTrainingBoss(.016);assert.equal(boss.hp,2-i);assert(bossLeapReady);}
for(let i=0;i<170;i++)updateTrainingBoss(1/60);assert(training.victoryReady);assert.equal(activeDialogueId,'daddy-win');finishDialogue();assert(familyPortalOpen());syncTutorialUi();assert.equal($('tutorial-title').textContent,'Adventure awaits!');
// Tutorial UI never leaks into pause, menus, or another chapter.
state='paused';syncTutorialUi();assert.equal($('tutorial-card').hidden,true);state='ready';syncTutorialUi();assert.equal($('tutorial-speech').hidden,true);stage=0;state='playing';syncTutorialUi();assert.equal($('tutorial-card').hidden,true);
// Relic rewards are optional and only paid once; Antonella has a separate farewell.
stage=-1;loadStage();state='playing';const relic=training.relics[0];nessie.x=relic.x;nessie.y=relic.y;const points=score;updateTutorialExploration(.016);assert(relic.taken);assert.equal(score,points+100);updateTutorialExploration(.016);assert.equal(score,points+100);training.victoryReady=true;training.step=6;nessie.x=7200;dialogueSeen.delete('antonella-sendoff');updateTutorialExploration(.016);assert.equal(activeDialogueId,'antonella-sendoff');assert.equal(state,'dialogue');finishDialogue();
// A retry restores a reachable practice task without replaying the entrance.
stage=-1;loadStage();training.step=4;retryStory();assert.equal(training.step,4);assert(training.entryDone);assert.equal(nessie.x,4500);assert.equal(training.guideExit,0);
`);
console.log('Tutorial passed: 12-second active swim, lessons/dialogue, practice creature parade, revamped King Daddy sparring, portal, retries and UI cleanup.');
