'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),rt=require('./runtime.cjs')();
rt.sandbox.assert=assert;
const html=fs.readFileSync('dist/index.html','utf8');
const game=fs.readFileSync('dist/game.js','utf8');
const polish=fs.readFileSync('dist/polish.js','utf8');
const spark=fs.readFileSync('dist/spark-eel.js','utf8');
const shark=fs.readFileSync('dist/predators-v56.js','utf8');
const music=fs.readFileSync('dist/music.js','utf8');
const rana=fs.readFileSync('dist/rana.js','utf8');

assert.match(html,/<svg class="brand-logo"/);
assert.doesNotMatch(html,/src="assets\/sarah-logo\.webp"/);
assert.match(polish,/const center=palaceArenaCenter\(\),x=center-camera/);
assert.doesNotMatch(polish,/const x=3280-camera/);
assert.match(spark,/expandedStoryMetaCache=new WeakMap/);
assert.match(game,/globalThis\.stage4GateToast=false/);
assert.match(game,/releaseCreature\(f,t,true,f\.y\+/);
assert.match(game,/let healthHudTimer=0/);
assert.match(game,/state='paused';clearHeldControls\(\)/);
assert.match(game,/state='finished';clearHeldControls\(\)/);
assert.match(shark,/const biteDistance=Math\.hypot/);
assert.match(shark,/function drawSharkWake\(e,t,intensity\)/);
assert.doesNotMatch(shark,/face\*back/);
assert.doesNotMatch(music,/a\.dataset=\{/);
assert.match(music,/if\(musicIncoming\)\{musicIncoming\.pause\(\);musicIncoming\.volume=0/);
assert.match(music,/a\.__sarahPlayPending/);
assert.match(rana,/build:58,version:'5\.8\.1'/);

rt.run("mode='story';stage=1;globalThis.__metaA=currentStage();globalThis.__metaB=currentStage();");
assert(rt.run("__metaA===__metaB"),'Expanded story metadata is cached');
rt.run("mode='trial';stage=1;globalThis.__trialMeta=currentStage();");
assert(rt.run("__trialMeta===STAGES[1]"),'Trial mode keeps the original stage metadata');
rt.run("mode='story';stage=3;globalThis.stage4GateToast=true;loadStage();");
assert.equal(rt.run("globalThis.stage4GateToast"),false,'Fresh stage load resets the one-shot storm-seal message');

rt.run("globalThis.__released=false;globalThis.__fakePointer={dataset:{key:'ArrowLeft'},hasPointerCapture:()=>false,classList:{remove(){}},setAttribute(){globalThis.__released=true}};activeTouchPointers.set(777,__fakePointer);keys.add('ArrowLeft');state='playing';pause();");
assert.equal(rt.run("activeTouchPointers.size"),0,'Pause releases active touch pointers');
assert.equal(rt.run("keys.has('ArrowLeft')"),false,'Pause clears held movement keys');

console.log('5.8.1 audit passed: logo, Palace center, metadata cache, state cleanup, shark wake/bite, audio guards and stale-state resets are fixed.');
