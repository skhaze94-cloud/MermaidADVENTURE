'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
const tutorial=fs.readFileSync('dist/tutorial-two.js','utf8'),polish=fs.readFileSync('dist/polish.js','utf8'),html=fs.readFileSync('dist/index.html','utf8');
assert.match(tutorial,/const shoals=/);
assert.match(tutorial,/const gardens=/);
assert.doesNotMatch(tutorial,/drawOrnatePortal\(x,g\.y-35,175,tick,false\)/,'8.5 leaves the real farewell portal unambiguous');
assert.match(polish,/if\(small\)\{warpedSprite/);
assert.match(html,/\d+\.\d+ · /);
rt.run(`
mode='sarah';stage=0;loadStage();state='playing';dialogueSeen=new Set(Object.keys(conversations));
assert.equal(W,20748);assert.equal(HIGHLAND_LENGTH,20748);assert.equal(boss.x,20358);assert.equal(currentStage().count,144);assert.equal(HIGHLAND_ROUTE_ZONES.length,5);
assert(obstacles.some(o=>o.x>18200));assert(coins.some(c=>c.x>18200));assert(powerups.some(p=>p.x>W-1700));
assert(enemies.some(e=>e.kind==='eel'));assert(enemies.some(e=>e.kind==='swordfish'));assert(enemies.filter(e=>e.scuttle).length>=13);
assert.equal(new Set(fish.map(f=>f.kind)).size,5);
highland.fallen=true;checkpoint=highlandRouteX(13750);nessie.x=HIGHLAND_BOSS_TRIGGER+20;nessie.y=500;updateStory(.016);assert(boss.active);
mode='trial';stage=0;loadStage();assert.equal(W,3800);assert.equal(currentStage().count,36);
mode='sarah';stage=-1;loadStage();assert.equal(W,7600);assert.equal(training.relics.length,3);assert.equal(new Set(fish.map(f=>f.kind)).size,5);
`);
console.log('5.3 world richness passed: doubled Highland route, five regions, mixed ambient life and tutorial set-dressing coexist with unchanged trial/tutorial bounds.');
