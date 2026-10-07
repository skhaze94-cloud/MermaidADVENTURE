'use strict';
const assert=require('node:assert/strict'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`const transforms731=[];ctx.transform=(...a)=>transforms731.push(a);
warpedSprite(jellyArt731,[0,0,1,1],114,188,(u,v)=>({x:u*114,y:v*188}),4,9);
for(const m of transforms731){assert(Math.abs(m[0]-1)<1e-9);assert(Math.abs(m[1])<1e-9);assert(Math.abs(m[2])<1e-9);assert(Math.abs(m[3]-1)<1e-9);assert(Math.abs(m[4])<1e-9);assert(Math.abs(m[5])<1e-9);}
mode='sarah';stage=0;loadStage();state='playing';dialogueSeen=new Set(Object.keys(conversations));
const e=enemies.find(e=>e.scuttle&&e.phase%3===0);nessie.x=e.x-400;nessie.y=500;
updateCreatureEncounters731(.1);assert.equal(e.emergence731,0);assert(drawBurrowCue731(e,1));
for(let i=0;i<5;i++)updateCreatureEncounters731(.1);assert.equal(e.emergence731,0);
for(let i=0;i<10;i++)updateCreatureEncounters731(.1);assert.equal(e.emergence731,1);assert(!drawBurrowCue731(e,1));
assert.equal(creaturePose731({windup:.3},0,'crab'),2);assert.equal(creaturePose731({state:'attack'},0,'crab'),3);
assert.equal(creaturePose731({sparkState:'coil'},0,'eel'),2);assert.equal(creaturePose731({sparkState:'lunge'},0,'eel'),3);
for(const kind of ['pearl-crab','jelly','eel','spark-eel'])assert(drawCreature731({kind,x:500,y:500,hp:2,maxHp:2},1));
mode='sarah';stage=-1;loadStage();assert.equal(W,7600);
setupShadowCrabKingdom();assert.equal(W,14300);assert(coins.every(c=>c.x<W-150));assert(V70.shadow.decor.every(d=>d.x<W));assert(boss.x<W-300);
setupDarkTunnelChapter();assert.equal(W,10270);assert(coins.every(c=>c.x<W-150));assert(obstacles.every(o=>o.x+o.w<W));assert(boss.x<W-300);
`);
console.log('7.31 passed: attack poses, safe burrow timing, untouched tutorial, shortened interlude collectibles and boss endpoints.');
