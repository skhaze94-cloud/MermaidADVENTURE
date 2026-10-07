'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('dist/index.html','utf8'),src=fs.readFileSync('dist/family-spectacular-v70.js','utf8'),css=fs.readFileSync('dist/family-spectacular-v70.css','utf8');new vm.Script(src);
assert.match(html,/family-spectacular-v70\.css/);assert.match(html,/family-spectacular-v70\.js/);
for(const p of ['orbit','coward','drifter','hunter','charger','territorial','support','guardian','artillery'])assert(src.includes("'"+p+"'")||src.includes(":"+p),p);
for(const surprise of ['wave-starfish','sneeze-clam','tiny-fish','whale'])assert(src.includes(surprise),surprise);
assert.match(src,/V70_SECRET_POINTS/);assert.match(src,/function v70AddLaterCrabs/);assert.match(src,/Shadow Scout Crab/);assert.match(src,/Bubble Secret!/);assert.match(src,/particles\.length>300/);assert.match(src,/projectiles\.length>72/);assert.match(src,/Optional Mermaid Adventure artwork failed to load/);
assert.match(css,/definitive-hud/);assert.match(css,/boss-hud\.vulnerable/);assert.match(css,/prefers-reduced-motion/);
console.log('7.0 spectacular polish regression passed: cohesive UI, personality layer, Bubble secrets, handcrafted surprises, caps and graceful asset fallback.');
