'use strict';
const assert=require('node:assert/strict'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`
function enter87(){mode='sarah';stage=0;loadStage();state='playing';dialogueSeen=new Set(Object.keys(conversations));nessie.x=3040;beginHighlandFall();for(let i=0;i<109;i++)update(1/60);invincible=100;return highland.fall;}
let f87=enter87();assert.equal(f87.phase,'descent');assert.equal(f87.hazards.filter(h=>h.kind==='eel').length,3);
for(const [key,axis,sign] of [['ArrowUp','y',-1],['ArrowDown','y',1],['ArrowLeft','x',-1],['ArrowRight','x',1]]){f87.x=f87.y=f87.vx=f87.vy=0;keys.add(key);for(let i=0;i<12;i++)update(1/60);assert.equal(Math.sign(f87[axis]),sign);keys.clear();}
// Boost is genuinely directional, normalized, charged once and gated by cooldown.
for(const [key,axis,sign] of [['w','vy',-1],['s','vy',1],['a','vx',-1],['d','vx',1]]){f87.boost=f87.boostCooldown=0;energy=1;keys.add(key);assert(boostInWaterfall());assert.equal(Math.sign(f87[axis]),sign);assert(Math.abs(energy-.6)<1e-9);assert(!boostInWaterfall());keys.clear();}
f87.boost=f87.boostCooldown=0;keys.add('ArrowUp');keys.add('ArrowRight');energy=1;assert(boostInWaterfall());assert(Math.abs(Math.hypot(f87.vx*waterfallHalf87(),f87.vy)-850)<1e-6);keys.clear();
f87.boost=f87.boostCooldown=0;energy=.2;assert(!boostInWaterfall());boostUnlimited=3;assert(boostInWaterfall());assert.equal(energy,.2);assert(f87.vy<0);assert(f87.vx>0);
keys.add(' ');for(let i=0;i<35;i++)update(1/60);assert(f87.boost>0);keys.clear();boostUnlimited=0;
// Edges cannot eject the hero; vertical dodges change the contact test itself.
f87.boost=f87.boostCooldown=0;f87.y=-145;f87.vy=-850;keys.add('w');update(.035);assert.equal(f87.y,-145);assert.equal(f87.vy,0);keys.clear();
f87.y=205;f87.vy=850;keys.add('s');update(.035);assert.equal(f87.y,205);assert.equal(f87.vy,0);keys.clear();
const h87=f87.hazards[0];f87.travel=h87.at;f87.x=h87.x;f87.y=0;assert(waterfallContact87(f87,h87,180,91));f87.y=-145;assert(!waterfallContact87(f87,h87,180,91));
// Animated eel X is shared by collision and drawing; a boost can defeat it.
const eel87=f87.hazards.find(h=>h.kind==='eel');f87.time=eel87.at-.016;f87.y=f87.vy=0;f87.vx=0;f87.x=waterfallHazardX(eel87,eel87.at);f87.boost=.3;const score87=score;updateHighlandFall(.016);assert(eel87.passed);assert.equal(score,score87+50);
const clock87=f87.time;state='paused';update(1);assert.equal(f87.time,clock87);assert(!boostInWaterfall());state='playing';
// Frame-rate independence of steering, under the existing 35ms frame cap.
function steer87(rate){const f=enter87();f.hazards=[];f.gold=[];f.currents=[];keys.add('ArrowUp');keys.add('ArrowRight');for(let i=0;i<rate*.3;i++)update(1/rate);keys.clear();return [f.x,f.y];}
const a87=steer87(30),b87=steer87(60),c87=steer87(120);assert(Math.abs(a87[1]-c87[1])<5);assert(Math.abs(b87[0]-c87[0])<.012);
`);
// Exercise the real multi-touch listeners, not only synthetic key sets.
rt.run('f87=enter87();energy=1');const up=rt.touch[0],boost=rt.touch[4],down=(button,id)=>button.events.pointerdown[0]({pointerId:id,preventDefault(){}});
down(up,81);down(boost,82);assert(rt.run('highland.fall.vy<0&&highland.fall.boost>0'));
boost.events.pointerup[0]({pointerId:82});assert(rt.run("keys.has('ArrowUp')&&!keys.has(' ')"));up.events.pointercancel[0]({pointerId:81});assert(!rt.run("keys.has('ArrowUp')"));
console.log('Waterfall 8.7 passed: four-way/diagonal boost, energy/cooldown/unlimited, actual-position collision, eel combat, safe edges, pause, frame-rate steering and multi-touch.');
