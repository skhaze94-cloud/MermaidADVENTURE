'use strict';
// The extended first story chapter is isolated from the tutorial and timed modes.
const HIGHLAND_LENGTH=45600,HIGHLAND_ROUTE_START=4060,HIGHLAND_SOURCE_BOSS_X=14600,HIGHLAND_BOSS_X=45000,HIGHLAND_BOSS_TRIGGER=44320;
const HIGHLAND_ROUTE_SCALE=(HIGHLAND_BOSS_X-HIGHLAND_ROUTE_START)/(HIGHLAND_SOURCE_BOSS_X-HIGHLAND_ROUTE_START);
function highlandRouteX(x){return x<=HIGHLAND_ROUTE_START?x:Math.round(HIGHLAND_ROUTE_START+(x-HIGHLAND_ROUTE_START)*HIGHLAND_ROUTE_SCALE);}
const HIGHLAND_STORY={...STAGES[0],count:144,coinSpacing:1680,pads:[540,1450,2520,...[4400,5300,6230,6900,7820,8840,9860,10880,11900,12920,13840,14520].map(highlandRouteX)],depth:'THE WHISPERING DEPTHS'};
const HIGHLAND_ROUTE_ZONES=[
 {name:'Secret Grotto',start:HIGHLAND_ROUTE_START,end:highlandRouteX(6900),tint:'#234f7750'},
 {name:'Kelp Cathedral',start:highlandRouteX(6900),end:highlandRouteX(9300),tint:'#176a6450'},
 {name:'Ancient Shell Ruins',start:highlandRouteX(9300),end:highlandRouteX(11700),tint:'#4c4e8150'},
 {name:'Open Loch Gardens',start:highlandRouteX(11700),end:highlandRouteX(13800),tint:'#236f8050'},
 {name:'Carlo’s Court',start:highlandRouteX(13800),end:HIGHLAND_LENGTH,tint:'#7a583850'}
];
const FALL_DURATION=17,FALL_ENTRY=1.8,FALL_EXIT=1.6;
let highland=null,highlandCaptionKey='';
function isExpandedHighland(){return stage===0&&mode!=='trial';}
function setupHighland(){highland={fall:null,fallen:false,speech:null,clock:0,exitGlow:0,grottoSeen:false,zone:-1};boss.x=HIGHLAND_BOSS_X;const hx=highlandRouteX;
 obstacles.push(
  {x:hx(4350),y:280,w:185,h:235},{x:hx(4750),y:710,w:240,h:185},{x:hx(5280),y:280,w:170,h:265},{x:hx(5720),y:685,w:190,h:210},{x:hx(6170),y:280,w:180,h:250},
  {x:hx(7350),y:280,w:190,h:245},{x:hx(7800),y:700,w:230,h:190},{x:hx(8260),y:280,w:170,h:270},{x:hx(8700),y:690,w:210,h:205},
  {x:hx(9180),y:280,w:190,h:245},{x:hx(9640),y:705,w:230,h:185},{x:hx(10120),y:280,w:170,h:260},{x:hx(10570),y:680,w:205,h:215},
  {x:hx(11100),y:280,w:185,h:250},{x:hx(11610),y:700,w:230,h:190},{x:hx(12170),y:280,w:180,h:260},{x:hx(12700),y:690,w:215,h:205},
  {x:hx(13260),y:280,w:190,h:245},{x:hx(13750),y:705,w:210,h:185}
 );
 enemies=enemies.filter(e=>e.x<2750);
 // Preserve the opening cast without keeping the old five-enemy pile-up before the waterfall.
 const opening=enemies.filter(e=>!e.scuttle);
 const openingLayout=[760,1660,2580,highlandRouteX(7000),highlandRouteX(11150)];
 for(let i=0;i<opening.length&&i<openingLayout.length;i++){opening[i].x=opening[i].bx=openingLayout[i];opening[i].y=opening[i].by=i%2?440:760;}
 const swimmers=[
  [4450,'jelly',440],[5190,'puffer',610],[5930,'jelly',440],[6470,'puffer',610],
  [7480,'eel',460],[8160,'swordfish',660],[8840,'jelly',430],[9520,'puffer',650],
  [10220,'eel',470],[10900,'swordfish',650],[11600,'jelly',430],[12320,'puffer',650],
  [13040,'eel',470],[13620,'swordfish',620]
 ];
 for(const [i,[sourceX,kind,y]] of swimmers.entries()){const x=hx(sourceX);enemies.push({kind,x,y,bx:x,by:y,hp:1,cooldown:1.8+(i%4)*.28,phase:i,clock:i*.4});}
 const crabXs=[1680,2590,4570,5580,6280,7520,8420,9340,10280,11220,12180,13120,13880];
 for(const [i,sourceX] of crabXs.entries()){const x=hx(sourceX);enemies.push({kind:'pearl-crab',scuttle:true,x,y:832,bx:x,min:x-170,max:x+170,dir:i%2?1:-1,clock:i,hp:1,cooldown:99,phase:i});}
 // Treasure in the hidden waterfall is earned separately; no coins are stranded in the shaft.
 coins=coins.filter(c=>c.x<2900||c.x>4050);
 for(const [i,sourceX] of [4660,5620,6370,7750,9140,10540,11920,13280,14120].entries()){const x=hx(sourceX);coins.push({x,y:845,bx:x,by:845,type:'chest',taken:false,phase:i*.7});}
 powerups=powerups.filter(p=>p.x<2900);
 const routePowerups=[[4190,600,'heart'],[4900,450,'boost'],[5560,550,'heart'],[6280,650,'heart'],[6750,520,'boost'],[7920,470,'heart'],[9020,610,'boost'],[10380,500,'heart'],[11520,620,'boost'],[12620,500,'heart'],[13680,610,'boost'],[14320,520,'heart']];
 for(const [i,[sourceX,y,type]] of routePowerups.entries())powerups.push({x:hx(sourceX),y,type,phase:i,taken:false});
}
function highlandSay(text,life=4){if(highland)highland.speech={text,life};}
function updateHighland(dt){highland.clock+=dt;highland.exitGlow=Math.max(0,highland.exitGlow-dt);if(highland.speech){highland.speech.life-=dt;if(highland.speech.life<=0)highland.speech=null;}
 for(const e of enemies){if(!e.scuttle||e.hp<=0)continue;e.clock+=dt*2.7;const cycle=(highland.clock+e.phase*.55)%2.8,scamper=cycle>.55&&cycle<2.25;e.vx=scamper?e.dir*275:e.dir*35;e.x+=e.vx*dt;if(e.x<e.min||e.x>e.max){e.x=clamp(e.x,e.min,e.max);e.dir*=-1;}e.facing=-e.dir;e.y=832+Math.sin(e.clock*6)*2;}
 if(!highland.fallen){if(nessie.x>2800&&checkpoint<2700){checkpoint=2770;highlandSay('That current is getting stronger…',3);}if(nessie.x>3330&&leap.active){nessie.x=3330;nessie.vx=Math.min(0,nessie.vx);}if(nessie.x>3010&&!leap.active){beginHighlandFall();return true;}}
 if(highland.fallen&&nessie.x<4060){nessie.x=4060;nessie.vx=Math.max(0,nessie.vx);}
 if(highland.fallen){
  const zone=HIGHLAND_ROUTE_ZONES.findIndex(z=>nessie.x>=z.start&&nessie.x<z.end);
  if(zone!==highland.zone){highland.zone=zone;if(zone>0)highlandSay(['','The kelp is moving like a cathedral curtain…','Ancient shell ruins! Carlo has expensive taste.','Back into the open loch. So many little creatures!','That must be Carlo’s court up ahead.'][zone],3.6);}
  if(nessie.x>highlandRouteX(6500)&&checkpoint<highlandRouteX(6400)){checkpoint=highlandRouteX(6500);health=5;flash('Checkpoint · Secret grotto');}
  if(nessie.x>highlandRouteX(9050)&&checkpoint<highlandRouteX(9000)){checkpoint=highlandRouteX(9100);health=5;flash('Checkpoint · Kelp cathedral');}
  if(nessie.x>highlandRouteX(11700)&&checkpoint<highlandRouteX(11600)){checkpoint=highlandRouteX(11750);health=5;flash('Checkpoint · Shell ruins');}
  if(nessie.x>highlandRouteX(13720)&&checkpoint<highlandRouteX(13600)){checkpoint=highlandRouteX(13750);health=5;flash('Checkpoint · Carlo’s court');}
 }
 return false;
}
function beginHighlandFall(){if(highland.fall||highland.fallen)return;resetLeap();projectiles=[];dashTime=0;checkpoint=2770;highland.fall={phase:'pull',time:0,travel:0,fromX:nessie.x,fromY:nessie.y,fromBank:heroBank,x:0,vx:0,current:0,boost:0,hit:0,depth:0,
 hazards:Array.from({length:12},(_,i)=>({at:2.3+i*1.17,x:[-.56,.5,-.45,.57,0,-.55][i%6],kind:['reef','jelly','puffer'][i%3],r:i%3===0?.26:.18})),
 currents:[{at:4,x:-.28,dir:1},{at:7.6,x:.28,dir:-1},{at:11.2,x:-.24,dir:1},{at:14.4,x:.25,dir:-1}],
 gold:Array.from({length:22},(_,i)=>({at:1.3+i*.68,x:Math.sin(i*.85)*.48,taken:false}))};highlandSay('Oh no… what’s going on? The water is pulling me down!',4);tone(180,.3,.04);}
function waterfallCurrent(f){return f.currents.reduce((force,w)=>force+w.dir*.58*Math.max(0,1-Math.abs(f.travel-w.at)/1.35)*Math.max(.25,1-Math.abs(f.x-w.x)/1.4),0);}
function waterfallPose(f,t){const u=smoothUnit(clamp(f.time/(f.phase==='pull'?FALL_ENTRY:FALL_EXIT),0,1)),fx=vw/2+f.x*Math.min(vw*.4,520),fy=H*.4,bank=.32+clamp(f.vx*.12,-.3,.3),normalY=nessie.y+(reducedMotion?0:Math.sin(t*3)*3);
 if(f.phase==='pull')return {x:(nessie.x-camera)*(1-u)+fx*u,y:normalY*(1-u)+fy*u,bank:f.fromBank*(1-u)+bank*u,mix:u};
 if(f.phase==='outflow')return {x:fx*(1-u)+(nessie.x-camera)*u,y:fy*(1-u)+normalY*u,bank:bank*(1-u),mix:1-u};
 return {x:fx,y:fy,bank,mix:1};}
function boostInWaterfall(){const f=highland?.fall;if(state!=='playing'||!f||f.phase!=='descent'||f.boost>0||(energy<.4&&boostUnlimited<=0))return;const d=(keys.has('ArrowRight')||keys.has('d')?1:0)-(keys.has('ArrowLeft')||keys.has('a')?1:0);if(!d)return;if(boostUnlimited<=0)energy-=.4;f.vx=d*2.7;f.boost=.3;tone(360,.12,.025);}
function waterfallHazardX(h,time){return h.x+(h.kind==='jelly'?Math.sin(time*2.3+h.at)*.15:h.kind==='puffer'?Math.sin(time*1.6+h.at)*.08:0);}
function updateHighlandFall(dt){const f=highland.fall;if(!f||state!=='playing')return;highland.clock+=dt;if(highland.speech){highland.speech.life-=dt;if(highland.speech.life<=0)highland.speech=null;}invincible=Math.max(0,invincible-dt);hitFlash=Math.max(0,hitFlash-dt);energy=Math.min(1,energy+dt*.23);boostUnlimited=Math.max(0,boostUnlimited-dt);swimTime+=dt*4;f.time+=dt;
 if(f.phase==='pull'){const u=smoothUnit(clamp(f.time/FALL_ENTRY,0,1));nessie.x=f.fromX+(3220-f.fromX)*u;nessie.y=f.fromY+(720-f.fromY)*u;f.depth=u*180;if(f.time>=FALL_ENTRY){f.phase='descent';f.time=0;nessie.y=520;highlandSay('Okay, tail… LEFT and RIGHT. We can do this!',3.4);}return;}
 if(f.phase==='outflow'){f.depth+=dt*160;heroBank=0;if(f.time>=FALL_EXIT){highland.fall=null;nessie.vx=150;nessie.vy=70;checkpoint=4120;invincible=Math.max(invincible,1.2);highlandSay('Phew! A secret grotto… and crabs with places to be!',4.5);}return;}
 f.travel=f.time;
 if(f.time>5&&!f.swirlIntroduced){f.swirlIntroduced=true;highlandSay('Swirly water! I can steer against it… or ride along!',3.8);}
 f.boost=Math.max(0,f.boost-dt);f.hit=Math.max(0,f.hit-dt);const dx=Number(keys.has('ArrowRight')||keys.has('d'))-Number(keys.has('ArrowLeft')||keys.has('a'));if(f.boost<=0)f.vx+=(dx*1.4+waterfallCurrent(f)-f.vx)*(1-Math.exp(-dt*9));f.x=clamp(f.x+f.vx*dt,-.87,.87);f.current=waterfallCurrent(f);f.depth=180+Math.min(FALL_DURATION,f.time)*350;nessie.y=520;
 for(const h of f.hazards){if(!h.passed&&f.time>h.at+.23){h.passed=true;continue;}if(!h.passed&&Math.abs(f.time-h.at)<.23&&Math.abs(f.x-waterfallHazardX(h,f.time))<h.r+.09){if(f.boost>0&&h.kind!=='reef'){h.passed=true;score+=50;tone(650,.08);}else if(invincible<=0){hurt(nessie.x+(waterfallHazardX(h,f.time)-f.x)*300);f.hit=.35;if(state!=='playing')return;}}}
 for(const c of f.gold)if(!c.taken&&Math.abs(f.time-c.at)<.24&&Math.abs(f.x-c.x)<.19){c.taken=true;score+=20;goldCount++;tone(800,.07,.02);}
 if(f.time>=FALL_DURATION){f.phase='outflow';f.time=0;highland.fallen=true;nessie.x=4120;nessie.y=610;nessie.vx=150;nessie.vy=70;nessie.face=1;heroBank=0;camera=clamp(nessie.x-vw*.43,0,W-vw);}

}
function resetHighlandRetry(){if(!highland)return;highland.fall=null;highland.fallen=checkpoint>=4000;highland.speech=null;highland.exitGlow=0;heroBank=0;for(const e of enemies)if(e.scuttle)e.hp=1;}
function drawHighlandRouteRichness(t){if(!highland?.fallen)return;const tick=reducedMotion?0:t;
 const zone=HIGHLAND_ROUTE_ZONES.find(z=>camera+vw*.5>=z.start&&camera+vw*.5<z.end)||HIGHLAND_ROUTE_ZONES.at(-1);ctx.save();ctx.globalAlpha=.36;ctx.fillStyle=zone.tint;ctx.fillRect(0,waterSurface(),vw,H-waterSurface());ctx.restore();
 for(let i=0,sourceX=4250;sourceX<HIGHLAND_SOURCE_BOSS_X-260;i++,sourceX+=470){const wx=highlandRouteX(sourceX),x=wx-camera;if(x<-360||x>vw+360)continue;const upper=i%4===0,ruin=i%6===3;
  ctx.save();ctx.globalAlpha=upper?.48:.68;if(ruin)envDraw(2,x-95,upper?340:650,190,upper?260:220,tick+i);else envDraw(i%3===0?1:4,x-105,upper?330:770,210,upper?310:130,tick+i,true);ctx.restore();
  if(i%3===1){const fy=500+((i*97)%280),kind=['seahorse','jelly','puffer','eel','swordfish'][i%5],drift=reducedMotion?0:Math.sin(tick*.7+i)*35;releaseCreature({kind,x:wx+drift,y:fy+Math.sin(tick*1.1+i)*22,size:14+(i%3)*2,dir:i%2?1:-1,clock:tick+i},tick,true);}
  if(i%5===2){const by=520+(i%4)*70;for(let j=0;j<5;j++)paintedBubble(x-45+j*20,by+Math.sin(tick*1.2+j+i)*20,4+j%3,.4);}
 }
 for(const [j,sourceX] of [7200,9450,11850,13720].entries()){const wx=highlandRouteX(sourceX),x=wx-camera;if(x<-520||x>vw+520)continue;ctx.save();ctx.globalAlpha=.4;if(rootArt.complete&&rootArt.naturalWidth){ctx.translate(x,waterSurface()+80);if(j%2)ctx.scale(-1,1);ctx.drawImage(rootArt,-240,-40,480,330);}ctx.restore();const glow=ctx.createRadialGradient(x,620,5,x,620,190);glow.addColorStop(0,['#8fffe526','#d9c3ff22','#ffe0a826','#91eaff26'][j]);glow.addColorStop(1,'#ffffff00');ctx.fillStyle=glow;ctx.fillRect(x-190,430,380,380);}
}
function drawHighlandWorld(t){if(!highland)return;const tick=reducedMotion?0:t;
 // The mouth is visible before the current catches Sarah.
 const x=3220-camera;if(x>-350&&x<vw+350&&!highland.fallen){ctx.save();const stream=ctx.createLinearGradient(x-155,0,x+155,0);stream.addColorStop(0,'#a3fff000');stream.addColorStop(.35,'#b0fff744');stream.addColorStop(.6,'#dbffff77');stream.addColorStop(1,'#8ee4ff00');ctx.fillStyle=stream;ctx.fillRect(x-155,330,310,610);ctx.strokeStyle='#d8ffef99';ctx.lineWidth=2;for(let i=0;i<15;i++){const y=345+(i*79+tick*160)%580,xx=x+Math.sin(i*1.7)*100;ctx.beginPath();ctx.moveTo(xx,y);ctx.quadraticCurveTo(xx+14,y+32,xx-6,y+70);ctx.stroke();}for(let i=0;i<9;i++){const yy=350+(i*83+tick*100)%560;paintedBubble(x+Math.sin(i*2.2)*120,yy,5+i%4,.7);}ctx.globalAlpha=.95;if(reefArt.complete){ctx.drawImage(reefArt,x-325,630,230,340);ctx.save();ctx.translate(x+325,630);ctx.scale(-1,1);ctx.drawImage(reefArt,0,0,230,340);ctx.restore();}ctx.restore();}
 if(highland.fallen){ctx.save();const tint=ctx.createLinearGradient(0,waterSurface(),0,H);tint.addColorStop(0,'#124f8433');tint.addColorStop(1,'#121e5945');ctx.fillStyle=tint;ctx.fillRect(0,waterSurface(),vw,H-waterSurface());for(let i=0;i<18;i++){const xx=highlandRouteX(4050+i*610)-camera;if(xx<-80||xx>vw+80)continue;const yy=760+Math.sin(i)*70;const glow=ctx.createRadialGradient(xx,yy,1,xx,yy,48);glow.addColorStop(0,'#9affe32a');glow.addColorStop(1,'#74aaff00');ctx.fillStyle=glow;ctx.fillRect(xx-48,yy-48,96,96);paintedBubble(xx,yy,4+Math.sin(tick+i),.55);}ctx.restore();drawHighlandRouteRichness(tick);}
 if(highland.exitGlow>0){ctx.save();ctx.fillStyle='rgba(173,246,237,'+(highland.exitGlow*.3)+')';ctx.fillRect(0,0,vw,H);ctx.restore();}
}
function drawHighlandFall(t){const f=highland.fall,tick=reducedMotion?0:t,cx=vw/2,half=Math.min(vw*.40,520),heroY=H*.40,pose=waterfallPose(f,t);ctx.save();ctx.globalAlpha=pose.mix;
 const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#17697d');bg.addColorStop(.5,'#073d5c');bg.addColorStop(1,'#09233f');ctx.fillStyle=bg;ctx.fillRect(0,0,vw,H);
 // Painted reef walls scroll at different depths around the downward current.
 for(let layer=0;layer<2;layer++){ctx.save();ctx.globalAlpha=pose.mix*(layer?.85:.32);const size=layer?440:590,scroll=f.depth*(layer?1:.42);for(let i=-1;i<4;i++){const yy=i*size-(scroll%size);if(reefArt.complete){ctx.drawImage(reefArt,cx-half-size*.72,yy,size*.95,size*1.2);ctx.save();ctx.translate(cx+half+size*.72,yy);ctx.scale(-1,1);ctx.drawImage(reefArt,0,0,size*.95,size*1.2);ctx.restore();}}ctx.restore();}
 const light=ctx.createLinearGradient(cx-half,0,cx+half,0);light.addColorStop(0,'#031c3800');light.addColorStop(.4,'#8bfff019');light.addColorStop(.55,'#9aeaff30');light.addColorStop(1,'#031c3800');ctx.fillStyle=light;ctx.fillRect(cx-half,0,half*2,H);
 for(let i=0;i<30;i++){const x=cx+Math.sin(i*6.2)*half*.93,y=((i*91-f.depth*.75)%(H+120)+H+120)%(H+120)-60;ctx.strokeStyle=i%3?'#bafaff2a':'#f0fff952';ctx.lineWidth=1+i%2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.sin(tick+i)*6,y+30+i%4*13);ctx.stroke();if(i%3===0)paintedBubble(x,y,3+i%5,.4);}
 for(const w of f.currents){const xx=cx+w.x*half,yy=heroY+(w.at-f.travel)*350;if(yy<-190||yy>H+190)continue;ctx.save();ctx.translate(xx,yy);const glow=ctx.createRadialGradient(0,0,12,0,0,190);glow.addColorStop(0,'#affff13a');glow.addColorStop(1,'#65efd900');ctx.fillStyle=glow;ctx.fillRect(-190,-190,380,380);ctx.scale(1,.58);for(let arm=0;arm<4;arm++){ctx.beginPath();for(let j=0;j<60;j++){const r=18+j*2.7,a=arm*Math.PI/2+j*.07+w.dir*tick*1.6,x=Math.cos(a)*r,y=Math.sin(a)*r;j?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.strokeStyle=arm%2?'#ddfffba0':'#6cdddf80';ctx.lineWidth=arm%2?2:5;ctx.stroke();}for(let j=0;j<9;j++){const a=j*.7+w.dir*tick*1.3,r=55+j*12;paintedBubble(Math.cos(a)*r,Math.sin(a)*r,4+j%3,.65);}ctx.restore();}
 for(const h of f.hazards){if(h.passed)continue;const xx=cx+waterfallHazardX(h,f.travel)*half,yy=heroY+(h.at-f.travel)*350;if(yy<-180||yy>H+200)continue;ctx.save();if(h.kind==='reef'){envDraw(0,xx-half*h.r-25,yy-90,half*h.r*2+50,185,tick);}else{releaseCreature({kind:h.kind,x:xx+camera,y:yy,clock:tick+h.at,facing:1},tick);}ctx.restore();if(yy>heroY+130){ctx.strokeStyle='#ffe4ab55';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(xx,yy,half*(h.r+.06),70,0,0,Math.PI*2);ctx.stroke();}}
 for(const c of f.gold){if(c.taken)continue;const xx=cx+c.x*half,yy=heroY+(c.at-f.travel)*350;if(yy<0||yy>H)continue;ctx.save();ctx.translate(xx,yy);ctx.fillStyle='#ffe19a';ctx.shadowColor='#f9dd83';ctx.shadowBlur=12;ctx.beginPath();ctx.ellipse(0,0,6+Math.abs(Math.cos(tick*3+c.at))*7,17,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff6c9';ctx.lineWidth=2;ctx.stroke();ctx.restore();}
 ctx.restore();
 // One character is carried through both transitions; the world never blanks.
 ctx.save();ctx.translate(pose.x,pose.y);ctx.rotate(pose.bank);if(f.hit>0)ctx.globalAlpha=.5+.5*Math.abs(Math.sin(tick*20));drawLivingHero(mode==='story'?sprite:sarahArt,230,154,reducedMotion?0:swimTime,Math.abs(f.vx),0);ctx.restore();if(f.boost>0){for(let i=1;i<6;i++)paintedBubble(pose.x-f.vx*i*12,pose.y-i*8,3+i,.4);}
 if(hitFlash>0){ctx.fillStyle='rgba(255,105,136,'+(hitFlash*.35)+')';ctx.fillRect(0,0,vw,H);}

}
function syncHighlandUi(){const active=isExpandedHighland()&&!!highland&&state==='playing',caption=$('highland-caption'),help=$('waterfall-help');caption.hidden=!active||!highland?.speech;help.hidden=!active||!highland?.fall;document.querySelector('.game-shell')?.classList.toggle('waterfall-active',active&&!!highland?.fall);
 if(active&&highland.speech&&highlandCaptionKey!==highland.speech.text){highlandCaptionKey=highland.speech.text;$('highland-speaker').textContent=mode==='story'?'Nessie':'Sarah Maria';$('highland-line').textContent=highland.speech.text;}if(active&&highland.fall)$('waterfall-progress').style.width=(highland.fall.phase==='descent'?highland.fall.time/FALL_DURATION*100:highland.fall.phase==='outflow'?100:0)+'%';}

function drawHighlandGrottoBackdrop(t){ctx.save();if(scene.complete&&scene.naturalWidth){const sy=scene.naturalHeight*.38;ctx.drawImage(scene,0,sy,scene.naturalWidth,scene.naturalHeight-sy,0,0,vw,H);}const shade=ctx.createLinearGradient(0,0,0,H);shade.addColorStop(0,'#06152ded');shade.addColorStop(.25,'#102a5177');shade.addColorStop(.55,'#23387522');shade.addColorStop(1,'#06264255');ctx.fillStyle=shade;ctx.fillRect(0,0,vw,H);for(let i=-1;i<Math.ceil(vw/380)+1;i++){const x=i*380-(camera*.14%380);ctx.save();ctx.translate(x+200,0);ctx.rotate(Math.PI);ctx.globalAlpha=.65;envDraw(0,-200,-190,400,290,t);ctx.restore();}ctx.restore();}
