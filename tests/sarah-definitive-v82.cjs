'use strict';
const assert=require('node:assert/strict'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`mode='sarah';stage=0;loadStage();state='playing';
for(const variant of ['standard','heart','boost','combo','boss']){
 leap={active:true,breached:true,variant,airDuration:1,airTime:0};
 const world=JSON.stringify({hero:nessie,health,energy,score,leap});
 for(let i=0;i<=100;i++){const f=sarahFlight82(i/100,variant);assert(Number.isFinite(f.angle));assert(f.tuck>=0&&f.tuck<=1);assert(Math.abs(f.roll)<=1);}
 assert.equal(JSON.stringify({hero:nessie,health,energy,score,leap}),world,'Pose sampling cannot modify physics or rewards');
 const start=jumpPose();leap.airTime=1;const end=jumpPose();assert.equal(start.angle,0);assert(Math.abs(end.angle-Math.PI*2*(variant==='boss'?2:1))<1e-10);assert.equal(start.squash,1);assert.equal(end.squash,1);
 for(let i=0;i<=100;i++){leap.airTime=i/100;const p=jumpPose();assert(p.squash>=.925&&p.squash<=1);assert(Math.abs(p.skew)<=.055);}
 assert(sarahFlight82(.061,variant).angle<.0001,'Takeoff starts gently');
}
assert(sarahFlight82(.5,'boost').tuck>sarahFlight82(.5,'standard').tuck,'Powered leap uses a tighter tuck');assert(sarahFlight82(.7,'heart').open>sarahFlight82(.7,'standard').open,'Heart leap opens more expressively');
leap.breached=true;leap.airTime=.4;updateSarahPose81(1/60);leap.breached=false;updateSarahPose81(1/60);assert.equal(SARAH81_STATE.recovery,1,'Landing triggers follow-through');const recovered=sarahMotion81(2,1);assert(recovered.recover>0);for(let i=0;i<90;i++)updateSarahPose81(1/60);assert(SARAH81_STATE.recovery<.00001,'Recovery settles');
leap.active=true;leap.breached=false;for(let i=0;i<15;i++)updateSarahPose81(1/60);assert(sarahMotion81(1,1).charge>.8,'Underwater takeoff gathers the limbs');
V70.attackPulse=.11;assert(sarahMotion81(1,1).attack>.99,'Bubble cast has a hand gesture');V70.attackPulse=0;
state='paused';const before=JSON.stringify(SARAH81_STATE);updateSarahPose81(.1);assert.equal(JSON.stringify(SARAH81_STATE),before);state='playing';loadStage();assert.equal(SARAH81_STATE.recovery,0);assert.equal(SARAH81_STATE.charge,0);
mode='story';leap={active:true,breached:true,variant:'standard',airDuration:1,airTime:.25};assert(jumpPose().angle<0,'Nessie keeps the original leap');
mode='sarah';stage=-1;trainingHero='daddy';assert(jumpPose().angle<0,'King Daddy keeps his original leap');
`);
const quiet=require('./runtime.cjs')(false,[],{reducedMotion:true});assert.equal(quiet.run("mode='sarah';leap={active:true,breached:true,airTime:.5,airDuration:1};JSON.stringify(jumpPose())"),' {"angle":0,"squash":1,"stretch":1,"skew":0}'.trim());
console.log('8.2 Sarah: smooth corkscrew endpoints, protected proportions, landing/takeoff/attack poses, pause and character isolation passed.');
