'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`
mode='sarah';stage=-1;loadStage();state='playing';training.step=2;training.pendingLesson=null;dialogueSeen=new Set(Object.keys(conversations));
syncTutorialUi();assert.equal($('tutorial-card').hidden,false);assert.equal($('tutorial-title').textContent,'Boost · Space');
// Painting repeatedly cannot extend a cue or advance its timer.
for(let i=0;i<200;i++)syncTutorialUi();assert.equal($('tutorial-card').hidden,false);
const update91=update; // Advance cue time while isolating world progression.
updateTraining=()=>{};updateStory=()=>{};
for(let i=0;i<6;i++)update(.1);syncTutorialUi();assert.equal($('tutorial-card').hidden,false);
state='paused';for(let i=0;i<30;i++)update(.1);syncTutorialUi();assert.equal($('tutorial-card').hidden,true);
state='playing';syncTutorialUi();assert.equal($('tutorial-card').hidden,false);
for(let i=0;i<5;i++)update(.1);syncTutorialUi();assert.equal($('tutorial-card').hidden,true);
for(let i=0;i<200;i++)syncTutorialUi();assert.equal($('tutorial-card').hidden,true);
training.step=3;syncTutorialUi();assert.equal($('tutorial-card').hidden,false);assert.equal($('tutorial-title').textContent,'Jump · J / Shift');
training.step=4;training.pendingLesson={};syncTutorialUi();assert.equal($('tutorial-card').hidden,true);for(let i=0;i<15;i++)update(.1);training.pendingLesson=null;syncTutorialUi();assert.equal($('tutorial-card').hidden,false);
// Re-entering a stage gives a fresh cue; menus and dialogue cannot display it.
loadStage();training.step=2;training.pendingLesson=null;state='playing';syncTutorialUi();assert.equal($('tutorial-card').hidden,false);
state='dialogue';syncTutorialUi();assert.equal($('tutorial-card').hidden,true);state='ready';syncTutorialUi();assert.equal($('tutorial-card').hidden,true);
stage=0;loadStage();state='playing';beginHighlandFall();syncHighlandUi();assert.equal($('waterfall-help').hidden,false);for(let i=0;i<12;i++)update(.1);syncHighlandUi();assert.equal($('waterfall-help').hidden,true);
V70.mermaidPowers.bubble=true;V70.bubbleRush=0;syncBubbleUi();assert.equal($('bubble-power-hud').hidden,true);V70.bubbleRush=6;syncBubbleUi();assert.equal($('bubble-power-hud').hidden,false);V70.bubbleRush=0;syncBubbleUi();assert.equal($('bubble-power-hud').hidden,true);
chooseMode('sarah');assert.equal(document.title,'Sarah Maria Family Adventure 9.1');
`);
assert.equal(fs.readFileSync('VERSION','utf8').trim(),'9.1.0');
console.log('9.1 passed: one-second cues, render idempotence, pause/resume, pending lessons, stage reset, dialogue/menu suppression, waterfall expiry and bubble status lifecycle.');
