'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
const game=fs.readFileSync('dist/game.js','utf8'),polish=fs.readFileSync('dist/polish.js','utf8'),pred=fs.readFileSync('dist/predators-v56.js','utf8'),ranaSrc=fs.readFileSync('dist/rana.js','utf8'),html=fs.readFileSync('dist/index.html','utf8');
assert.match(html,/6\.\d+ · /);
for(const token of ['for(let i=0;i<34;i++)fish.push','for(let i=0;i<36;i++)bubbles.push','for(let i=0;i<24;i++)','nessie.y>730?.18:.34'])assert(game.includes(token),token);
assert.match(polish,/ctx\.globalAlpha=\.3;envDraw\(4/);
assert.match(polish,/const center=palaceArenaCenter\(\),x=center-camera/);
assert.match(pred,/function drawSharkHealthBar/);assert.match(pred,/HUNT SHARK/);assert.match(pred,/faceHold/);
assert.match(ranaSrc,/RANA_ARENA_EXPANDED_RIGHT=7240/);assert.match(ranaSrc,/function ranaAvoidObstacles/);
rt.run(`
mode='story';stage=3;loadStage();state='playing';dialogueSeen=new Set(Object.keys(conversations));
assert.equal(W,22800);assert.equal(ranaArenaRight(),21720);
const sharks=enemies.filter(isReefShark);assert.equal(sharks.length,6);assert(sharks.every(s=>s.maxHp===4&&s.arenaShark&&s.aggressive));
assert.equal(obstacles.filter(o=>o.huntArena).length,3);assert(launchPads.some(p=>p.x===21120));
nessie.x=8400;nessie.y=560;updateRana(.016);assert(boss.active);
nessie.x=15600;nessie.vx=100;const before=nessie.x;updateExtendedStoryGate();assert.equal(nessie.x,before,'Expanded arena stays open while Rana is active');
bossAnnounced=true;rana.state='observe';rana.time=0;boss.x=9840;boss.y=570;nessie.x=18750;nessie.y=620;invincible=1000;
for(let i=0;i<120;i++)updateRana(1/60);globalThis.__ranaTracked=boss.x;
const huntShark=sharks[0];assert.equal(huntShark.hp,4);nessie.x=huntShark.x;nessie.y=huntShark.y;dashTime=.2;sharkState(huntShark,'patrol');updateReefSharks(.016);globalThis.__afterFirst=huntShark.hp;dashTime=.2;updateReefSharks(.016);globalThis.__afterRepeat=huntShark.hp;
`);
assert(rt.run('__ranaTracked')>12900,'Rana follows Sarah well beyond the old arena');
assert.equal(rt.run('__afterFirst'),3);assert.equal(rt.run('__afterRepeat'),3,'Stunned shark cannot lose another HP chunk until recovery');
rt.run(`
const s=enemies.find(isReefShark);s.facing=1;s.faceHoldUntil=s.clock+1;const oldFace=s.facing;updateSharkFacing(s,180,false);globalThis.__heldFace=[oldFace,s.facing];s.renderAngle=.2;s.vx=200;s.vy=-20;const oldAngle=s.renderAngle;sharkMoveToward(s,s.x+300,s.y,220,.016,1);globalThis.__angleDelta=Math.abs(s.renderAngle-oldAngle);
`);
assert.equal(rt.run('__heldFace[0]'),1);assert.equal(rt.run('__heldFace[1]'),1,'Facing hysteresis prevents rapid flip chatter');
assert(rt.run('__angleDelta')<.08,'Rendered pitch changes smoothly');
console.log('6.1 clarity/predator arena passed: lower decoration density, six 4-HP hunt sharks, smooth steering, open arena and roaming Rana.');