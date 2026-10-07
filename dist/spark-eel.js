'use strict';
// 5.5 Spark Eel Expansion: electric eel enemy family + story-route expansion helpers.
const STORY_LENGTH_FACTOR=3,EXTENDED_STORY_LENGTH=22800;
function isExtendedStoryStage(){return mode!=='trial'&&stage>=1&&stage<=3;}
function storyStretchX(x){return isExtendedStoryStage()?Math.round(x*STORY_LENGTH_FACTOR):x;}
const expandedStoryMetaCache=new WeakMap();function expandedStoryMeta(meta){if(!isExtendedStoryStage())return meta;let cached=expandedStoryMetaCache.get(meta);if(!cached){const sourcePads=(stage===1||stage===2)?[...meta.pads,4200,5150,6100,7040]:meta.pads;cached={...meta,count:meta.count*2,coinSpacing:meta.coinSpacing*STORY_LENGTH_FACTOR,pads:sourcePads.map(storyStretchX)};expandedStoryMetaCache.set(meta,cached);}return cached;}
function storyWorldLength(){return isExtendedStoryStage()?EXTENDED_STORY_LENGTH:3800;}
function storyBossHomeX(){return stage===1&&isExtendedStoryStage()?storyStretchX(7000):3280;}
function storyBossTrigger(){return stage===1&&isExtendedStoryStage()?storyStretchX(6420):2730;}
function isSparkEel(e){return !!e&&(e.kind==='spark-eel'||e.kind==='storm-eel');}
function spawnSparkEel(x,y,elite=false,phase=0){const e={kind:elite?'storm-eel':'spark-eel',x,y,bx:x,by:y,hp:elite?2:1,maxHp:elite?2:1,elite,phase,clock:phase*.41,sparkState:'idle',sparkTime:phase*.17,sparkSeq:phase%2,cooldown:.4+phase*.08,facing:1,recoil:0,aimX:x-120,aimY:y,shot:false,stun:0};enemies.push(e);return e;}
function sparkBurst(x,y,elite=false,n=16){if(reducedMotion)return;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,v=(elite?150:105)*(.5+Math.random()*.65);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.35+Math.random()*.45,max:.8,color:i%2?'#70edff':'#ffe66f',r:1.5+Math.random()*2.8,bubble:i%4===0});}if(particles.length>280)particles.splice(0,particles.length-280);}
function sparkSetState(e,state){e.sparkState=state;e.sparkTime=0;e.shot=false;if(state==='coil'||state==='charge'){e.aimX=nessie.x;e.aimY=nessie.y;}if(state==='stunned'){e.stun=e.elite?1.05:1.25;e.recoil=1;sparkBurst(e.x,e.y,e.elite,e.elite?24:16);}}
function fireSparkDischarge(e){const aim=Math.atan2(e.aimY-e.y,e.aimX-e.x),spreads=e.elite?[-.2,0,.2]:[0];for(const spread of spreads){const a=aim+spread,speed=e.elite?300:255;projectiles.push({x:e.x-30*e.facing,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:4.2,age:0,type:'electric',variant:'straight',electricOwned:true,elite:e.elite,phase:e.phase,hitRadius:e.elite?30:26});}sparkBurst(e.x,e.y,e.elite,e.elite?22:13);tone(e.elite?160:210,.11,.025);}
function updateSparkEels(dt){if(mode==='trial'||isTraining())return;for(const e of enemies){if(!isSparkEel(e)||e.hp<=0)continue;const oldX=e.x,oldY=e.y;e.clock+=dt;e.sparkTime+=dt;e.recoil=Math.max(0,e.recoil-dt*3);e.cooldown=Math.max(0,e.cooldown-dt);e.facing=nessie.x<e.x?1:-1;const dist=Math.hypot(nessie.x-e.x,nessie.y-e.y),near=dist<(e.elite?720:600)&&!leap.breached;
  if(e.sparkState==='stunned'){e.x=e.bx+Math.sin(e.clock*9)*8;e.y=e.by+Math.sin(e.clock*13)*7;if(e.sparkTime>=e.stun)sparkSetState(e,'recover');}
  else if(e.sparkState==='idle'){e.x=e.bx+Math.sin(e.clock*.7+e.phase)*70;e.y=e.by+Math.sin(e.clock*1.15+e.phase)*28;if(near&&e.cooldown<=0)sparkSetState(e,'notice');}
  else if(e.sparkState==='notice'){e.y=e.by+Math.sin(e.clock*2)*12;if(e.sparkTime>.42)sparkSetState(e,(e.sparkSeq++%3===1)?'lunge-coil':'coil');}
  else if(e.sparkState==='coil'){if(e.sparkTime>.7)sparkSetState(e,'charge');}
  else if(e.sparkState==='charge'){if(e.sparkTime>.72){fireSparkDischarge(e);sparkSetState(e,'recover');e.cooldown=e.elite?1.15:1.6;}}
  else if(e.sparkState==='lunge-coil'){if(e.sparkTime>.58){const a=Math.atan2(e.aimY-e.y,e.aimX-e.x);e.lungeVX=Math.cos(a)*(e.elite?760:650);e.lungeVY=Math.sin(a)*(e.elite?760:650);sparkSetState(e,'lunge');}}
  else if(e.sparkState==='lunge'){e.x+=e.lungeVX*dt;e.y+=e.lungeVY*dt;e.lungeVX*=Math.exp(-dt*1.5);e.lungeVY*=Math.exp(-dt*1.5);if(e.sparkTime>.48){e.bx=e.x;e.by=e.y;sparkSetState(e,'recover');e.cooldown=e.elite?1.0:1.4;}}
  else if(e.sparkState==='recover'){e.x+=(e.bx-e.x)*(1-Math.exp(-dt*3));e.y+=(e.by-e.y)*(1-Math.exp(-dt*3));if(e.sparkTime>.7)sparkSetState(e,'idle');}
  resolveEnemyScenery(e,oldX,oldY);if(e.collided&&e.sparkState==='lunge')sparkSetState(e,'recover');
  if(Math.hypot(nessie.x-e.x,nessie.y-e.y)<(e.elite?88:72)){if(dashTime>0){e.hp--;score+=e.elite?300:180;dashTime=0;dashCooldown=.12;popups.push({x:e.x,y:e.y-80,text:e.hp>0?'STUNNED!':'ZAP EEL! +'+(e.elite?300:180),life:1,color:e.elite?'#ffe37f':'#8ff6ff'});sparkSetState(e,'stunned');if(e.hp<=0){sparkBurst(e.x,e.y,e.elite,e.elite?34:24);tone(480,.13,.03);}}else if(invincible<=0){energy=Math.max(0,energy-(e.elite ? .28 : .18));dashCooldown=Math.max(dashCooldown,e.elite?1.05:.75);popups.push({x:nessie.x,y:nessie.y-75,text:'⚡ BOOST DISRUPTED',life:.8,color:'#8cefff'});hurt(e.x);}}
 }
}
function drawSparkEel(e,t,small=false){if(!creatureArt?.complete||!creatureArt.naturalWidth)return false;const x=e.x-camera,y=e.y;if(x<-190||x>vw+190)return true;const tick=reducedMotion?0:(e.clock||t),elite=e.kind==='storm-eel',state=e.sparkState||'idle',crop=CREATURE_CROPS[4],w=small?e.size*3.6:(elite?205:158),h=small?w*.58:(elite?118:91),face=small?(e.dir===1?-1:1):(e.facing||1),charge=['coil','charge','lunge-coil'].includes(state)?clamp(e.sparkTime/(state==='charge'?.72:.7),0,1):0,stunned=state==='stunned';
 ctx.save();ctx.translate(x,y);ctx.scale(face,1);const coil=state==='coil'||state==='lunge-coil'?Math.sin(clamp(e.sparkTime/.7,0,1)*Math.PI)*.18:0;ctx.rotate(Math.sin(tick*1.7)*.025+coil*(face>0?-1:1));if(elite)ctx.scale(1.06,1.06);ctx.shadowColor=elite?'#ffd84f':'#57ddff';ctx.shadowBlur=(elite?18:12)*(charge+.2);
 warpedSprite(creatureArt,crop,w,h,(u,v)=>{const tail=Math.pow(u,1.6),pulse=stunned?Math.sin(tick*18)*3:0,amp=(state==='lunge'?17:state==='coil'||state==='lunge-coil'?22:10)+(elite?3:0),dy=Math.sin(tick*(state==='lunge'?9:4.8)-u*7)*tail*amp+Math.sin(u*18+tick*7)*charge*5+pulse,dx=state==='coil'||state==='lunge-coil'?Math.sin(u*Math.PI)*Math.sin(e.sparkTime*4)*10:0;return{x:(u-.5)*w+dx,y:(v-.5)*h+dy};},small?2:5,small?3:7);
 ctx.shadowBlur=0;ctx.restore();
 const intensity=stunned ? .45 : charge>.05?(.45+charge*.55):elite ? .42 : .2;if(!reducedMotion&&intensity>.15){ctx.save();ctx.strokeStyle=elite?'#ffe25d':'#68efff';ctx.lineWidth=elite?2.6:1.8;ctx.globalAlpha=intensity;for(let j=0;j<(elite?4:2);j++){const seed=tick*8+j*2.7,dir=face>0?-1:1,ox=x+dir*(w*.08+j*9),oy=y-h*.05+j*8;ctx.beginPath();ctx.moveTo(ox,oy);for(let k=1;k<=4;k++){const px=ox+dir*k*15,py=oy+Math.sin(seed+k*3.1)*12;ctx.lineTo(px,py);}ctx.stroke();}ctx.restore();}
 if((state==='coil'||state==='lunge-coil'||state==='charge')&&!small){const tx=e.aimX-camera,ty=e.aimY;ctx.save();ctx.strokeStyle=state==='charge'?(elite?'#ffe25dcc':'#6ff4ffcc'):'#a7efff77';ctx.lineWidth=1.5+charge*2;ctx.setLineDash([6,8]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(tx,ty,18+charge*18,0,Math.PI*2);ctx.stroke();ctx.restore();drawReleaseBadge(x,y-h*.72,'warning',false,t);}
 if(stunned&&!small)drawReleaseBadge(x,y-h*.72,'combo',false,t);return true;
}
function drawSparkProjectile(p,t){if(p.type!=='electric')return false;const x=p.x-camera,y=p.y;if(x<-80||x>vw+80)return true;ctx.save();ctx.translate(x,y);ctx.shadowColor=p.elite?'#ffe34c':'#70eaff';ctx.shadowBlur=p.elite?22:16;ctx.fillStyle=p.elite?'#fff3a0':'#d8fbff';ctx.beginPath();ctx.arc(0,0,p.elite?9:7,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=p.elite?'#ffe24f':'#69ebff';ctx.lineWidth=p.elite?3:2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-8-i*7,Math.sin(t*10+i)*5);ctx.lineTo(-20-i*9,Math.sin(t*13+i)*10);ctx.lineTo(-32-i*10,Math.sin(t*9+i*2)*6);ctx.stroke();}ctx.restore();return true;}
function setupExtendedStoryStage(){if(!isExtendedStoryStage())return;
 const sx=storyStretchX;
 if(stage===1){boss.x=storyBossHomeX();obstacles.push(
  {x:sx(3820),y:280,w:180,h:260},{x:sx(4300),y:690,w:250,h:210},{x:sx(4810),y:280,w:170,h:290},
  {x:sx(5350),y:670,w:240,h:230},{x:sx(5900),y:280,w:190,h:270},{x:sx(6350),y:700,w:230,h:200});
  const kinds=['jelly','puffer','eel','swordfish','jelly','puffer'];
  for(const [i,x] of [3940,4460,4920,5430,5920,6260].entries()){const wx=sx(x);enemies.push({kind:kinds[i],x:wx,y:i%2?450:760,bx:wx,by:i%2?450:760,hp:1,cooldown:1.4+i*.2,phase:i,clock:0});}
  spawnSparkEel(sx(1700),510,false,0);spawnSparkEel(sx(3550),650,false,1);spawnSparkEel(sx(4700),500,false,2);spawnSparkEel(sx(5720),690,true,3);spawnSparkEel(sx(6250),440,false,4);
  for(const [i,x] of [4100,5200,6150].entries())powerups.push({x:sx(x),y:i%2?520:690,type:i===1?'boost':'heart',phase:i,taken:false});
 }
 else if(stage===2){spawnSparkEel(sx(1050),500,false,0);spawnSparkEel(sx(2050),700,false,1);spawnSparkEel(sx(3150),450,false,2);spawnSparkEel(sx(4300),690,false,3);spawnSparkEel(sx(5300),470,true,4);spawnSparkEel(sx(6200),650,false,5);}
 else if(stage===3){obstacles.push({x:sx(930),y:720,w:170,h:150},{x:sx(1780),y:300,w:150,h:240},{x:sx(2100),y:700,w:170,h:180});spawnSparkEel(sx(980),500,false,0);spawnSparkEel(sx(1680),700,false,1);spawnSparkEel(sx(2380),470,true,2);}
}
function addExitCoins(start=4050){for(let group=0;group<6;group++){const baseX=storyStretchX(start+group*470),baseY=[450,620,760][group%3];for(let i=0;i<5;i++){const x=baseX+i*34,y=baseY+Math.sin(i*.7)*24;coins.push({x,y,bx:x,by:y,cx:baseX,cy:baseY,type:'coin',taken:false,phase:i,group:50+group});}}}
function unlockExtendedLaunchPads(){if(!isExtendedStoryStage()||stage===1)return;const line=waterSurface();for(const sourceX of [4200,5150,6100,7040]){const x=storyStretchX(sourceX);if(launchPads.some(p=>p.x===x))continue;const pad={x,y:line+75,id:launchPads.length};launchPads.push(pad);if(mode!=='trial')powerups.push({x:x+140,y:line-105,type:'heart',phase:pad.id*1.8,sky:true,taken:false});powerups.push({x:x+265,y:line-155,type:'boost',phase:pad.id*1.8+1,sky:true,taken:false});}}
function setupRanaHuntArena(){
 if(!isExtendedStoryStage()||stage!==3||globalThis.ranaHuntExpanded)return;
 globalThis.ranaHuntExpanded=true;unlockExtendedLaunchPads();
 // Three sparse blockers create lanes without obscuring the hunt.
 obstacles.push({x:storyStretchX(3980),y:285,w:150,h:235,huntArena:true},{x:storyStretchX(5200),y:715,w:190,h:175,huntArena:true},{x:storyStretchX(6420),y:300,w:150,h:225,huntArena:true});
 powerups.push({x:storyStretchX(4720),y:650,type:'heart',phase:11,taken:false},{x:storyStretchX(6120),y:500,type:'boost',phase:12,taken:false});
}
function setupPalaceExitCorridor(){if(!isExtendedStoryStage()||stage!==2||palace?.exitExpanded)return;if(palace)palace.exitExpanded=true;checkpoint=Math.max(checkpoint,storyStretchX(6840));unlockExtendedLaunchPads();flash('Royal exit opened!');}
function setupRanaExitCorridor(){if(!isExtendedStoryStage()||stage!==3||globalThis.ranaExitExpanded)return;globalThis.ranaExitExpanded=true;checkpoint=Math.max(checkpoint,storyStretchX(3950));setupRanaHuntArena();addExitCoins(4200);flash('The eastern ruins are clear — portal ahead!');}
function updateExtendedStoryGate(){if(!isExtendedStoryStage())return;if(stage===3&&!isNessieFinal()&&!boss?.active&&!leap.active&&nessie.x>storyStretchX(3720)){nessie.x=storyStretchX(3720);nessie.vx=Math.min(0,nessie.vx);if(!globalThis.stage4GateToast){globalThis.stage4GateToast=true;flash('Rana is waiting back in the ruin arena');}}}
