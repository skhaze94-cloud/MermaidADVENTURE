'use strict';
const assert=require('node:assert/strict'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`
const w92=9,h92=9,p92=new Uint8ClampedArray(w92*h92*4);for(let i=0;i<81;i++)p92.set([4,34,67,255],i*4);
for(let y=2;y<7;y++)for(let x=2;x<7;x++)p92.set([180,160,90,255],(y*9+x)*4);
p92.set([0,145,230,255],(3*9+3)*4);p92.set([4,34,67,255],(4*9+4)*4);cutoutPixels92(p92,9,9);
assert.equal(p92[3],0);assert.equal(p92[(3*9+3)*4+3],255);assert.equal(p92[(4*9+4)*4+3],255);assert.equal(p92[(5*9+5)*4+3],255);
mode='sarah';stage=0;loadStage();state='playing';const layout92=JSON.stringify({W,obstacles,enemies,powerups,coins,boss,health,energy});scenery92(1);drawSeabedEdge90(1);assert.equal(JSON.stringify({W,obstacles,enemies,powerups,coins,boss,health,energy}),layout92);assert.equal(W,20748);assert.equal(enemies.length,68);assert.equal(LEVEL92_IMAGES.length,9);
assert(level192());mode='trial';assert(!level192());mode='sarah';stage=-1;assert(!level192());stage=1;assert(!level192());stage=2;assert(!level192());stage=3;assert(!level192());stage=0;setupShadowCrabKingdom();assert(!level192());V70.shadow.active=false;setupDarkTunnelChapter();assert(!level192());V71.tunnel.active=false;
loadStage();state='playing';beginHighlandFall();assert.equal(FALL_DURATION,17);assert.equal(highland.fall.hazards.length,12);assert.equal(highland.fall.hazards.filter(h=>h.kind==='eel').length,3);
`);console.log('9.2 matte, chapter isolation, scenery purity, enemies, length and waterfall checks passed');
