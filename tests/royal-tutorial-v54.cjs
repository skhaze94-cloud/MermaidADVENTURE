'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
const family=fs.readFileSync('dist/family.js','utf8'),tutorial=fs.readFileSync('dist/tutorial.js','utf8'),tutorialTwo=fs.readFileSync('dist/tutorial-two.js','utf8'),bossV4=fs.readFileSync('dist/boss-v4.js','utf8'),title=fs.readFileSync('dist/title.css','utf8'),html=fs.readFileSync('dist/index.html','utf8');
assert.match(title,/\.opening-logo\{/);assert.match(title,/logo-return/);assert.match(html,/\d+\.\d+ · /);
for(const name of ['Professor Puff','Sir Wobble','Noodle'])assert(family.includes(name));
for(const move of ['THUNDER TEAPOT','TRIPLE TICKLE BOLT','THE CLOUD OF MILD CONCERN','ROYAL WOBBLE WAVE','DAD DASH','BUBBLE BEARD BLAST','GREEN GLOW · BOOST NOW'])assert(family.includes(move));
assert.match(bossV4,/daddash/i);assert.match(bossV4,/bubbleBurst/);assert.match(tutorialTwo,/queenReact/);assert.match(tutorialTwo,/bloomCharge/);assert.match(tutorial,/practice creature/i);
rt.run(`
mode='sarah';stage=-1;loadStage();state='playing';training.step=6;training.entryDone=true;dialogueSeen=new Set(Object.keys(conversations));
assert.equal(training.practiceEnemies.length,3);
for(const e of training.practiceEnemies){nessie.x=e.x;nessie.y=e.y;dashTime=.2;updateTrainingBoss(.016);}
assert(training.practiceCleared);assert.equal(training.practiceHits,3);
boss.active=true;training.bossEntry=2;training.practiceCleared=true;boss.x=6900;boss.y=550;nessie.x=6200;nessie.y=450;invincible=1000;
const phases=[[0,'THUNDER TEAPOT'],[1.7,'TRIPLE TICKLE BOLT'],[3,'THE CLOUD OF MILD CONCERN'],[4.4,'ROYAL WOBBLE WAVE'],[6,'DAD DASH'],[7.3,'BUBBLE BEARD BLAST'],[9,'GREEN GLOW · BOOST NOW']];
for(const [phase,name] of phases){boss.clock=phase;boss.shot=0;training.bubbleBurst=false;updateTrainingBoss(.001);assert.equal(training.move,name);}
`);
console.log('5.4 royal tutorial passed: logo, practice enemies, Antonella reactions and all named King Daddy move phases are present.');
