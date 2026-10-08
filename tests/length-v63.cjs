'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
const html=fs.readFileSync('dist/index.html','utf8'),spark=fs.readFileSync('dist/spark-eel.js','utf8'),highland=fs.readFileSync('dist/highland.js','utf8'),polish=fs.readFileSync('dist/polish.js','utf8');
assert.match(html,/(?:6\.\d+|[78]\.\d+) · /);
assert.match(spark,/STORY_LENGTHS=\{1:33150,2:37050,3:41600\}/);
assert.match(highland,/HIGHLAND_LENGTH=29640/);
assert.match(highland,/coinSpacing:1092/);
assert.match(polish,/spacing=4200/);

function stageSnapshot(stage,mode='story'){
  rt.run("mode='"+mode+"';stage="+stage+";loadStage();state='playing';dialogueSeen=new Set(Object.keys(conversations));globalThis.__lengthSnap={W,count:currentStage().count,spacing:currentStage().coinSpacing,pads:[...launchPads.map(p=>p.x)],enemyXs:enemies.filter(e=>e.hp>0).map(e=>e.x).sort((a,b)=>a-b),obstacleXs:obstacles.map(o=>o.x).sort((a,b)=>a-b),bossX:boss?.x||0};");
  return JSON.parse(rt.run("JSON.stringify(__lengthSnap)"));
}
function maxDensity(xs,width=1500){let max=0,j=0;for(let i=0;i<xs.length;i++){while(xs[i]-xs[j]>width)j++;max=Math.max(max,i-j+1);}return max;}

let d=stageSnapshot(0,'sarah');
assert.equal(d.W,29640);assert.equal(d.count,144);assert.equal(d.spacing,1092);assert.equal(d.bossX,29250);
assert(maxDensity(d.enemyXs)<=8,'Highland encounters remain spread despite the doubled roster');
assert(d.obstacleXs.at(-1)>26650);

d=stageSnapshot(1);
assert.equal(d.W,33150);assert.equal(d.count,96);assert.equal(d.spacing,1614);assert.equal(d.bossX,30533);
assert(maxDensity(d.enemyXs)<=8,'Stage 2 doubled roster remains readable');
assert(d.pads.at(-1)===30707);assert(d.obstacleXs.at(-1)>26000);

d=stageSnapshot(2);
assert.equal(d.W,37050);assert.equal(d.count,108);assert.equal(d.spacing,1682);assert.equal(d.bossX,34125);
assert(maxDensity(d.enemyXs)<=8,'Pearl Palace doubled roster remains readable');
assert(rt.run('palaceArenaCenter()')===34125);

d=stageSnapshot(3);
assert.equal(d.W,41600);assert.equal(d.count,120);assert.equal(d.spacing,1724);
assert.equal(rt.run('ranaArenaRight()'),39629);assert(maxDensity(d.enemyXs)<=8,'Stage 4 doubled predator density stays readable');
assert.equal(rt.run('enemies.filter(isReefShark).length'),12);

d=stageSnapshot(-1);
assert.equal(d.W,7600,'Tutorial remains compact');
d=stageSnapshot(1,'trial');
assert.equal(d.W,3800,'60-second trial remains compact');
assert.equal(d.count,48);

rt.run("mode='story';stage=1;");assert.equal(rt.run('storyStretchX(7000)'),30533);
assert.equal(rt.run('highlandRouteX(14600)'),29250);
console.log('6.3 Length Update passed: sequential 29.64k/33.15k/37.05k/41.6k story routes, unchanged compact modes and doubled but still spaced encounters.');
