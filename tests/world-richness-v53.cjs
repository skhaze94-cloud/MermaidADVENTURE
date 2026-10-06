'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
const tutorial=fs.readFileSync('dist/tutorial-two.js','utf8'),polish=fs.readFileSync('dist/polish.js','utf8'),html=fs.readFileSync('dist/index.html','utf8');
assert.match(tutorial,/const shoals=/);
assert.match(tutorial,/const gardens=/);
assert.match(tutorial,/drawOrnatePortal\(x,g\.y-35,175,tick,false\)/);
assert.match(polish,/if\(small\)\{warpedSprite/);
assert.match(html,/5\.\d+ · /);
rt.run(`
mode='sarah';stage=0;loadStage();state='playing';dialogueSeen=new Set(Object.keys(conversations));
assert.equal(W,15200);assert.equal(HIGHLAND_LENGTH,15200);assert.equal(boss.x,14600);assert.equal(currentStage().count,144);assert.equal(HIGHLAND_ROUTE_ZONES.length,5);
assert(obstacles.some(o=>o.x>13700));assert(coins.some(c=>c.x>14000));assert(powerups.some(p=>p.x>14000));
assert(enemies.some(e=>e.kind==='eel'));assert(enemies.some(e=>e.kind==='swordfish'));assert(enemies.filter(e=>e.scuttle).length>=13);
assert.equal(new Set(fish.map(f=>f.kind)).size,5);
highland.fallen=true;checkpoint=13750;nessie.x=13940;nessie.y=500;updateStory(.016);assert(boss.active);
mode='trial';stage=0;loadStage();assert.equal(W,3800);assert.equal(currentStage().count,36);
mode='sarah';stage=-1;loadStage();assert.equal(W,7600);assert.equal(training.relics.length,3);assert.equal(new Set(fish.map(f=>f.kind)).size,5);
`);
console.log('5.3 world richness passed: doubled Highland route, five regions, mixed ambient life and tutorial set-dressing coexist with unchanged trial/tutorial bounds.');
