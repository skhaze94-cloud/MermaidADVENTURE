'use strict';
const assert=require('node:assert/strict'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`mode='sarah';stage=-1;loadStage();state='playing';
assert.equal(obstacles.length,16);assert.equal(new Set(obstacles.map(o=>o.tutorialTile)).size,4);
assert(obstacles.every(o=>o.x<5900),'Practice parade and arena remain open');
assert(obstacles.filter(o=>o.y<500).length>=3,'Route includes overhead passages');
assert.equal(TUTORIAL_REEF_CROPS.length,4);assert.equal(TUTORIAL_FACE_CROPS.length,4);
// A conservative 60x60 swimmer must be able to reach every lesson, relic and portal.
const cell=20,lo=waterSurface()+45,hi=855,seen=new Set(),q=[[220,550]];
function free(x,y){return x>=100&&x<=7480&&y>=lo&&y<=hi&&!obstacles.some(o=>x+30>o.x&&x-30<o.x+o.w&&y+30>o.y&&y-30<o.y+o.h);}
while(q.length){const [x,y]=q.pop(),key=x+','+y;if(seen.has(key)||!free(x,y))continue;seen.add(key);for(const [dx,dy]of [[cell,0],[-cell,0],[0,cell],[0,-cell]])q.push([x+dx,y+dy]);}
for(const [x,y]of [[650,720],[1490,540],[2450,760],[3840,550],[4540,550],[5660,490],[5860,435],[6120,500],[6300,690],[6480,470],[6900,550],[7400,550]])assert([...seen].some(k=>{const [sx,sy]=k.split(',').map(Number);return Math.hypot(x-sx,y-sy)<70;}),'Reachable '+x+','+y);
// Worst-case ring placement at the new ceiling bend remains collectible.
training.step=-2;training.swimSeconds=12;nessie.x=3500;nessie.vx=100;updateTraining(.016);
for(const r of TRAINING_RINGS)assert(tutorialRingClear(r.x,r.y),'Clear dynamic ring');
assert.equal(tutorialDaddyFaceIndex('idle'),0);assert.equal(tutorialDaddyFaceIndex('celebrate'),1);assert.equal(tutorialDaddyFaceIndex('thunderCharge'),2);assert.equal(tutorialDaddyFaceIndex('arrival'),3);
assert(drawTutorialReefBarrier(obstacles[0],0,0));drawTutorialDaddyHead('teach',{head:0},2,500);
// New reef renderer is explicitly isolated from later stages.
stage=0;assert.equal(drawTutorialReefBarrier({tutorialTile:0},0,0),false);
`);
console.log('Tutorial 6.0 passed: connected swim maze, accessible lessons/relics/arena, safe rings, four expressions and chapter isolation.');
