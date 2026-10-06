const assert=require('node:assert/strict'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`
function beginOpenJump(chapter=0){mode='story';stage=chapter;loadStage();state='playing';enemies=[];boss=null;obstacles=[];nessie.x=1100;nessie.y=650;keys.clear();keys.add('ArrowUp');}
for(const chapter of [-1,0,1,2,3]){beginOpenJump(chapter);assert(!nearLaunchPad());requestJump();assert(leap.active);let breached=false;for(let i=0;i<240&&leap.active;i++){updateSwimmer(1/60,0,0);breached ||= leap.breached;}assert(breached);assert(!leap.active);assert(nessie.y>=waterSurface()+25);}
beginOpenJump();energy=.39;requestJump();assert(!leap.active);
beginOpenJump();energy=.4;nessie.vx=0;const low=jumpProfile(closestLaunchPad());energy=1;nessie.vx=800;const fast=jumpProfile(closestLaunchPad());assert(fast.speed>low.speed);assert(fast.height>low.height);boostUnlimited=8;const ultimate=jumpProfile(closestLaunchPad());assert(ultimate.speed>fast.speed);assert(ultimate.height>=fast.height);requestJump();assert.equal(leap.variant,'boost');assert.equal(energy,1);
beginOpenJump();energy=0;bossLeapReady=true;requestJump();assert.equal(leap.variant,'boss');assert(!bossLeapReady);const target=leap.target;for(let i=0;i<300&&leap.active;i++)updateSwimmer(1/60,0,0);assert(Math.abs(nessie.x-target)<80);
beginOpenJump();keys.clear();keys.add('ArrowRight');burst();assert(!leap.active);assert(nessie.vx>0);
`);
console.log('Open jumps passed: all worlds, energy gate, momentum, ultimate boost, boss reward, landing and normal combat boost.');
