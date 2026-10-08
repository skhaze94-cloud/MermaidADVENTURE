'use strict';
const assert=require('node:assert/strict'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
const routes=[];
for(const [name,chapter,extra]of [['highland',0,''],['jungle',1,''],['palace',2,''],['rana',3,''],['shadow',0,'setupShadowCrabKingdom();'],['tunnel',1,'setupDarkTunnelChapter();']]){
 rt.run(`mode='sarah';V70.shadow.active=false;V71.tunnel.active=false;stage=${chapter};loadStage();state='playing';${extra}`);
 const d=JSON.parse(rt.run(`JSON.stringify({W,line:waterSurface(),bossX:boss.x,checkpoint,solids:obstacles,powerups,sky:obstacles.filter(o=>o.worldSky86)})`));assert(d.sky.length>=4,name+' sky route');
 for(const o of d.sky){assert(o.y+o.h+39<d.line+25,'Underwater lane remains clear');assert(Math.abs(o.x-d.bossX)>=850,'Arena remains clear');assert(o.x+o.w<d.W-850,'Portal approach remains clear');}
 for(const p of d.powerups.filter(p=>p.sky))assert(!d.sky.some(o=>p.x+58>o.x&&p.x-58<o.x+o.w&&p.y+39>o.y&&p.y-39<o.y+o.h),name+' gift has clearance');
 // Connected swim route to the arena and portal using the actual Sarah envelope.
 const step=30,minX=100,minY=d.line+45,maxY=840,cols=Math.floor((d.W-200)/step)+1,rows=Math.floor((maxY-minY)/step)+1,seen=new Set(),queue=[[4,Math.round((540-minY)/step)]];
 const clear=(x,y)=>!d.solids.some(o=>x+58>o.x&&x-58<o.x+o.w&&y+39>o.y&&y-39<o.y+o.h);
 for(let head=0;head<queue.length;head++){const [i,j]=queue[head],key=i*rows+j;if(i<0||i>=cols||j<0||j>=rows||seen.has(key)||!clear(minX+i*step,minY+j*step))continue;seen.add(key);queue.push([i+1,j],[i-1,j],[i,j+1],[i,j-1]);}
 for(const target of [d.bossX-450,d.W-190,d.checkpoint])assert([...seen].some(k=>Math.abs(minX+Math.floor(k/rows)*step-target)<60),name+' route reaches '+target);
 rt.run(`{const o86=world86CollisionRects(obstacles.find(o=>o.worldSky86))[0];leap={active:true,breached:true,variant:'standard'};health=5;nessie.x=o86.x+10;nessie.y=o86.y+o86.h/2;nessie.vx=600;resolveWorldSky86(o86.x-70,nessie.y);assert.equal(nessie.x,o86.x-58);assert.equal(nessie.vx,0);assert.equal(health,5);assert(leap.active);
 const bottom86=world86CollisionRects(obstacles.find(o=>o.worldSky86)).at(-1);nessie.x=bottom86.x+bottom86.w/2;nessie.y=bottom86.y+bottom86.h+25;nessie.vy=-500;resolveWorldSky86(nessie.x,bottom86.y+bottom86.h+45);assert.equal(nessie.y,bottom86.y+bottom86.h+39);assert(nessie.vy>=40);
 nessie.y=o86.y-20;nessie.vy=500;resolveWorldSky86(nessie.x,o86.y-45);assert.equal(nessie.y,o86.y-39);assert.equal(nessie.vy,0);assert(leap.skimming);
 const world86Before=JSON.stringify({obstacles,powerups});setupWorldSky86();assert.equal(JSON.stringify({obstacles,powerups}),world86Before,'Route installation is idempotent');}`);
 rt.run(`{const sky=obstacles.find(o=>o.worldSky86);nessie.x=sky.x-350;nessie.y=waterSurface()+25;nessie.vx=0;nessie.vy=0;nessie.face=1;energy=1;boostUnlimited=0;heartJumpTime=0;bossLeapReady=false;resetLeap();resetSplashChain();keys.clear();keys.add('ArrowRight');assert(requestJump());let landed=false;for(let i=0;i<240;i++){updateSwimmer(1/120,1,0);if(leap.skimming)landed=true;if(!leap.active)break;}assert(landed,'Ordinary jump can land on the sky route');assert.equal(health,5);}`);
 routes.push({name,sky:d.sky.length,visited:seen.size});
}
rt.run(`mode='trial';V70.shadow.active=false;V71.tunnel.active=false;stage=1;loadStage();assert.equal(coins.filter(c=>c.type==='coin').length,currentStage().count);assert(obstacles.some(o=>o.worldSky86));
 mode='sarah';stage=2;loadStage();state='playing';camera=0;palace.projection={x:2350,y:480,life:4};const enter86=palaceCameoPose86(palace.projection);assert(enter86.x>=vw+170);palace.projection.life=2;const hold86=palaceCameoPose86(palace.projection);assert.equal(hold86.x,2350);palace.projection.life=0;assert(palaceCameoPose86(palace.projection).x>=vw+170);
 palace.projection.life=2;const original86=drawRoyalCharacter;let alpha86;drawRoyalCharacter=()=>{alpha86=ctx.globalAlpha};ctx.globalAlpha=.2;drawPalaceCameo86(2);assert.equal(alpha86,1,'Antonella is fully opaque');drawRoyalCharacter=original86;
 const before86=JSON.stringify({boss,queen,nessie,health,energy});drawWorldSolid86(obstacles[0],100,2);assert.equal(JSON.stringify({boss,queen,nessie,health,energy}),before86,'Rendering cannot change gameplay');
 stage=-1;loadStage();assert.equal(obstacles.filter(o=>o.tutorialSky).length,3);assert(!obstacles.some(o=>o.worldSky86),'8.5 tutorial retained');`);
console.log('8.6 passed: six themed chapters, full-size route connectivity, gifts, safe four-sided sky collision, trial counts, idempotent setup, solid Antonella entrance/exit and tutorial isolation.',routes);
