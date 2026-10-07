'use strict';
const assert=require('node:assert/strict'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`
mode='sarah';stage=0;loadStage();state='playing';dialogueSeen=new Set(Object.keys(conversations));
V70.mermaidPowers.bubble=false;V70.unlock={active:false,time:0,targets:[],shots:0,finished:false,dialogueShown:false};
boss.hp=0;boss.winShown=false;bossDefeat=0;updateStory(.016);
assert.equal(mermaidBubbleUnlocked(),true);assert.equal(V70.unlock.targets.length,3);assert.equal(familyPortalOpen(),false);
for(const target of V70.unlock.targets){V70.bubbleProjectiles.push({x:target.x,y:target.y,vx:0,vy:0,life:1,age:0,r:15,phase:0});updateMermaidBubble(.001);}
assert.equal(V70.unlock.finished,true);assert.equal(familyPortalOpen(),true);
state='playing';completeStage();assert.equal(V70.shadow.transition,'into');assert.equal(state,'portal');
updatePortal(3.5);assert.equal(isShadowCrabKingdom(),true);assert.equal(W,22000);assert(enemies.length>=20);assert.equal(currentStage().id,'shadow-crab');
V70.shadow.transition='';state='playing';boss.active=true;V70.shadow.duo.collisionReady=true;V70.shadow.duo.dolphin.x=boss.x;V70.shadow.duo.dolphin.y=boss.y;updateShadowBoss(.016);assert(V70.shadow.duo.crabStun>0);assert(V70.shadow.duo.dolphin.stun>0);
`);
assert.equal(rt.run("MUSIC_TRACKS.shadowKingdom.label"),'Shadow Crab Kingdom · Kingdom Below');
assert.equal(rt.run("MUSIC_TRACKS.shadowBoss.label"),'Shadow Crab + Dolphin · Double Trouble');
console.log('7.0 runtime progression passed: Carlo unlock -> Bubble tutorial -> Shadow Kingdom -> duo collision, with distinct music routing.');
