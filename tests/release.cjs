const assert=require('assert/strict'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`
for(const chapter of [0,1]){
 mode='sarah';stage=chapter;loadStage();state='playing';dialogueSeen=new Set(Object.keys(conversations));dialogueSeen.delete(chapter===0?'carlo-win':'miguel-win');enemies=[];obstacles=[];nessie.x=2900;nessie.y=400;boss.active=true;bossAnnounced=true;invincible=1000;
 const hp=chapter===0?3:4;assert.equal(boss.hp,hp);
 for(let hit=0;hit<hp;hit++){nessie.x=2900;nessie.y=400;for(let i=0;i<800&&!boss.vulnerable;i++)updateStory(1/60);assert(boss.vulnerable);nessie.x=boss.x;nessie.y=boss.y;boss.hitCooldown=0;dashTime=.3;updateStory(.016);assert.equal(boss.hp,hp-hit-1);assert(bossLeapReady);}
 assert.equal(state,'playing','Defeat animation is not hidden by dialogue');assert(!familyPortalOpen());nessie.x=2900;nessie.y=400;for(let i=0;i<160;i++)update(1/60);assert.equal(state,'dialogue');finishDialogue();nessie.x=3630;nessie.y=540;updateStory(.016);assert.equal(state,'portal');updatePortal(7.1);assert.equal(stage,chapter+1);
}
// Every world runs with bounded effects and finite movement; nearby enemies telegraph then fire.
for(const chapter of [-1,0,1,2,3]){mode='story';stage=chapter;loadStage();state='playing';dialogueSeen=new Set(Object.keys(conversations));nessie.x=chapter===-1?900:2000;nessie.y=550;invincible=10000;for(let i=0;i<900;i++){update(1/60);assert(Number.isFinite(nessie.x+nessie.y));assert(projectiles.length<=64);assert(particles.length<=280);for(const e of enemies)assert(Number.isFinite(e.x+e.y));}pause();const before=nessie.x;update(.1);assert.equal(nessie.x,before);resume();assert.equal(state,'playing');}
mode='story';stage=0;loadStage();state='playing';nessie.x=950;nessie.y=650;invincible=1000;enemies[0].cooldown=0;updateStory(.016);assert(enemies[0].windup>0);assert.equal(projectiles.length,0);for(let i=0;i<45;i++)updateStory(1/60);assert(projectiles.length>0);assert(enemies[0].cooldown>1);
console.log('Release checks passed: Carlo and Miguel complete fights, visible defeats, dialogues, portals, five-world simulation, pause/resume, enemy warnings, projectile limits and finite motion.');
`);
