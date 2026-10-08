'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
const shark=fs.readFileSync('dist/predators-v56.js','utf8'),html=fs.readFileSync('dist/index.html','utf8');

assert.match(html,/(?:6\.\d+|[78]\.\d+) · /);
for(const state of ['patrol','investigate','stalk','circle','lock','charge','lunge','bite','overshoot','recover','stunned'])assert(shark.includes("'"+state+"'"),state);
for(const token of ['SHARK_TUNE','sharkObstacleSteer','sharkPointBlocked','drawSharkWake','sharkLayerFin','jawOpen','Top hat',"ctx.fillStyle='#ffd45f'"])assert(shark.includes(token),token);
assert(shark.includes('enragedChargeSpeed:1030'));
assert(shark.includes('detectRange:920'));

rt.run(`
mode='story';stage=1;loadStage();state='playing';dialogueSeen=new Set(Object.keys(conversations));
const sh=enemies.find(isReefShark);assert(sh);assert.equal(sh.maxHp,3);
obstacles=[];sh.x=3000;sh.y=520;sh.bx=3000;sh.by=520;nessie.x=3450;nessie.y=520;sh.cooldown=0;
updateReefSharks(.016);assert.equal(sh.sharkState,'investigate');
sh.sharkTime=SHARK_TUNE.investigateTime+.02;updateReefSharks(.016);assert.equal(sh.sharkState,'stalk');
sh.sharkTime=SHARK_TUNE.stalkTime+.02;updateReefSharks(.016);assert.equal(sh.sharkState,'circle');
sh.sharkTime=SHARK_TUNE.circleTime+.02;updateReefSharks(.016);assert.equal(sh.sharkState,'lock');
sh.sharkTime=SHARK_TUNE.lockTime+.02;updateReefSharks(.016);assert.equal(sh.sharkState,'charge');
sh.hp=1;sh.aimX=nessie.x;sh.aimY=nessie.y;updateReefSharks(.001);assert.equal(sh.sharkState,'lunge');globalThis.__enragedSpeed=Math.hypot(sh.vx,sh.vy);
`);
assert(rt.run('__enragedSpeed')>1000,'Enraged shark charge is aggressive');

rt.run(`
globalThis.__shark2=enemies.find(isReefShark);__shark2.x=800;__shark2.y=500;obstacles=[{x:1000,y:400,w:180,h:220}];globalThis.__steer=sharkObstacleSteer(__shark2,1400,500);
`);
assert(rt.run('__steer.blocked'),'Forward sensor detects a barrier');
assert.notEqual(rt.run('__steer.y'),500,'Barrier look-ahead chooses a vertical detour');

rt.run(`
globalThis.__shark3=enemies.find(isReefShark);obstacles=[];__shark3.x=3000;__shark3.y=520;__shark3.bx=3000;__shark3.by=520;__shark3.hp=3;__shark3.maxHp=3;sharkState(__shark3,'patrol');nessie.x=__shark3.x;nessie.y=__shark3.y;dashTime=.2;dashCooldown=0;updateReefSharks(.016);globalThis.__first=[__shark3.hp,__shark3.sharkState];dashTime=.2;updateReefSharks(.016);globalThis.__sameStun=__shark3.hp;dashTime=0;sharkState(__shark3,'recover');__shark3.sharkTime=SHARK_TUNE.recoverTime+.1;updateReefSharks(.016);sharkState(__shark3,'patrol');__shark3.x=nessie.x;__shark3.y=nessie.y;dashTime=.2;updateReefSharks(.016);globalThis.__second=__shark3.hp;
`);
assert.equal(rt.run('__first[0]'),2);assert.equal(rt.run('__first[1]'),'stunned');assert.equal(rt.run('__sameStun'),2,'One HP chunk per stun window');assert.equal(rt.run('__second'),1);

console.log('5.8/6.1 shark regression passed: layered rig, smooth hunt states, barrier look-ahead and multi-stun combat are preserved.');
