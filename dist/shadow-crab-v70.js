'use strict';

// Mermaid Adventure 7.0 — Mermaid Power #1 + Shadow Crab Kingdom.
const SHADOW_CRAB_LENGTH=14300;
const SHADOW_SECTIONS=[{x:0,name:'DESCENT'},{x:2860,name:'OUTER KINGDOM'},{x:5720,name:'CRAB MARKET'},{x:8580,name:'SHADOW TUNNELS'},{x:11440,name:'ROYAL APPROACH'}];
const SHADOW_KINGDOM_META={
 id:'shadow-crab',boss:'shadow-duo',name:'Shadow Crab Kingdom',storyName:'The Shadow Crab Kingdom',
 place:'BENEATH THE REEF · SHADOW CRAB KINGDOM',count:54,current:0,waterline:250,
 pads:[1105,2730,4940,7085,9425,11765],coinStart:420,coinSpacing:234,
 coinRows:[430,560,700,790],fishColors:['#9be7e5','#ba9cff','#7dd1ff','#ffd3a0'],theme:'shadow-crab',
 intro:'shadow-intro',checkpointDialogue:'shadow-checkpoint',depth:'THE KINGDOM BELOW',
 portalTitle:'Down into the Shadow Crab Kingdom',portalSub:'Something much bigger is hiding beneath the reef.'
};

const V70=globalThis.V70={
 mermaidPowers:{bubble:false},bubbleProjectiles:[],bubbleCooldown:0,bubbleRush:0,attackPulse:0,
 unlock:{active:false,time:0,targets:[],shots:0,finished:false,dialogueShown:false},
 shadow:{active:false,complete:false,transition:'',checkpointReached:false,section:-1,duo:null,decor:[],switches:[],secrets:[],comedy:[],entered:false},
 caps:{bubbles:30,particles:320,enemyProjectiles:72}
};
try{V70.mermaidPowers.bubble=localStorage.getItem('sarah-mermaid-power-bubble-v1')==='1';V70.shadow.complete=localStorage.getItem('sarah-shadow-crab-clear-v1')==='1';}catch{}

function mermaidBubbleUnlocked(){return !!V70.mermaidPowers.bubble;}
function isShadowCrabKingdom(){return !!V70.shadow.active;}
function shadowCrabStageMeta(){return SHADOW_KINGDOM_META;}
function shadowCrabPortalOpen(){return isShadowCrabKingdom()?!!V70.shadow.duo?.victoryReady:(stage===0&&mode==='sarah'?!!(V70.unlock.finished||V70.shadow.complete):null);}
function v70FireRate(){return V70.bubbleRush>0?.14:.42;}
function v70BubbleCap(){return V70.bubbleRush>0?30:16;}

function ensureBubbleControls(){
 const actions=document.querySelector('.splash-actions');
 if(actions&&!document.getElementById('touch-bubble')){
  const b=document.createElement('button');b.id='touch-bubble';b.className='touch-bubble';b.type='button';b.setAttribute('aria-label','Fire Mermaid Bubble');b.innerHTML='<span class="bubble-emblem"><i></i><i></i><i></i></span><b>BUBBLE</b>';actions.appendChild(b);
  b.addEventListener('pointerdown',e=>{e.preventDefault();fireMermaidBubble();});
 }
 if(!document.getElementById('bubble-power-hud')){
  const hud=document.createElement('div');hud.id='bubble-power-hud';hud.className='bubble-power-hud';hud.innerHTML='<span class="bubble-hud-icon"><i></i><i></i><i></i></span><span><strong>MERMAID BUBBLE</strong><small id="bubble-power-status">POWER #1</small></span><div class="bubble-rush-meter"><i id="bubble-rush-fill"></i></div>';
  document.querySelector('.game-shell')?.appendChild(hud);
 }
 syncBubbleUi();
}
function syncBubbleUi(){
 const on=mermaidBubbleUnlocked()&&mode==='sarah';
 const button=document.getElementById('touch-bubble'),hud=document.getElementById('bubble-power-hud');
 if(button)button.classList.toggle('available',on);
 if(hud)hud.classList.toggle('available',on);
 const status=document.getElementById('bubble-power-status'),fill=document.getElementById('bubble-rush-fill');
 if(status)status.textContent=V70.bubbleRush>0?'BUBBLE RUSH · '+Math.ceil(V70.bubbleRush)+'s':'POWER #1 · F / ATTACK';
 if(fill)fill.style.width=(Math.min(1,V70.bubbleRush/10)*100)+'%';
 hud?.classList.toggle('rush',V70.bubbleRush>0);button?.classList.toggle('rush',V70.bubbleRush>0);
}

function startMermaidBubbleUnlock(){
 if(mode!=='sarah'||stage!==0)return false;
 if(V70.unlock.active||V70.unlock.finished)return true;
 V70.mermaidPowers.bubble=true;try{localStorage.setItem('sarah-mermaid-power-bubble-v1','1');}catch{}
 V70.unlock={active:true,time:0,shots:0,finished:false,dialogueShown:false,targets:[
  {x:nessie.x+360,y:nessie.y-80,hp:1,label:'shell target'},
  {x:nessie.x+540,y:nessie.y+55,hp:1,label:'shell target'},
  {x:nessie.x+760,y:nessie.y+100,hp:1,label:'shell target'}
 ]};
 projectiles=[];showRewardBanner('perfect','NEW MERMAID POWER!','MERMAID BUBBLE · FIRE MAGICAL BUBBLES');
 flash('🫧 Press F or tap BUBBLE — pop the 3 practice shells!');tone(880,.2,.035);setTimeout?.(()=>tone(1174,.22,.03),90);
 for(let i=0;i<26;i++){const a=i/26*Math.PI*2,v=70+Math.random()*95;particles.push({x:nessie.x,y:nessie.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,life:.75,max:.75,color:i%3?'#b8fff5':'#ffd7ff',r:2+i%4,bubble:true});}
 syncBubbleUi();return true;
}
function completeBubbleTutorial(){
 if(!V70.unlock.active||V70.unlock.finished)return;
 V70.unlock.active=false;V70.unlock.finished=true;score+=300;showRewardBanner('clear','MERMAID BUBBLE MASTERED!','THE PASSAGE BELOW HAS OPENED');flash('The reef trembles… a hidden path leads down.');
 if(mode==='sarah'&&!V70.unlock.dialogueShown){V70.unlock.dialogueShown=true;openDialogue?.('bubble-unlock',()=>openDialogue?.('carlo-win'));}
 syncBubbleUi();
}

function fireMermaidBubble(){
 if(state!=='playing'||mode!=='sarah'||!mermaidBubbleUnlocked())return false;
 if(V70.bubbleCooldown>0||V70.bubbleProjectiles.length>=v70BubbleCap())return false;
 const face=nessie.face||1,handX=nessie.x+face*72,handY=nessie.y-20;
 V70.bubbleProjectiles.push({x:handX,y:handY,vx:face*650,vy:(nessie.vy||0)*.08,life:2.6,age:0,r:15,phase:Math.random()*6.28});
 V70.bubbleCooldown=v70FireRate();V70.attackPulse=.22;V70.unlock.shots++;
 if(!reducedMotion&&particles.length<V70.caps.particles-8)for(let i=0;i<5;i++)particles.push({x:handX,y:handY,vx:-face*(20+Math.random()*55),vy:-25-Math.random()*45,life:.32,max:.32,color:i%2?'#b9ffff':'#ffd6ff',r:2+Math.random()*2,bubble:true});
 tone(V70.bubbleRush>0?720:620,.045,.015);return true;
}
function popMermaidBubble(p,x=p.x,y=p.y,big=false){
 p.life=0;screenShake=Math.max(screenShake,reducedMotion?0:big?.045:.018);
 if(!reducedMotion&&particles.length<V70.caps.particles-10)for(let i=0;i<(big?10:6);i++){const a=i/(big?10:6)*Math.PI*2,v=45+Math.random()*(big?100:65);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.28+Math.random()*.18,max:.45,color:i%3?'#bcffff':'#ffdcff',r:1.5+Math.random()*2.5,bubble:i%2===0});}
 tone(big?420:520,.035,.012);
}
function collectBubbleRush(p){
 p.taken=true;V70.bubbleRush=Math.min(14,V70.bubbleRush+10);showRewardBanner('perfect','BUBBLE RUSH!','3× MERMAID BUBBLE FIRE RATE · 10s');rewardPopup(p.x,p.y-30,'BUBBLE RUSH!', 'perfect','#caffff',1.35);tone(980,.12,.025);syncBubbleUi();
}
function drawBubbleRushPowerup(p,t){
 const x=p.x-camera;if(p.taken||x<-90||x>vw+90)return true;const y=p.y+(reducedMotion?0:Math.sin(t*2.7+p.phase)*8),pulse=reducedMotion?0:(Math.sin(t*5+p.phase)+1)/2;ctx.save();ctx.translate(x,y);const g=ctx.createRadialGradient(0,0,5,0,0,57);g.addColorStop(0,'#ffffff');g.addColorStop(.22,'#9affff');g.addColorStop(.52,'#8aa8ff');g.addColorStop(.76,'#e69cff');g.addColorStop(1,'#7a58cb00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,43+pulse*3,0,Math.PI*2);ctx.fill();for(let i=0;i<3;i++){const a=(reducedMotion?i*2.09:t*1.8+i*2.09),r=19;ctx.fillStyle=i===0?'#dcffff':i===1?'#b4e9ff':'#f0d0ff';ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,10+i*2,0,Math.PI*2);ctx.fill();ctx.stroke();}ctx.fillStyle='#fff';ctx.font='900 14px Nunito,sans-serif';ctx.textAlign='center';ctx.fillText('×3',0,5);ctx.restore();return true;
}

function updateMermaidBubble(dt){
 V70.bubbleCooldown=Math.max(0,V70.bubbleCooldown-dt);V70.bubbleRush=Math.max(0,V70.bubbleRush-dt);V70.attackPulse=Math.max(0,V70.attackPulse-dt);syncBubbleUi();
 if(!mermaidBubbleUnlocked()||mode!=='sarah'){V70.bubbleProjectiles.length=0;return;}
 if(V70.unlock.active){V70.unlock.time+=dt;if(V70.unlock.time>1.15&&V70.unlock.shots===0&&Math.floor(V70.unlock.time*1.4)%3===0)flash('🫧 F / ATTACK · pop the glowing shell targets');}
 for(const p of V70.bubbleProjectiles){
  p.age+=dt;p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt+Math.sin(p.age*7+p.phase)*10*dt;p.r=15+Math.sin(p.age*9+p.phase)*1.8;
  if(p.life<=0||p.x<0||p.x>W||p.y<waterSurface()+5||p.y>930)continue;
  const block=obstacles.some(o=>p.x>o.x-5&&p.x<o.x+o.w+5&&p.y>o.y-5&&p.y<o.y+o.h+5);if(block){popMermaidBubble(p);continue;}
  let hit=false;
  if(V70.unlock.active)for(const target of V70.unlock.targets){if(target.hp>0&&Math.hypot(p.x-target.x,p.y-target.y)<42){target.hp=0;popMermaidBubble(p,target.x,target.y,true);score+=30;hit=true;break;}}
  if(hit)continue;
  for(const hostile of projectiles){if(hostile.life>0&&Math.hypot(p.x-hostile.x,p.y-hostile.y)<35){hostile.life=0;popMermaidBubble(p,p.x,p.y,true);score+=15;hit=true;break;}}
  if(hit)continue;
  for(const e of enemies){if(e.hp<=0||isSparkEel?.(e)&&e.sparkState==='stunned')continue;const radius=e.shadowKind==='armoured'?62:48;if(Math.hypot(p.x-e.x,p.y-e.y)>radius)continue;if(e.shadowKind==='guard'&&e.guardUp){popMermaidBubble(p);e.recoil=.18;hit=true;break;}e.hp-=1;e.recoil=.22;popMermaidBubble(p,e.x,e.y,true);if(e.hp<=0){score+=e.shadowKind?120:90;rewardPopup(e.x,e.y-48,'POP! +'+(e.shadowKind?120:90),'pearl','#bffcff',.8);}hit=true;break;}
  if(hit)continue;
  if(boss?.active&&boss.hp>0&&Math.hypot(p.x-boss.x,p.y-boss.y)<(isDarkTunnel()?245:150)){if(isShadowCrabKingdom()){if(shadowBubbleHitBoss(p))continue;}else if(boss.vulnerable&&boss.hitCooldown<=0){boss.bubbleHits=(boss.bubbleHits||0)+1;popMermaidBubble(p,boss.x,boss.y,true);if(boss.bubbleHits>=3){boss.bubbleHits=0;boss.hp=Math.max(0,boss.hp-1);boss.hitCooldown=.75;score+=180;bossImpact(boss);}continue;}else{popMermaidBubble(p);continue;}}
 }
 V70.bubbleProjectiles=V70.bubbleProjectiles.filter(p=>p.life>0&&p.x>0&&p.x<W&&p.y>waterSurface()+4&&p.y<935);
 if(V70.bubbleProjectiles.length>V70.caps.bubbles)V70.bubbleProjectiles.splice(0,V70.bubbleProjectiles.length-V70.caps.bubbles);
 if(V70.unlock.active&&V70.unlock.targets.every(t=>t.hp<=0))completeBubbleTutorial();
}
function drawMermaidBubble(t){
 for(const p of V70.bubbleProjectiles){const x=p.x-camera;if(x<-50||x>vw+50)continue;ctx.save();ctx.translate(x,p.y);const wobble=1+(reducedMotion?0:Math.sin(p.age*9+p.phase)*.05);ctx.scale(wobble,1/wobble);const g=ctx.createRadialGradient(-p.r*.35,-p.r*.4,1,0,0,p.r);g.addColorStop(0,'#ffffffea');g.addColorStop(.18,'#bfffff80');g.addColorStop(.45,'#7edcff42');g.addColorStop(.7,'#d5a5ff38');g.addColorStop(1,'#70dff718');ctx.fillStyle=g;ctx.strokeStyle='#eaffffdf';ctx.lineWidth=2.2;ctx.shadowColor='#8ffcff';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(0,0,p.r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.globalAlpha=.86;ctx.beginPath();ctx.ellipse(-p.r*.38,-p.r*.42,p.r*.22,p.r*.13,-.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.6;ctx.strokeStyle='#ffcfff';ctx.lineWidth=1;ctx.beginPath();ctx.arc(2,1,p.r*.72,.5,2.3);ctx.stroke();ctx.restore();}
 if(V70.unlock.active)for(const target of V70.unlock.targets){if(target.hp<=0)continue;const x=target.x-camera;if(x<-80||x>vw+80)continue;ctx.save();ctx.translate(x,target.y);ctx.shadowColor='#b9ffff';ctx.shadowBlur=18;ctx.strokeStyle='#f5ffff';ctx.fillStyle='#a389c9';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,30,22,0,Math.PI,Math.PI*2);ctx.lineTo(0,16);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.textAlign='center';ctx.fillText('✦',0,4);ctx.restore();}
 if(V70.attackPulse>0&&state==='playing'){const x=nessie.x-camera+(nessie.face||1)*72,y=nessie.y-20,u=V70.attackPulse/.22;ctx.save();ctx.globalAlpha=u;ctx.translate(x,y);ctx.strokeStyle='#dfffff';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,28+(1-u)*24,-1.4,1.4);ctx.stroke();for(let i=0;i<3;i++)paintedBubble(Math.cos(t*5+i*2)*22,Math.sin(t*5+i*2)*18,2.5,.7*u);ctx.restore();}
}

function makeShadowCrab(kind,x,y,phase=0){
 const spec={
  reef:{hp:1,speed:70},spear:{hp:2,speed:62},bubble:{hp:2,speed:56},armoured:{hp:5,speed:34},charger:{hp:3,speed:88},hermit:{hp:3,speed:42},jump:{hp:2,speed:74},guard:{hp:4,speed:40},sneaky:{hp:2,speed:65},shadow:{hp:4,speed:76}
 }[kind]||{hp:2,speed:60};
 return {kind:'pearl-crab',shadowKind:kind,archetype:'shadow-'+kind,name:(kind==='shadow'?'Shadow Crab':kind[0].toUpperCase()+kind.slice(1)+' Crab'),x,bx:x,y,by:y,hp:spec.hp,maxHp:spec.hp,speed:spec.speed,phase,clock:0,state:kind==='sneaky'?'buried':'idle',stateTime:.4+phase*.07,cooldown:1+phase*.1,dir:phase%2?1:-1,recoil:0,guardUp:false};
}
function shadowCrabRoster(){
 const roster=[];const sections=[
  [585,['reef']],[1040,['reef','reef']],[1885,['spear','reef']],[2535,['armoured']],[3380,['shadow']],[4160,['bubble','reef']],[5070,['guard','reef']],[5980,['sneaky','jump']],[7020,['shadow','charger']],[8060,['hermit','bubble']],[9165,['shadow','guard']],[10270,['jump','charger','reef']],[11440,['shadow','armoured']],[12545,['shadow','bubble','guard']]
 ];
 let n=0;for(const [base,kinds] of sections)for(const [i,kind] of kinds.entries()){const x=base+i*175,y=i%2?520:760;roster.push(makeShadowCrab(kind,x,y,n++));}return roster;
}
function setupShadowCrabKingdom(){
 V70.shadow.active=true;V70.shadow.entered=true;V70.shadow.checkpointReached=false;V70.shadow.section=-1;V70.shadow.duo=null;V70.shadow.transition='';W=SHADOW_CRAB_LENGTH;checkpoint=220;health=5;invincible=1.2;bossAnnounced=false;bossDefeat=0;camera=0;nessie={x:260,y:500,vx:0,vy:0,face:1};energy=1;dashTime=0;dashCooldown=0;projectiles=[];V70.bubbleProjectiles=[];
 obstacles=[{x:1430,y:720,w:380,h:180},{x:2892,y:280,w:300,h:250},{x:4485,y:685,w:450,h:215},{x:6565,y:300,w:320,h:240},{x:8580,y:700,w:500,h:200},{x:10725,y:280,w:360,h:240},{x:12285,y:705,w:420,h:195}];
 enemies=shadowCrabRoster();
 coins=[];for(let i=0;i<54;i++){const x=338+i*234,y=[430,560,700,790][i%4];coins.push({x,y,bx:x,by:y,type:'coin',taken:false,phase:i*.31,group:Math.floor(i/6)});}
 powerups=[{x:2340,y:520,type:'heart',phase:.2,taken:false},{x:5330,y:610,type:'bubble-rush',phase:1.1,taken:false},{x:7475,y:470,type:'heart',phase:2.1,taken:false},{x:9815,y:640,type:'bubble-rush',phase:3.4,taken:false},{x:11960,y:500,type:'boost',phase:4.2,taken:false}];
 launchPads=SHADOW_KINGDOM_META.pads.map((x,i)=>({x,y:SHADOW_KINGDOM_META.waterline+75,id:i}));resetLeap();
 V70.shadow.switches=[{x:3802,y:430,on:false},{x:7722,y:720,on:false},{x:11148,y:470,on:false}];
 V70.shadow.secrets=[{x:3965,y:390,open:false},{x:7878,y:675,open:false},{x:11278,y:430,open:false}];
 V70.shadow.comedy=[{x:4680,type:'sleepy'},{x:6370,type:'argue'},{x:8970,type:'rock'},{x:11440,type:'shell-rider'}];
 V70.shadow.decor=Array.from({length:46},(_,i)=>({x:195+i*306,y:860-(i%4)*22,kind:i%7,phase:i*.73}));
 boss={name:'Duke Claw & Flip the Dolphin',x:13455,y:690,hp:10,max:10,active:false,vulnerable:false,hitCooldown:0,clock:0,shot:0};
 V70.shadow.duo={phase:1,dolphin:{x:13682,y:440,hp:8,max:8,vx:0,vy:0,stun:0},crabStun:0,comboClock:0,collisionReady:false,victoryReady:false,winTime:0,taunt:0};
 updateStageUI();flash('🦀 THE SHADOW CRAB KINGDOM · Mermaid Bubble ready!');
}
function beginShadowKingdomPortal(){
 if(V70.shadow.active||V70.shadow.transition)return false;V70.shadow.transition='into';state='portal';portalTime=0;portalFrom=0;portalSwitched=false;clearHeldControls();$('portal-caption').style.display='flex';$('portal-title').textContent='THE SHADOW CRAB KINGDOM';$('portal-sub').textContent='The reef opens. Sarah descends into the hidden kingdom below.';return true;
}
function beginShadowKingdomExit(){
 if(!isShadowCrabKingdom()||V70.shadow.transition)return false;V70.shadow.transition='out';state='portal';portalTime=0;portalFrom=0;portalSwitched=false;clearHeldControls();$('portal-caption').style.display='flex';$('portal-title').textContent='BACK TOWARD THE SUNLIGHT';$('portal-sub').textContent='Bubbles rise. The water brightens. The main adventure continues.';return true;
}
function updateShadowPortal(dt){
 if(!V70.shadow.transition)return false;portalTime+=dt;
 if(portalTime>=3.4&&!portalSwitched){
  if(V70.shadow.transition==='into'){setupShadowCrabKingdom();}
  else{V70.shadow.active=false;V70.shadow.complete=true;try{localStorage.setItem('sarah-shadow-crab-clear-v1','1');}catch{}stage=1;loadStage();}
  portalSwitched=true;tone(523,.3);tone(784,.3);
 }
 if(portalTime>=7){const wasOut=V70.shadow.transition==='out';V70.shadow.transition='';state='playing';$('portal-caption').style.display='none';elapsed=0;keys.clear();canvas.focus();hud();if(mode==='sarah')openDialogue?.(wasOut?currentStage().intro:'shadow-intro');}
 return true;
}

function fireShadowProjectile(x,y,type='dark-bubble',speed=220,spread=0,variant='straight'){
 if(projectiles.length>=V70.caps.enemyProjectiles)return;const a=Math.atan2(nessie.y-y,nessie.x-x)+spread;projectiles.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:4.8,type,variant,age:0,phase:Math.random()*6.28,hitRadius:type==='water-ring'?68:48,shadowOwned:true});
}
function shadowEnemyAttack(e){
 const k=e.shadowKind;
 if(k==='spear')fireShadowProjectile(e.x,e.y,'coral-shard',330,0);
 else if(k==='bubble')[-.18,0,.18].forEach(s=>fireShadowProjectile(e.x,e.y,'dark-bubble',205,s));
 else if(k==='shadow'){fireShadowProjectile(e.x,e.y,'dark-bubble',245,0,'homing');if((e.phase++%2)===0)fireShadowProjectile(e.x,e.y,'coral-shard',300,.2);}
 else if(k==='guard')fireShadowProjectile(e.x,e.y,'shell-claw',230,0,'boomerang');
 else if(k==='armoured')fireShadowProjectile(e.x,e.y,'falling-shell',190,0,'sine');
}
function updateShadowEnemy(e,dt){
 e.clock+=dt;e.stateTime-=dt;e.recoil=Math.max(0,e.recoil-dt);const dx=nessie.x-e.x,dy=nessie.y-e.y,d=Math.hypot(dx,dy)||1,dir=Math.sign(dx)||1;e.dir=dir;
 if(e.shadowKind==='sneaky'&&e.state==='buried'){if(d<430){e.state='ambush';e.stateTime=.8;}return;}
 if(e.state==='ambush'){if(e.stateTime<=0){e.state='attack';e.stateTime=.55;}return;}
 if(e.shadowKind==='hermit'){if(e.state==='shell'){e.guardUp=true;if(e.stateTime<=0){e.state='notice';e.stateTime=1.4;e.guardUp=false;}return;}if(e.hp<e.maxHp&&e.clock%5<1.25){e.state='shell';e.stateTime=1.1;e.guardUp=true;return;}}
 if(e.shadowKind==='guard'){e.guardUp=(e.clock%4.6)<1.5;}
 if(d<760&&e.state==='idle'){e.state='notice';e.stateTime=.45;}
 if(e.state==='notice'&&e.stateTime<=0){e.state='approach';e.stateTime=1.2;}
 if(e.state==='approach'){
  const preferred=e.shadowKind==='bubble'||e.shadowKind==='spear'?420:e.shadowKind==='guard'?300:210;
  if(d>preferred)e.x+=dir*e.speed*dt;else if(d<preferred*.7)e.x-=dir*e.speed*.7*dt;e.y+=(e.by+Math.sin(e.clock*2+e.phase)*35-e.y)*dt*1.8;
  if(e.shadowKind==='jump')e.y-=Math.max(0,Math.sin(e.clock*3.4))*85*dt;
  if(e.stateTime<=0){e.state='telegraph';e.stateTime=.55;}
 }
 if(e.state==='telegraph'){if(e.shadowKind==='charger')e.chargeCue=true;if(e.stateTime<=0){e.state='attack';e.stateTime=e.shadowKind==='charger'?.65:.35;e.chargeCue=false;if(['spear','bubble','shadow','guard','armoured'].includes(e.shadowKind))shadowEnemyAttack(e);}}
 if(e.state==='attack'){
  if(e.shadowKind==='charger')e.x+=dir*330*dt;else if(e.shadowKind==='jump')e.x+=dir*180*dt;
  if(e.stateTime<=0){e.state='retreat';e.stateTime=.7;}
 }
 if(e.state==='retreat'){e.x-=dir*e.speed*.8*dt;if(e.stateTime<=0){e.state='reposition';e.stateTime=.55;}}
 if(e.state==='reposition'){e.y+=(e.by+(e.phase%2?90:-75)-e.y)*dt*2;if(e.stateTime<=0){e.state='approach';e.stateTime=1.1+Math.random()*.65;}}
 e.x=clamp(e.x,e.bx-280,e.bx+340);e.y=clamp(e.y,360,835);
 if(d<64&&!e.guardUp){if(dashTime>0){e.hp-=2;e.recoil=.3;score+=90;nessie.vx=-dir*120;}else hurt(e.x);}
}
function spawnDuoCombo(kind){
 const duo=V70.shadow.duo,d=duo.dolphin;if(kind==='cross'){[-.28,0,.28].forEach(s=>fireShadowProjectile(boss.x,boss.y,'dark-bubble',245,s));d.vx=-Math.sign(d.x-nessie.x)*650;d.vy=(nessie.y-d.y)*1.6;}
 else if(kind==='splash'){fireShadowProjectile(d.x,d.y,'water-ring',240,0,'sine');fireShadowProjectile(boss.x,boss.y,'coral-shard',330,0);}
 else if(kind==='launch'){d.vx=(nessie.x-d.x)*1.8;d.vy=-170;duo.collisionReady=true;}
}
function updateShadowBoss(dt){
 const duo=V70.shadow.duo;if(!duo||duo.victoryReady)return;const d=duo.dolphin,oldX=d.x,oldY=d.y;
 if(!boss.active&&nessie.x>12870){boss.active=true;boss.clock=0;duo.comboClock=0;showRewardBanner('perfect','DUO BOSS!','DUKE CLAW + FLIP THE DOLPHIN');if(mode==='sarah')openDialogue?.('shadow-boss');}
 if(!boss.active)return;boss.clock+=dt;boss.hitCooldown=Math.max(0,boss.hitCooldown-dt);duo.crabStun=Math.max(0,duo.crabStun-dt);d.stun=Math.max(0,d.stun-dt);duo.comboClock+=dt;
 const total=(boss.hp/boss.max+d.hp/d.max)*.5;duo.phase=total>.66?1:total>.3?2:3;
 boss.vulnerable=duo.crabStun>0||(boss.clock%(duo.phase===1?6.5:5.2))>4.1;const crabCycle=boss.clock%(duo.phase===3?4.1:5.4);
 if(duo.crabStun<=0){boss.x=13455+Math.sin(boss.clock*.55)*100;boss.y=690+Math.sin(boss.clock*1.1)*30;if(crabCycle>.8&&crabCycle<1.55&&boss.shot<=0){[-.2,0,.2].forEach(s=>fireShadowProjectile(boss.x,boss.y,'dark-bubble',245,s));boss.shot=.9;}if(crabCycle>2.1&&crabCycle<2.7&&Math.abs(nessie.x-boss.x)<340&&Math.abs(nessie.y-boss.y)<170)hurt(boss.x);}boss.shot-=dt;
 if(d.stun<=0){const targetX=13358+Math.sin(boss.clock*(duo.phase===3?1.35:.9))*560,targetY=430+Math.sin(boss.clock*1.65)*165;d.x+=(targetX-d.x)*dt*2.1;d.y+=(targetY-d.y)*dt*2.3;d.x+=d.vx*dt;d.y+=d.vy*dt;d.vx*=Math.exp(-dt*2.2);d.vy*=Math.exp(-dt*2.2);if(duo.comboClock>(duo.phase===1?5.8:duo.phase===2?4.4:3.4)){duo.comboClock=0;spawnDuoCombo(duo.phase===1?'splash':Math.random()<.52?'cross':'launch');}}
 const travelX=(d.x-oldX)/Math.max(dt,.001),travelY=(d.y-oldY)/Math.max(dt,.001);d.pitch83=(d.pitch83||0)+(clamp(travelY*.001,-.28,.28)-(d.pitch83||0))*(1-Math.exp(-dt*7));if(Math.abs(travelX)>18)d.facing83=Math.sign(travelX);
 if(duo.collisionReady&&Math.hypot(d.x-boss.x,d.y-boss.y)<175){duo.collisionReady=false;d.stun=2.2;duo.crabStun=2.2;boss.vulnerable=true;screenShake=.25;showRewardBanner('combo','COMEDY COLLISION!','BOTH BOSSES ARE DIZZY — ATTACK NOW!');rewardPopup(boss.x,boss.y-150,'BONK!','perfect','#fff2a0',1.2);tone(190,.18,.035);}
 if(Math.hypot(nessie.x-d.x,nessie.y-d.y)<70&&d.stun<=0){if(dashTime>0){d.stun=.8;d.hp=Math.max(0,d.hp-1);score+=120;}else hurt(d.x);}
 if((boss.hp<=0&&d.hp<=0)||boss.hp<=0&&d.hp<=2||d.hp<=0&&boss.hp<=2){boss.hp=0;d.hp=0;boss.active=false;duo.victoryReady=true;duo.winTime=0;projectiles=[];enemies.forEach(e=>e.hp=0);showRewardBanner('perfect','SHADOW KINGDOM SAVED!','DUKE CLAW DEFEATED · FLIP IS VERY DIZZY');if(mode==='sarah')openDialogue?.('shadow-win');try{localStorage.setItem('sarah-shadow-crab-clear-v1','1');}catch{}}
}
function shadowBubbleHitBoss(p){
 const duo=V70.shadow.duo;if(!duo)return false;const d=duo.dolphin;
 if(d.hp>0&&Math.hypot(p.x-d.x,p.y-d.y)<105){popMermaidBubble(p,d.x,d.y,true);d.bubbleHits=(d.bubbleHits||0)+1;if(d.stun>0||d.bubbleHits>=2){d.bubbleHits=0;d.hp=Math.max(0,d.hp-1);d.stun=Math.max(d.stun,.3);score+=90;rewardPopup(d.x,d.y-80,'SPLASH!','pearl','#bdfcff',.75);}return true;}
 if(Math.hypot(p.x-boss.x,p.y-boss.y)<155){popMermaidBubble(p,boss.x,boss.y,true);if(boss.vulnerable){boss.bubbleHits=(boss.bubbleHits||0)+1;if(boss.bubbleHits>=3){boss.bubbleHits=0;boss.hp=Math.max(0,boss.hp-1);boss.hitCooldown=.65;score+=120;rewardPopup(boss.x,boss.y-100,'SHIELD BREAK!','combo','#d7c1ff',.8);}}else rewardPopup(boss.x,boss.y-105,'BLOCK!','plain','#d6c4ff',.45);return true;}
 return false;
}
function updateShadowProjectiles(dt){
 for(const p of projectiles){p.age=(p.age||0)+dt;p.life-=dt;if(p.variant==='homing'){const speed=Math.max(190,Math.hypot(p.vx,p.vy)),cur=Math.atan2(p.vy,p.vx),target=Math.atan2(nessie.y-p.y,nessie.x-p.x);let turn=((target-cur+Math.PI*3)%(Math.PI*2))-Math.PI;const a=cur+clamp(turn,-1.8*dt,1.8*dt);p.vx=Math.cos(a)*speed;p.vy=Math.sin(a)*speed;}p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.variant==='sine')p.y+=Math.sin(p.age*6+p.phase)*55*dt;if(p.variant==='boomerang'&&p.age>1.1&&!p.turned){p.vx*=-1;p.turned=true;}if(Math.hypot(p.x-nessie.x,p.y-nessie.y)<(p.hitRadius||48)){p.life=0;if(dashTime>0){score+=15;}else hurt(p.x);}}
 projectiles=projectiles.filter(p=>p.life>0&&p.x>0&&p.x<W&&p.y>waterSurface()&&p.y<940);if(projectiles.length>V70.caps.enemyProjectiles)projectiles.splice(0,projectiles.length-V70.caps.enemyProjectiles);
}
function updateShadowCrabKingdom(dt){
 if(!isShadowCrabKingdom())return false;invincible=Math.max(0,invincible-dt);const section=Math.max(0,SHADOW_SECTIONS.findLastIndex?.(s=>nessie.x>=s.x)??0);if(section!==V70.shadow.section){V70.shadow.section=section;const label=SHADOW_SECTIONS[section]?.name;if(label)showRewardBanner('clear',label,section===2?'CRAB MARKET · ABSOLUTELY TOO MANY CRABS':'SHADOW CRAB KINGDOM');}if(!leap.active&&nessie.x>7020&&!V70.shadow.checkpointReached){V70.shadow.checkpointReached=true;checkpoint=7098;health=5;flash('♥ Royal Market checkpoint');if(mode==='sarah')openDialogue?.('shadow-checkpoint');}
 for(const e of enemies)if(e.hp>0)updateShadowEnemy(e,dt);updateShadowBoss(dt);updateShadowProjectiles(dt);
 for(const s of V70.shadow.switches)if(!s.on&&V70.bubbleProjectiles.some(p=>p.life>0&&Math.hypot(p.x-s.x,p.y-s.y)<48)){s.on=true;const secret=V70.shadow.secrets[V70.shadow.switches.indexOf(s)];if(secret)secret.open=true;score+=150;rewardPopup(s.x,s.y-45,'SECRET! +150','treasure','#fff0ad',1.1);}
 const duo=V70.shadow.duo;if(duo?.victoryReady){duo.winTime+=dt;if(duo.winTime>1.8&&Math.hypot(nessie.x-(W-170),nessie.y-540)<115)beginShadowKingdomExit();}
 if(particles.length>V70.caps.particles)particles.splice(0,particles.length-V70.caps.particles);return true;
}

function drawShadowCrabBackdrop(t){if(typeof shadowScene751!=='undefined'&&shadowScene751.complete&&shadowScene751.naturalWidth)return;
 if(!isShadowCrabKingdom())return;const line=waterSurface();ctx.save();const shade=ctx.createLinearGradient(0,line,0,H);shade.addColorStop(0,'#18245b78');shade.addColorStop(.5,'#1a124b9a');shade.addColorStop(1,'#080f2bd8');ctx.fillStyle=shade;ctx.fillRect(0,line,vw,H-line);
 for(let i=0;i<10;i++){const x=((i*310-camera*.18)%(vw+340)+vw+340)%(vw+340)-170,y=380+(i%4)*115;ctx.globalAlpha=.08;ctx.fillStyle=i%2?'#b68cff':'#5eeeff';ctx.beginPath();ctx.arc(x,y,65+i%3*18,0,Math.PI*2);ctx.fill();}
 for(const d of V70.shadow.decor){const x=d.x-camera;if(x<-160||x>vw+160)continue;ctx.globalAlpha=.4;ctx.strokeStyle=d.kind%2?'#775f9f':'#547b91';ctx.fillStyle=d.kind%3?'#223969':'#49395f';ctx.lineWidth=4;if(d.kind%4===0){ctx.beginPath();ctx.arc(x,d.y,42,Math.PI,Math.PI*2);ctx.lineTo(x,d.y+38);ctx.closePath();ctx.fill();ctx.stroke();}else{ctx.beginPath();ctx.moveTo(x-35,d.y);ctx.quadraticCurveTo(x,d.y-100,x+35,d.y);ctx.stroke();ctx.beginPath();ctx.arc(x,d.y-65,18,0,Math.PI*2);ctx.stroke();}}
 ctx.globalAlpha=1;ctx.restore();
}
function crabPalette(kind){return kind==='shadow'?['#157199','#6a4aa0','#c7a6ff']:kind==='armoured'?['#4b4669','#7f7ca0','#ece6ff']:kind==='bubble'?['#315c73','#58aec6','#c7ffff']:kind==='spear'?['#6d4c50','#c5786a','#ffe1b5']:kind==='guard'?['#3b526e','#668cae','#d8f5ff']:['#7d5264','#c47e8f','#ffe0d3'];}
function drawShadowCrabEnemy(e,t){
 if(e.state==='buried'){const x=e.x-camera;if(x<-80||x>vw+80)return;ctx.save();ctx.strokeStyle='#776a8a';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,e.y+23,36,11,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffdf77';ctx.beginPath();ctx.arc(x-8,e.y+8,3,0,Math.PI*2);ctx.arc(x+8,e.y+8,3,0,Math.PI*2);ctx.fill();ctx.restore();return;}
 if(drawCreature731({...e,kind:'pearl-crab',clock:t+e.phase},t)){if(e.guardUp){ctx.save();ctx.strokeStyle='#b7e9ff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(e.x-camera-55,e.y,32,-1.3,1.3);ctx.stroke();ctx.restore();}return;}
 const x=e.x-camera;if(x<-100||x>vw+100)return;const [dark,mid,hi]=crabPalette(e.shadowKind),bob=reducedMotion?0:Math.sin(t*4+e.phase)*3,tele=e.state==='telegraph';ctx.save();ctx.translate(x,e.y+bob);ctx.scale(e.dir||1,1);if(e.recoil)ctx.rotate(Math.sin(e.recoil*40)*.08);ctx.shadowColor=e.shadowKind==='shadow'?'#9d6cff':'#0000';ctx.shadowBlur=e.shadowKind==='shadow'?14:0;
 ctx.strokeStyle=hi;ctx.lineWidth=4;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*20,8);ctx.lineTo(side*52,22+Math.sin(t*5+side)*5);ctx.stroke();ctx.beginPath();ctx.moveTo(side*25,-4);ctx.lineTo(side*56,-34);ctx.stroke();ctx.beginPath();ctx.arc(side*62,-38,17,.45,Math.PI*1.55);ctx.stroke();}
 const g=ctx.createLinearGradient(-38,-30,38,34);g.addColorStop(0,hi);g.addColorStop(.32,mid);g.addColorStop(1,dark);ctx.fillStyle=g;ctx.strokeStyle=hi;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,2,e.shadowKind==='armoured'?43:37,e.shadowKind==='armoured'?30:25,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
 for(const side of [-1,1]){ctx.fillStyle='#fff4d8';ctx.beginPath();ctx.arc(side*13,-26,7,0,Math.PI*2);ctx.fill();ctx.fillStyle=e.shadowKind==='shadow'?'#ffe147':'#24304d';ctx.beginPath();ctx.arc(side*13+(e.dir||1)*2,-27,3,0,Math.PI*2);ctx.fill();}
 ctx.strokeStyle=tele?'#fff2a0':'#e7d6ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,2,19,.35,Math.PI-.35);ctx.stroke();if(e.shadowKind==='guard'&&e.guardUp){ctx.strokeStyle='#b7e9ff';ctx.lineWidth=7;ctx.beginPath();ctx.arc(-54,0,30,-1.25,1.25);ctx.stroke();}if(e.chargeCue){ctx.strokeStyle='#ffcf89';ctx.setLineDash([7,7]);ctx.beginPath();ctx.moveTo(54,0);ctx.lineTo(170,0);ctx.stroke();ctx.setLineDash([]);}ctx.restore();
}
function drawShadowProjectile(p,t){const x=p.x-camera;if(x<-70||x>vw+70)return;ctx.save();ctx.translate(x,p.y);const spin=reducedMotion?0:p.age*5;if(p.type==='dark-bubble'){const g=ctx.createRadialGradient(-5,-6,2,0,0,20);g.addColorStop(0,'#fff');g.addColorStop(.22,'#b788ff');g.addColorStop(.75,'#248474');g.addColorStop(1,'#160d3b');ctx.fillStyle=g;ctx.strokeStyle='#dcc5ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,18,0,Math.PI*2);ctx.fill();ctx.stroke();}else if(p.type==='coral-shard'){ctx.rotate(Math.atan2(p.vy,p.vx));ctx.fillStyle='#ff9a86';ctx.strokeStyle='#ffe6c2';ctx.beginPath();ctx.moveTo(23,0);ctx.lineTo(-18,-9);ctx.lineTo(-8,0);ctx.lineTo(-18,9);ctx.closePath();ctx.fill();ctx.stroke();}else if(p.type==='water-ring'){ctx.strokeStyle='#9bf3ff';ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,24+Math.sin(spin)*4,0,Math.PI*2);ctx.stroke();}else{ctx.rotate(spin);ctx.fillStyle='#d4b3e8';ctx.strokeStyle='#fff1d5';ctx.beginPath();ctx.arc(0,0,18,Math.PI,Math.PI*2);ctx.lineTo(0,13);ctx.closePath();ctx.fill();ctx.stroke();}ctx.restore();}
function drawShadowDolphin(d,t){t=reducedMotion?0:boss?.clock||0;const x=d.x-camera;if(x<-180||x>vw+180)return;ctx.save();ctx.translate(x,d.y);ctx.scale(d.facing83||Math.sign(d.vx||1),1);ctx.rotate(d.pitch83||0);const g=ctx.createLinearGradient(-70,-35,75,35);g.addColorStop(0,'#c8f7ff');g.addColorStop(.35,'#5fbfdd');g.addColorStop(1,'#3756a8');ctx.fillStyle=g;ctx.strokeStyle='#e8ffff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-70,0);ctx.quadraticCurveTo(-30,-48,35,-25);ctx.quadraticCurveTo(75,-12,82,0);ctx.quadraticCurveTo(45,11,18,28);ctx.quadraticCurveTo(-28,42,-70,0);ctx.fill();ctx.stroke();ctx.save();ctx.translate(-60,0);ctx.rotate(reducedMotion?0:Math.sin(t*4.4)*.16);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-34,-27);ctx.lineTo(-23,2);ctx.lineTo(-38,28);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.translate(5,18);ctx.rotate(reducedMotion?0:Math.sin(t*4.4-.9)*.12);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-21,37);ctx.lineTo(20,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(48,-15,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#253b64';ctx.beginPath();ctx.arc(51,-16,3,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#253b64';ctx.lineWidth=2;ctx.beginPath();ctx.arc(59,-3,14,.2,1.4);ctx.stroke();if(d.stun>0){ctx.fillStyle='#fff0a0';ctx.font='24px sans-serif';for(let i=0;i<3;i++)ctx.fillText('✦',-5+i*25,-65-Math.sin(t*5+i)*8);}ctx.restore();}
function drawShadowBoss(t){const duo=V70.shadow.duo;if(!duo)return;if(boss?.hp>0)drawShadowCrabEnemy({kind:'pearl-crab',shadowKind:'shadow',renderScale:1.7,x:boss.x,y:boss.y,dir:nessie.x<boss.x?-1:1,phase:4,state:boss.vulnerable?'telegraph':'approach',recoil:boss.hitCooldown>0?.18:0,guardUp:!boss.vulnerable},t);if(duo.dolphin.hp>0||duo.dolphin.stun>0)drawShadowDolphin(duo.dolphin,t);}
function drawShadowCrabKingdom(t){
 if(!isShadowCrabKingdom())return;for(const o of obstacles){const x=o.x-camera;if(drawTextureBarrier75(o,x,t))continue;if(x>vw+80||x+o.w<-80)continue;ctx.save();ctx.translate(x,o.y);const g=ctx.createLinearGradient(0,0,o.w,o.h);g.addColorStop(0,'#4f4d78');g.addColorStop(1,'#1e294b');ctx.fillStyle=g;ctx.strokeStyle='#7b82aa';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(0,0,o.w,o.h,32);ctx.fill();ctx.stroke();ctx.restore();}
 for(const s of V70.shadow.switches){const x=s.x-camera;if(x<-80||x>vw+80)continue;ctx.save();ctx.translate(x,s.y);ctx.shadowColor=s.on?'#8fffee':'#c59cff';ctx.shadowBlur=16;ctx.fillStyle=s.on?'#9ffff0':'#7657a7';ctx.strokeStyle='#efffff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='17px sans-serif';ctx.textAlign='center';ctx.fillText(s.on?'✓':'🫧',0,6);ctx.restore();}
 for(const e of enemies)if(e.hp>0)drawShadowCrabEnemy(e,t);for(const p of projectiles)drawShadowProjectile(p,t);drawShadowBoss(t);
 if(V70.shadow.duo?.victoryReady){drawOrnatePortal(W-170-camera,540,260,t,true);ctx.save();ctx.fillStyle='#dfffff';ctx.font='900 15px Nunito,sans-serif';ctx.textAlign='center';ctx.fillText('CURRENT TO THE SURFACE',W-170-camera,390);ctx.restore();}
}

function installV70Dialogue(){
 if(typeof conversations==='undefined')return;
 Object.assign(conversations,{
  'bubble-unlock':{speaker:'Mermaid Magic',portrait:'sarah',line:'A glowing pearl drifts from Carlo’s shell and spins around Sarah Maria. The water answers with a thousand tiny bubbles.\n\nNEW MERMAID POWER: MERMAID BUBBLE!',options:[['Bubble time!','The first Mermaid Power is awake. Aim, fire, and make those bubbles count!'],['Did Carlo just give me magic?','Carlo: I prefer “accidentally surrendered a highly prestigious aquatic artefact.”']],hint:'Press F on desktop or tap BUBBLE on touch controls. Mermaid Bubble is now permanent.'},
  'shadow-intro':{speaker:'Sarah Maria',portrait:'sarah',line:'The reef opens beneath Carlo’s arena. Ancient crab statues stare up from a purple-blue kingdom far below.',options:[['There are crabs EVERYWHERE.','A tiny crab drops its shield, looks embarrassed, then picks it up again.'],['Good thing I just learned Bubble.','Exactly. This kingdom is the perfect place to try your first Mermaid Power.']],hint:'Use Mermaid Bubble on enemies, hostile projectiles, glowing shell switches and fragile secrets.'},
  'shadow-checkpoint':{speaker:'Royal Crab Sign',portrait:'carlo.png',line:'WELCOME TO THE ROYAL MARKET. NO RUNNING. NO BUBBLES. NO ASKING WHY THE GUARD IS ASLEEP.',options:[['That seems suspiciously specific.','The sleeping guard snores one tiny bubble.'],['I will absolutely use bubbles.','The sign has no legal response prepared.']],hint:'Checkpoint reached. Bubble Rush is nearby — it triples your firing rate for a short burst.'},
  'shadow-boss':{speaker:'Duke Claw & Flip',portrait:'carlo.png',line:'Duke Claw: HALT!\nFlip the Dolphin: He rehearsed that all morning.\nDuke Claw: FLIP!',options:[['You two seem very organised.','Flip: Give it thirty seconds.'],['Is the dolphin evil?','Flip: I prefer “freelance mischief consultant.”']],hint:'Duke Claw controls space; Flip moves fast. Their team attacks can collide. Use Bubble to pop projectiles and punish dizzy openings.'},
  'shadow-win':{speaker:'Flip the Dolphin',portrait:'miguel.png',line:'Duke Claw is down. Flip circles once, gets dizzy, and decides his freelance villain contract has officially expired.',options:[['Friends now?','Flip: I am willing to discuss snacks.'],['Tell the crabs to behave.','Flip: I can promise at least twelve percent better behaviour.']],hint:'The rising current is open. Swim right to return to the main adventure.'}
 });
}

function retryShadowCrabKingdom(){const cp=V70.shadow.checkpointReached?7098:220;const reached=V70.shadow.checkpointReached;setupShadowCrabKingdom();V70.shadow.checkpointReached=reached;checkpoint=cp;nessie.x=cp;nessie.y=520;health=5;invincible=2;projectiles=[];V70.bubbleProjectiles=[];state='playing';keys.clear();$('overlay').style.display='none';canvas.focus();hud();flash('Back at the Shadow Kingdom checkpoint. Bubble up!');}
function updateShadowHud(){if(!isShadowCrabKingdom())return false;const duo=V70.shadow.duo,active=!!(boss?.active&&!duo?.victoryReady);$('boss-hud').style.display=active?'flex':'none';if(active&&duo){$('boss-name').textContent='Duke Claw  +  Flip the Dolphin';const combined=((boss.hp/boss.max)+(duo.dolphin.hp/duo.dolphin.max))*.5;$('boss-health').style.width=(combined*100)+'%';const opening=boss.vulnerable||duo.dolphin.stun>0;setIconCue($('boss-cue'),opening?'boost':'shield',opening?'Dizzy opening — Bubble or Boost now':'Duo guarded — dodge and create a collision');$('boss-hud').classList.toggle('vulnerable',opening);}const open=!!duo?.victoryReady;setIconCue($('coin-progress'),open?'portal':'compass',open?'Ride the rising current':'Explore the kingdom and reach the royal chamber');$('coin-progress').classList.add('quest-text');$('coin-progress-fill').style.width=Math.min(100,nessie.x/W*100)+'%';return true;}
function v70ResetForNewRun(){
 V70.bubbleProjectiles=[];V70.bubbleCooldown=0;V70.bubbleRush=0;V70.attackPulse=0;V70.unlock={active:false,time:0,targets:[],shots:0,finished:false,dialogueShown:false};V70.shadow.active=false;V70.shadow.complete=false;V70.shadow.transition='';syncBubbleUi();
}

ensureBubbleControls();
