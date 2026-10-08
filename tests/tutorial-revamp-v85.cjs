'use strict';
const assert=require('node:assert/strict'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`mode='sarah';stage=-1;loadStage();state='playing';
assert.equal(obstacles.filter(o=>o.tutorialSky).length,3);
// The actual swimmer's collision envelope fits through the entire swim route.
const cell=20,lo=waterSurface()+45,hi=850,seen=new Set(),todo=[[220,550]];
function clear85(x,y){return x>=100&&x<=7480&&y>=lo&&y<=hi&&!obstacles.some(o=>x+58>o.x&&x-58<o.x+o.w&&y+39>o.y&&y-39<o.y+o.h);}
while(todo.length){const [x,y]=todo.pop(),key=x+','+y;if(seen.has(key)||!clear85(x,y))continue;seen.add(key);for(const [dx,dy]of [[cell,0],[-cell,0],[0,cell],[0,-cell]])todo.push([x+dx,y+dy]);}
for(const [x,y]of [[650,720],[1490,540],[2450,760],[3910,500],[4540,550],[5660,490],[5860,435],[6120,500],[6300,690],[6480,470],[6900,550],[7400,550]])assert([...seen].some(k=>{const [sx,sy]=k.split(',').map(Number);return Math.hypot(x-sx,y-sy)<50;}),'Swimmer can reach '+x+','+y);
const rock=obstacles.find(o=>o.trainingRock);nessie.x=rock.x+5;nessie.y=rock.y+100;nessie.vx=250;resolvePlatforms(rock.x-70,nessie.y);assert.equal(nessie.x,rock.x-58,'Reef actually blocks swimming');assert.equal(nessie.vx,0);
const sky=obstacles.find(o=>o.tutorialSky);leap={active:true,breached:true,variant:'standard'};nessie.x=sky.x+5;nessie.y=sky.y+40;nessie.vx=440;resolveTutorialSky85(sky.x-70,nessie.y);assert.equal(nessie.x,sky.x-58);assert.equal(nessie.vx,0);assert(training.skyLessonSeen);assert(leap.active,'A safe sky bonk does not cancel flight');
// Lessons have both a breathing interval and a spatial approach gate.
resetLeap();dashTime=0;nessie.x=3000;trainingAdvance(1,'Lovely!');assert.equal(state,'playing');assert(training.pendingLesson);for(let i=0;i<180;i++)updateTraining(1/60);assert.equal(state,'playing','Elapsed time alone cannot open distant dialogue');nessie.x=3300;updateTraining(1/60);assert.equal(state,'dialogue');assert.equal(activeDialogueId,'daddy-rock');assert.equal(training.pendingLesson,null);finishDialogue();
trainingAdvance(2);nessie.x=3940;updateTraining(.016);assert.equal(state,'playing','Finishing the rock cannot immediately open the next bubble');for(let i=0;i<150;i++)updateTraining(1/60);assert.equal(activeDialogueId,'daddy-boost');finishDialogue();
resetTutorial85();nessie.x=900;camera=0;let h;for(let i=1;i<=60;i++)h=tutorialHeadPose85('teach',{head:0},i/60,500);assert(h.look>.8);const right=h.look;nessie.x=100;h=tutorialHeadPose85('teach',{head:0},61/60,500);assert(Math.abs(h.look-right)<.15,'Neck turns without snapping');for(let i=62;i<=125;i++)h=tutorialHeadPose85('teach',{head:0},i/60,500);assert(h.look<-.8);state='paused';const before=JSON.stringify(TUTORIAL85_HEAD);tutorialHeadPose85('arrival',{head:0},4,500);assert.equal(JSON.stringify(TUTORIAL85_HEAD),before,'Paused facial movement freezes');state='playing';
const world=JSON.stringify({hero:nessie,training,health,energy,score,obstacles});drawTutorialDaddyRig85('teach',{kick:0,reach:0,lift:.6,bend:.2,staff:0,energy:0,head:0},3,500);drawTutorialSolid85(rock,100,3);assert.equal(JSON.stringify({hero:nessie,training,health,energy,score,obstacles}),world,'Artwork never changes gameplay');
stage=0;const x=nessie.x;resolveTutorialSky85(x-100,nessie.y);assert.equal(nessie.x,x);assert.equal(drawTutorialSolid85(rock,0,0),false,'New solids stay in the tutorial');
`);
const quiet=require('./runtime.cjs')(false,[],{reducedMotion:true});quiet.run(`mode='sarah';stage=-1;loadStage();state='playing';`);const h=JSON.parse(quiet.run(`JSON.stringify(tutorialHeadPose85('teach',{head:.1},2,500))`));assert.equal(h.look,0);assert.equal(h.angle,0);assert.equal(h.jaw,0);
console.log('8.5 tutorial: full-size connected swim route, solid reef/sky collisions, safe flight, spatial dialogue pacing, smooth neck tracking, pause, reduced motion and chapter isolation passed.');
