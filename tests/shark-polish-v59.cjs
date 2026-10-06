'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`
mode='story';stage=1;loadStage();state='playing';obstacles=[];enemies=[];
const s=spawnReefShark(2000,520);nessie.x=1800;nessie.y=520;
s.sharkState='lunge';s.vx=900;s.vy=0;s.sharkTime=0;invincible=10;
updateReefSharks(.016);assert.equal(s.facing,-1,'Face follows committed rightward velocity although Sarah is behind');
s.x=nessie.x;s.y=nessie.y;leap.breached=true;let healthBefore=health;invincible=0;
updateReefSharks(.016);assert.equal(health,healthBefore,'Underwater bite cannot hit an airborne Sarah');
leap.breached=false;s.x=nessie.x;s.y=nessie.y;s.vx=0;s.vy=0;sharkState(s,'stunned');dashTime=0;
healthBefore=health;updateReefSharks(.016);assert.equal(health,healthBefore,'A stunned shark is harmless');
s.x=2300;s.y=520;nessie.x=2600;nessie.y=520;sharkState(s,'lock');leap.breached=true;
updateReefSharks(.016);assert.equal(s.sharkState,'recover','Abandon aiming when Sarah escapes above water');leap.breached=false;
obstacles=[{x:2400,y:450,w:180,h:140}];s.x=2200;s.y=520;s.clock=1;s.avoidUntil=0;
const a=sharkObstacleSteer(s,2700,521);s.clock+=.02;
const b=sharkObstacleSteer(s,2700,519);assert.equal(Math.sign(a.y-s.y),Math.sign(b.y-s.y),'Detour does not flicker across a near-identical target');
const e={x:2375,y:500,bx:2200,by:500,vx:30,vy:0};resolveEnemyScenery(e,2370,500);
assert.equal(e.bx,2200,'Collision preserves patrol origin');
obstacles=[];boss={active:true,hp:3,clock:1,vulnerable:true,hitCooldown:0};
releaseBossActor(carloArt,2000,520,300); // Previously threw ReferenceError: height.
assert.equal(sharkPaintedPose('patrol'),0);assert.equal(sharkPaintedPose('lunge'),1);
assert.equal(sharkPaintedPose('bite'),2);assert.equal(sharkPaintedPose('stunned'),3);
drawReefShark(s,1); // Painted path, including world-space cues, must execute.
`);
assert(fs.existsSync('dist/assets/gentleman-shark.webp'));
for(const src of rt.run('Object.values(MUSIC_TRACKS).map(t=>t.src)'))assert(fs.existsSync('dist/'+src),'Playable soundtrack exists: '+src);
assert.match(fs.readFileSync('dist/polish.js','utf8'),/BOSS_V4_IMAGES,sharkPaintedArt/);
console.log('5.9 passed: committed facing, aerial escape, harmless stun, stable detours/anchors, boss cue, painted poses.');
