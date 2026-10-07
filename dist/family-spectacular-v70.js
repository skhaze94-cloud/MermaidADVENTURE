'use strict';

// Mermaid Adventure 7.0 — Fantastic Definitive Family Update Spectacular.
// This pass deliberately layers polish over the mature game instead of replacing proven systems.
const V70_PERSONALITIES={
 seahorse:'orbit',puffer:'coward',jelly:'drifter',eel:'hunter',swordfish:'charger','pearl-crab':'territorial',
 'coral-sentinel':'support','reef-guard':'guardian','bubble-bomber':'artillery','moon-jelly':'drifter','kelp-stalker':'hunter','blue-lancer':'charger'
};
const V70_SURPRISES={
 0:[{x:5100,type:'wave-starfish'},{x:11800,type:'sneeze-clam'},{x:20500,type:'tiny-fish'},{x:33700,type:'whale'}],
 1:[{x:6800,type:'wave-starfish'},{x:14600,type:'tiny-fish'},{x:27600,type:'sneeze-clam'},{x:41800,type:'whale'}],
 2:[{x:7200,type:'tiny-fish'},{x:16400,type:'wave-starfish'},{x:30500,type:'sneeze-clam'},{x:47000,type:'whale'}],
 3:[{x:8100,type:'sneeze-clam'},{x:18100,type:'tiny-fish'},{x:34900,type:'wave-starfish'},{x:53500,type:'whale'}]
};
const V70_SECRET_POINTS={1:[5100,19700,40300],2:[8200,24400,43800],3:[9200,28700,51200]};
let v70Secrets=[],v70AmbientClock=0,v70LastSfx=0;


function v70AddLaterCrabs(){
 if(mode!=='sarah'||stage<=0||!mermaidBubbleUnlocked()||isShadowCrabKingdom())return;
 const specs=stage===1?[[.24,'Reef Crab','reef-guard',2],[.53,'Bubble Crab','bubble-bomber',2],[.78,'Fast Crab','coral-sentinel',2]]:stage===2?[[.18,'Guard Crab','reef-guard',3],[.42,'Bubble Crab','bubble-bomber',2],[.66,'Armoured Reef Crab','reef-guard',4],[.84,'Shadow Scout Crab','coral-sentinel',3]]:[[.16,'Reef Crab','reef-guard',2],[.39,'Bubble Crab','bubble-bomber',2],[.61,'Guard Crab','reef-guard',3],[.81,'Shadow Scout Crab','coral-sentinel',3]];
 for(const [u,name,archetype,hp] of specs){const x=Math.round(W*u);if(enemies.some(e=>e.v70LaterCrab&&Math.abs(e.x-x)<100))continue;enemies.push({kind:'pearl-crab',name,archetype,archetypeName:name,x,bx:x,y:u>.55?730:510,by:u>.55?730:510,hp,maxHp:hp,cooldown:1.2+u,phase:Math.round(u*11),clock:u*2,recoil:0,windup:0,v70LaterCrab:true});}
}

function v70AssignPersonality(){
 for(const e of enemies||[]){if(!e||e.hp<=0||e.shadowKind)continue;e.personality??=V70_PERSONALITIES[e.archetype]||V70_PERSONALITIES[e.kind]||'patrol';e.mood??='calm';e.personalityClock??=(e.phase||0)*.37;}
}
function v70ResetStagePolish(){
 v70AddLaterCrabs();v70AssignPersonality();v70AmbientClock=0;v70Secrets=[];
 if(mode==='sarah'&&stage>0&&mermaidBubbleUnlocked()&&!isShadowCrabKingdom())for(const [i,x] of (V70_SECRET_POINTS[stage]||[]).entries())v70Secrets.push({x,y:[430,700,535][i%3],open:false,phase:i*1.7});
}
function v70UpdatePersonality(dt){
 if(isShadowCrabKingdom())return;for(const e of enemies){if(!e||e.hp<=0||e.scuttle||isSparkEel(e)||isReefShark(e))continue;e.personalityClock=(e.personalityClock||0)+dt;e.mood=e.recoil>0?'surprised':e.windup>0?'scheming':e.aiState==='stalk'?'focused':'calm';if(e.personality==='coward'&&e.recoil>0)e.mood='panicked';if(e.personality==='guardian'&&Math.hypot(nessie.x-e.x,nessie.y-e.y)<280)e.mood='stern';}
}
function v70UpdateSecrets(){
 if(!v70Secrets.length||!V70.bubbleProjectiles?.length)return;for(const s of v70Secrets){if(s.open)continue;const hit=V70.bubbleProjectiles.find(p=>p.life>0&&Math.hypot(p.x-s.x,p.y-s.y)<46);if(!hit)continue;s.open=true;popMermaidBubble(hit,s.x,s.y,true);score+=200;goldCount+=2;rewardPopup(s.x,s.y-50,'SECRET PEARLS +200','treasure','#fff0ad',1.2);showRewardBanner('treasure','Bubble Secret!','A FRAGILE SHELL HID TWO PEARLS');}}
function v70PostUpdate(dt){
 if(state!=='playing')return;v70AmbientClock+=dt;v70UpdatePersonality(dt);v70UpdateSecrets();if(particles.length>300)particles.splice(0,particles.length-300);if(popups.length>28)popups.splice(0,popups.length-28);if(projectiles.length>72)projectiles.splice(0,projectiles.length-72);
}
function v70DrawPersonalityAccent(e,t){
 if(!e||e.hp<=0||!e.personality||e.shadowKind)return;const x=e.x-camera,y=e.y;if(x<-100||x>vw+100)return;ctx.save();ctx.globalAlpha=.72;ctx.textAlign='center';ctx.font='900 15px Nunito,sans-serif';if(e.mood==='surprised'||e.mood==='panicked'){ctx.fillStyle='#fff1a8';ctx.fillText(e.mood==='panicked'?'!?':'!',x,y-68-Math.sin(t*5+e.phase)*4);}else if(e.mood==='scheming'&&Math.sin((e.personalityClock||0)*8)>0){ctx.fillStyle='#d9faff';ctx.fillText('• • •',x,y-65);}ctx.restore();
}
function v70DrawSecretShells(t){
 for(const s of v70Secrets){const x=s.x-camera;if(x<-80||x>vw+80)continue;ctx.save();ctx.translate(x,s.y);ctx.globalAlpha=s.open?.35:1;ctx.shadowColor=s.open?'#ffffff00':'#a7f6ff';ctx.shadowBlur=s.open?0:12;ctx.fillStyle=s.open?'#6d7180':'#9b83bd';ctx.strokeStyle='#e7faff';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,26,Math.PI,Math.PI*2);ctx.lineTo(0,18);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;if(!s.open){ctx.fillStyle='#fff';ctx.font='17px sans-serif';ctx.textAlign='center';ctx.fillText('🫧',0,5);}ctx.restore();}
}
function v70DrawSurprise(item,t){
 const x=item.x-camera;if(x<-220||x>vw+220)return;const y=855;
 ctx.save();ctx.translate(x,y);ctx.globalAlpha=.72;
 if(item.type==='wave-starfish'){ctx.translate(0,-25);ctx.rotate(Math.sin(t*2)*.08);ctx.fillStyle='#ffb678';ctx.strokeStyle='#ffe3b8';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?13:31;i?ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r):ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#684567';ctx.beginPath();ctx.arc(-7,-2,2,0,Math.PI*2);ctx.arc(7,-2,2,0,Math.PI*2);ctx.stroke();ctx.save();ctx.translate(24,-16);ctx.rotate(Math.sin(t*4)*.4);ctx.strokeStyle='#ffcf9a';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(12,-18);ctx.stroke();ctx.restore();}
 else if(item.type==='sneeze-clam'){ctx.fillStyle='#8b72a7';ctx.strokeStyle='#e5dcff';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,42,17,0,Math.PI,Math.PI*2);ctx.fill();ctx.stroke();const sneeze=!reducedMotion&&Math.sin(t*.8+item.x)>.92;if(sneeze)for(let i=0;i<4;i++)paintedBubble(18+i*10,-20-i*10,3+i,.45);}
 else if(item.type==='tiny-fish'){ctx.fillStyle='#f8d78e';for(let i=0;i<4;i++){const fx=i*24-35,fy=Math.sin(t*2+i)*8-40;ctx.beginPath();ctx.ellipse(fx,fy,10,5,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(fx-10,fy);ctx.lineTo(fx-18,fy-6);ctx.lineTo(fx-18,fy+6);ctx.closePath();ctx.fill();}}
 else if(item.type==='whale'){ctx.globalAlpha=.12;ctx.scale(2.4,2.4);ctx.fillStyle='#8fb4d6';ctx.beginPath();ctx.ellipse(0,-110,70,26,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(-66,-110);ctx.lineTo(-95,-132);ctx.lineTo(-88,-108);ctx.lineTo(-96,-88);ctx.closePath();ctx.fill();}
 ctx.restore();
}
function v70DrawSpectacular(t){
 if(state==='ready'||mode==='trial')return;v70DrawSecretShells(t);if(!isShadowCrabKingdom())for(const item of V70_SURPRISES[Math.max(0,stage)]||[])v70DrawSurprise(item,t);
}
function v70AssetResilience(){
 const images=[scene,jungle,sprite,dancers,reefArt,rootArt,floraArt,carloArt,miguelArt,ranaArt,sarahArt,portraitArt,kingArt,queenArt,palaceArt,trainingArt,environmentArt,creatureArt,tutorialAtlasArt,sharkPaintedArt,tutorialReefArt,tutorialFaceArt];
 for(const img of images){if(!img?.addEventListener)continue;img.addEventListener('error',()=>{if(!img.__v70Warned){img.__v70Warned=true;console.warn?.('Optional Mermaid Adventure artwork failed to load; procedural fallback remains active.');}},{once:true});}
}

// Wrap mature systems rather than rewriting them.
const v70BaseSetup=setup;setup=function(){v70BaseSetup();v70ResetStagePolish();};
const v70BaseUpdate=update;update=function(dt){v70BaseUpdate(dt);v70PostUpdate(Math.min(dt,.035));};
const v70BaseDraw=draw;draw=function(t){v70BaseDraw(t);v70DrawSpectacular(t);};
const v70BaseReleaseCreature=releaseCreature;releaseCreature=function(e,t,small=false){const out=v70BaseReleaseCreature(e,t,small);if(!small)v70DrawPersonalityAccent(e,t);return out;};

v70AssetResilience();v70ResetStagePolish();
