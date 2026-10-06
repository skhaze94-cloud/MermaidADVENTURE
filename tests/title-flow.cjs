'use strict';
const assert=require('node:assert/strict'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`
// The title actions start their mode without a second Play click.
selectedStartStage=-1;state='ready';bindMenu();$('mode-sarah').onclick();assert.equal(mode,'sarah');assert.equal(stage,-1);assert.equal(state,'intro');
introTime=entranceDuration();const end=entrancePose(20);assert.equal(end.x,nessie.x-camera);assert(Math.abs(end.y-nessie.y-Math.sin(60)*3)<.001);assert(Math.abs(end.angle)<.000001);
updateIntro(.016);assert.equal(state,'playing');assert.equal(training.step,-2);assert(!dialogueSeen.has('daddy-intro'));
showMenu();$('mode-trial').onclick();assert.equal(mode,'trial');assert.equal(stage,0);assert.equal(state,'playing');assert.equal(elapsed,0);
showMenu();selectedStartStage=-1;$('mode-story').onclick();assert.equal(mode,'story');assert.equal(stage,0);assert.equal(state,'playing');
// Explicit chapter selection remains available behind the simple opening screen.
showMenu();chooseMode('sarah');selectStage(2);$('play').onclick();assert.equal(stage,2);assert.equal(state,'intro');
// Returning to the title clears airborne trails and stale effects.
leap.active=true;leap.breached=true;particles=[{life:1}];motionTrail=[{life:1}];showMenu();assert.equal(leap.active,false);assert.equal(particles.length,0);assert.equal(motionTrail.length,0);
// All three primary actions respect the artwork gate.
assetsReady=false;updateAssetLoading();for(const id of ['mode-sarah','mode-trial','mode-story'])assert.equal($(id).disabled,true);$('mode-sarah').onclick();assert.equal(state,'ready');assetsReady=true;updateAssetLoading();assert.equal($('mode-sarah').disabled,false);
`);
console.log('Title flow passed: three direct actions, stage selection, loading gate, clean return and seamless entrance endpoint.');
