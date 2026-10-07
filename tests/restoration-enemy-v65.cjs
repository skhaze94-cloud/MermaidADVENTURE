'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
const html=fs.readFileSync('dist/index.html','utf8'),game=fs.readFileSync('dist/game.js','utf8'),polish=fs.readFileSync('dist/polish.js','utf8');

assert.match(html,/6\.5 · RESTORATION \+ ENEMY POLISH/);
for(const token of ["drawIdentitySafeSarah","art===sarahArt","imageSmoothingQuality='high'","ctx.drawImage(art,-w/2,-h/2,w,h)"])assert(polish.includes(token),token);
for(const token of ["longRouteArchetype","coral-sentinel","reef-guard","bubble-bomber","moon-jelly","kelp-stalker","blue-lancer"])assert(game.includes(token),token);
for(const token of ["ENEMY_ARCHETYPE_VISUALS","ENEMY_ARCHETYPE_TUNE"])assert(polish.includes(token),token);
assert.match(game,/area<1500000\?3:2/);
assert.match(game,/ctx\.imageSmoothingQuality='high'/);

rt.run("mode='story';stage=2;loadStage();globalThis.__v65Arch=v65EnemyArchetypes.slice().sort();");
const archetypes=rt.run('__v65Arch');
for(const name of ['coral-sentinel','reef-guard','bubble-bomber','moon-jelly','kelp-stalker','blue-lancer'])assert(archetypes.includes(name),'Stage 3 long route includes '+name);

rt.run("projectiles=[];stage=1;fireEnemyVolley({x:1200,y:520,phase:0,archetype:'bubble-bomber'});globalThis.__v65Bomb=projectiles.map(p=>[p.type,p.variant]);");
assert(rt.run('__v65Bomb').some(([type,variant])=>type==='mine'&&variant==='orbit'),'Bubble Bomber launches an orbiting mine');
rt.run("projectiles=[];stage=1;fireEnemyVolley({x:1200,y:520,phase:0,archetype:'blue-lancer'});globalThis.__v65Lance=projectiles.map(p=>Math.round(Math.hypot(p.vx,p.vy)));");
assert(rt.run('__v65Lance').every(v=>v===320),'Blue Lancer fires a fast paired lance');

console.log('6.5 passed: identity-safe Sarah rendering, high-quality canvas smoothing, six distinct elite archetypes and bespoke attack patterns.');
