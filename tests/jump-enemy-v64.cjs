'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
const html=fs.readFileSync('dist/index.html','utf8'),game=fs.readFileSync('dist/game.js','utf8'),controls=fs.readFileSync('dist/controls-v64.css','utf8'),spark=fs.readFileSync('dist/spark-eel.js','utf8'),polish=fs.readFileSync('dist/polish.js','utf8');

assert.match(html,/(?:6\.4 · JUMP \+ ENEMY OVERHAUL|6\.5 · RESTORATION \+ ENEMY POLISH|7\.0 · FANTASTIC DEFINITIVE FAMILY UPDATE)/);
assert.match(html,/id="desktop-jump"/);assert.match(html,/controls-v64\.css/);
assert.match(game,/J \/ SHIFT/);assert.match(game,/jumpKey=key==='j'/);assert.match(game,/function doubleStoryEnemyRoster/);
assert.match(controls,/desktop-jump-action/);assert.match(controls,/bounce-ready/);assert.match(controls,/double-ready/);
for(const token of ['faceHoldUntil','renderAngle','Luminous dorsal line','BOOST DISRUPTED'])assert(spark.includes(token),token);
for(const token of ['RELEASE_ENEMY_PROFILE','swordfish','puffer','jelly','seahorse','globalCompositeOperation=\'screen\''])assert(polish.includes(token.replace(/\\'/g,"'")),token);

const fire=(type,key,code)=>rt.windowEvents[type].forEach(fn=>fn({key,code,repeat:false,preventDefault(){},target:{tagName:'CANVAS'}}));
rt.run("mode='story';stage=0;loadStage();state='playing';dialogueSeen=new Set(Object.keys(conversations));energy=1;resetLeap();");
fire('keydown','j','KeyJ');assert(rt.run('leap.active'),'J starts a jump on desktop');fire('keyup','j','KeyJ');
rt.run("resetLeap();energy=1;leap.cooldown=0;state='playing';");fire('keydown','Shift','ShiftLeft');assert(rt.run('leap.active'),'Shift starts the same jump');fire('keyup','Shift','ShiftLeft');
rt.run("resetLeap();energy=.39;leap.cooldown=0;state='playing';");fire('keydown','j','KeyJ');assert(!rt.run('leap.active'),'Low energy still gates jumping');fire('keyup','j','KeyJ');
const desktop=rt.elements.get('desktop-jump');assert(desktop?.events?.pointerdown?.length,'Desktop Jump button is bound');
rt.run("resetLeap();energy=1;leap.cooldown=0;state='playing';");desktop.events.pointerdown[0]({preventDefault(){}});assert(rt.run('leap.active'),'Clicking desktop Jump starts the jump');

for(const stage of [0,1,2,3]){
  rt.run("mode='story';stage="+stage+";loadStage();state='playing';globalThis.__v64={base:v64EnemyBaseCount,final:v64EnemyFinalCount,clones:enemies.filter(e=>e.v64Clone).length,total:enemies.filter(e=>e.hp>0).length};");
  const base=rt.run('__v64.base'),final=rt.run('__v64.final'),clones=rt.run('__v64.clones'),total=rt.run('__v64.total');
  assert(base>0,'Stage '+(stage+1)+' has a baseline enemy roster');
  assert.equal(final,base*2,'Stage '+(stage+1)+' roster doubles exactly');
  assert.equal(clones,base,'Stage '+(stage+1)+' inserts one spaced clone per original');
  assert.equal(total,base*2);
}
rt.run("mode='story';stage=3;loadStage();globalThis.__sharks=enemies.filter(isReefShark).length;globalThis.__eels=enemies.filter(isSparkEel).length;");
assert.equal(rt.run('__sharks'),12,'Stage 4 hunt pack doubles from six to twelve sharks');
assert(rt.run('__eels')>=6,'Stage 4 electric-eel encounters are doubled too');

console.log('6.4 passed: PC J/Shift/click Jump parity, visible jump states, exact 2x story rosters, 12 Stage 4 sharks and upgraded eel/enemy systems.');
