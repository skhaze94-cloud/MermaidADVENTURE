'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
const baseline=[{length:29640,count:68,sharks:4,eels:0},{length:33150,count:36,sharks:4,eels:10},{length:37050,count:40,sharks:4,eels:12},{length:41600,count:18,sharks:12,eels:6}];
for(let s=0;s<4;s++){
 rt.run(`mode='sarah';V70.shadow.active=false;V71.tunnel.active=false;stage=${s};loadStage();state='playing';dialogueSeen=new Set(Object.keys(conversations));`);
 const data=JSON.parse(rt.run(`JSON.stringify({W,count:enemies.length,sharks:enemies.filter(isReefShark).length,eels:enemies.filter(isSparkEel).length,boss:boss.x,coins:coins.map(c=>c.x),solids:obstacles.map(o=>({x:o.x,w:o.w})),enemies:enemies.map(e=>e.x)})`));const b=baseline[s];
 assert.equal(data.W,Math.round(b.length*.7));assert.equal(data.count,b.count);assert.equal(data.sharks,b.sharks);assert.equal(data.eels,b.eels);assert(data.boss<data.W-300);assert(data.coins.every(x=>x>0&&x<data.W-150));assert(data.enemies.every(x=>x>0&&x<data.W-150));assert(data.solids.every(o=>o.x>0&&o.x+o.w<data.W));
 // Draw order is an actual behavioral contract, not an assertion about source spelling.
 rt.run(`globalThis.order90=[];globalThis.originals90={};for(const name of ['drawPaintedWorld90','drawWorldScenery75','drawSeabedEdge90','drawHighlandDecoration90','drawStory','drawNessie']){originals90[name]=globalThis[name];globalThis[name]=()=>order90.push(name);}draw(2);`);
 const order=JSON.parse(rt.run('JSON.stringify(order90)'));assert(order.indexOf('drawPaintedWorld90')<order.indexOf('drawStory'));assert(order.indexOf('drawWorldScenery75')<order.indexOf('drawStory'));assert(order.indexOf('drawSeabedEdge90')<order.indexOf('drawNessie'));if(s===0)assert(order.indexOf('drawHighlandDecoration90')<order.indexOf('drawStory'));
 rt.run('for(const [name,fn] of Object.entries(originals90))globalThis[name]=fn;');
 rt.run(`{const before90=JSON.stringify({W,obstacles,enemies,powerups,health,energy});drawPaintedWorld90(2);drawScenery90(2);drawWaterLight90(2,waterSurface());drawSeabedEdge90(2);assert.equal(JSON.stringify({W,obstacles,enemies,powerups,health,energy}),before90);}`);
}
rt.run(`stage=-1;loadStage();assert.equal(W,7600);stage=0;loadStage();setupShadowCrabKingdom();assert.equal(W,14300);V70.shadow.active=false;setupDarkTunnelChapter();assert.equal(W,10270);V71.tunnel.active=false;mode='trial';stage=1;loadStage();assert.equal(W,3800);mode='sarah';stage=0;loadStage();beginHighlandFall();assert.equal(FALL_DURATION,17);assert.equal(highland.fall.hazards.filter(h=>h.kind==='eel').length,3);chooseMode('sarah');assert.equal(document.title,'Sarah Maria Family Adventure 9.0');`);
assert.equal(fs.readFileSync('VERSION','utf8').trim(),'9.0.0');assert.match(fs.readFileSync('dist/index.html','utf8'),/9\.0 · PAINTED WORLD ADVENTURE/);
console.log('9.0 passed: exact 30% core reduction, identical enemy/species counts, bounded placements, actors above scenery, pure rendering, unchanged tutorial/interludes/trial/waterfall and consistent release metadata.');
