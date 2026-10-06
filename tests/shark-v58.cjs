'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
const shark=fs.readFileSync('dist/predators-v56.js','utf8'),html=fs.readFileSync('dist/index.html','utf8');

assert.match(html,/5\.8 · DEFINITIVE SHARK/);
for(const state of ['patrol','investigate','stalk','circle','lock','charge','lunge','bite','overshoot','recover','stunned'])assert(shark.includes("'"+state+"'"),state);
for(const token of ['SHARK_TUNE','sharkObstacleSteer','sharkPointBlocked','drawSharkWake','sharkLayerFin','jawOpen','gold tooth','Top hat'])assert(shark.includes(token),token);
assert(shark.includes('enragedChargeSpeed:1030'));
assert(shark.includes('detectRange:920'));

rt.run(`
mode='story';stage=1;loadStage();state='playing';dialogueSeen=new Set(Object.keys(conversations));
const sh=enemies.find(isReefShark);assert(sh);assert.equal(sh.maxHp,2);
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
const sh=enemies.find(isReefShark);sh.x=800;sh.y=500;obstacles=[{x:1000,y:400,w:180,h:220}];globalThis.__steer=sharkObstacleSteer(sh,1400,500);
`);
assert(rt.run('__steer.blocked'),'Forward sensor detects a barrier');
assert.notEqual(rt.run('__steer.y'),500,'Barrier look-ahead chooses a vertical detour');

rt.run(`
const sh=enemies.find(isReefShark);obstacles=[];sh.x=3000;sh.y=520;sh.bx=3000;sh.by=520;sh.hp=2;sh.maxHp=2;sharkState(sh,'patrol');nessie.x=sh.x;nessie.y=sh.y;dashTime=.2;dashCooldown=0;updateReefSharks(.016);globalThis.__first=[sh.hp,sh.sharkState];dashTime=.2;sh.x=nessie.x;sh.y=nessie.y;updateReefSharks(.016);globalThis.__second=[sh.hp,sh.sharkState];
`);
assert.equal(rt.run('__first[0]'),1);assert.equal(rt.run('__first[1]'),'stunned');assert.equal(rt.run('__second[0]'),0);

console.log('5.8 Definitive Shark passed: layered rig, full hunt state chain, enraged charge, barrier look-ahead and two-hit combat are preserved.');
