'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
const spark=fs.readFileSync('dist/spark-eel.js','utf8'),html=fs.readFileSync('dist/index.html','utf8');
for(const state of ['idle','notice','coil','charge','lunge-coil','lunge','recover','stunned'])assert(spark.includes("'"+state+"'"));
for(const label of ['spark-eel','storm-eel','BOOST DISRUPTED'])assert(spark.includes(label));
assert.match(html,/spark-eel\.js/);assert.match(html,/\d+\.\d+ · /);
rt.run(`
mode='story';stage=1;loadStage();state='playing';dialogueSeen=new Set(Object.keys(conversations));
assert.equal(W,51000);assert.equal(currentStage().count,96);assert.equal(boss.x,storyStretchX(7000));assert(enemies.filter(isSparkEel).length>=5);assert(enemies.some(e=>e.kind==='storm-eel'));assert(obstacles.some(o=>o.x>40000));
const standard=enemies.find(e=>e.kind==='spark-eel');nessie.x=standard.x-300;nessie.y=standard.y;standard.cooldown=0;for(let i=0;i<35;i++)updateSparkEels(1/60);assert(['notice','coil','charge','lunge-coil','lunge','recover'].includes(standard.sparkState));
mode='trial';stage=1;loadStage();assert.equal(W,3800);assert.equal(currentStage().count,48);
mode='story';stage=2;loadStage();state='playing';assert.equal(W,57000);assert.equal(currentStage().count,108);queen.victoryReady=true;setupPalaceExitCorridor();assert(enemies.some(e=>e.kind==='storm-eel'&&e.x>40000));assert(obstacles.some(o=>o.x>45000));assert(checkpoint>=storyStretchX(3900));
mode='story';stage=3;loadStage();state='playing';assert.equal(W,64000);assert.equal(currentStage().count,120);assert(enemies.filter(isSparkEel).length>=3);assert.equal(enemies.filter(isReefShark).length,6);assert.equal(obstacles.filter(o=>o.huntArena).length,3);rana.victoryReady=true;setupRanaExitCorridor();assert(checkpoint>=storyStretchX(3900));
const elite=enemies.find(e=>e.kind==='storm-eel');assert.equal(elite.maxHp,2);nessie.x=elite.x;nessie.y=elite.y;energy=1;dashCooldown=0;invincible=0;dashTime=0;updateSparkEels(.016);assert(energy<1);assert(dashCooldown>0);
`);
console.log('5.5/6.1 Spark Eel regression passed: electric state machine, elite durability, boost disruption and doubled stages coexist with the live Stage 4 shark hunt.');
