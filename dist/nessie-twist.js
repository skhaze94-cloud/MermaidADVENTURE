'use strict';
// Sarah's crown subplot is separate from Nessie's playable side quest and time trials.
let nessieTwist=null;
function isNessieFinal(){return mode==='sarah'&&stage===3&&!!nessieTwist;}
function installNessieDialogue(){const c=(line,options)=>({speaker:'Nessie',portrait:'nessie.png',line,options,hint:''});
 conversations['nessie-meet']=c('Psst! Sarah! King Daddy says you are ready. I have a very important, very normal quest.\nSarah: Why are you whispering?\nNessie: Borrow Rana’s crown. I need to measure how shiny it is. For… science.',[
 ['That sounds suspicious.','Only scientifically suspicious! Take this pocket current.\nSarah: You put a current in your pocket?\nNessie: Waterproof pockets. Very exclusive.'],
 ['Why Rana’s crown?','It allegedly controls every current in the lagoon.\nSarah: And you just want to measure it?\nNessie: Precisely! No follow-up questions.'],
 ['All right. No funny business.','Absolutely. Serious business only. Extremely shiny, serious business.']]);
 conversations['nessie-crown']=c('There you are! You actually got Rana’s crown!\nSarah: Your very normal quest is finished.\nNessie: Do you mind just passing me that crown for a second? I just want to see how shiny it is.',[
 ['One second. Then give it back.','One tiny second…\n(Nessie slips the crown onto his head.)\nNessie: Hehehe! Now I shall rule EVERY current!\nSarah: I KNEW those pockets were suspicious!'],
 ['Promise you won’t do anything weird?','I promise to do something SPECTACULARLY weird!\n(Nessie puts on the crown. The water begins to spiral.)\nNessie: ALL HAIL KING NESSIE!\nSarah: Oh, for the love of seashells.']]);
 conversations['nessie-win']=c('My crown! My empire! My extremely waterproof pockets!\nSarah: You were supposed to measure it, not become it.',[
 ['Give the crown back.','Fine. Being king was surprisingly exhausting.\nSarah: Next time, just ask to join the adventure.\nNessie: Can I be in charge of snacks?'],
 ['You owe everyone an apology.','Sorry about the whole takeover thing. And the whirlpools. And the evil laugh.\nSarah: Especially the evil laugh.\nNessie: I practised that for WEEKS.']]);
 conversations['final-boss-win'].hint='Rana’s crown is yours… but someone is waiting.';
 conversations.final.line='Sarah returned the crown, stopped Nessie’s ridiculous takeover, and saved the lagoon. NOW the party can begin!';
 conversations.final.options=[['Everyone gets a second chance.','Nessie: And a second helping?\nSarah: You are on snack duty.\nFrog DJ: Drop the beat!'],['No more magical crowns.','Fifi: What about fashionable hats?\nSarah: Fashionable hats are fine.\nNessie: Waterproof hats?\nSarah: I’m watching you.']];
}
function updateNessieMeeting(){if(mode!=='sarah'||stage!==0||nessie.x<330||dialogueSeen.has('nessie-meet'))return false;return openDialogue('nessie-meet',()=>{boostUnlimited=Math.max(boostUnlimited,9);energy=1;flash('Nessie’s pocket current');});}
function beginNessieFinal(){if(mode!=='sarah'||nessieTwist)return;nessieTwist={phase:'arrival',time:0,total:0,sequence:0,rings:[],ready:false};globalThis.ranaExitExpanded=false;projectiles=[];finalHazards=[];enemies=[];obstacles=[];coins=coins.filter(c=>c.x<2700);resetLeap();health=5;energy=1;invincible=3;checkpoint=2820;nessie.x=2920;nessie.y=600;nessie.vx=0;nessie.vy=0;boss={name:'Nessie · The Crown Thief',x:3750,y:510,hp:7,max:7,active:false,vulnerable:false,clock:0,hitCooldown:0};$('stage-name').textContent='The Crown Thief';$('objective-label').textContent='ONE LAST SURPRISE';if($('rana-pips'))$('rana-pips').innerHTML='';}
function nessieNext(phase){const n=nessieTwist;n.phase=phase;n.time=0;n.shot=0;n.origin={x:boss.x,y:boss.y};n.target={x:clamp(nessie.x,2790,3480),y:clamp(nessie.y,390,795)};boss.vulnerable=phase==='open';if(phase==='open'){projectiles=[];n.rings=[];tone(700,.16);}if(phase==='charge')n.attack=['volley','rush','wave'][n.sequence++%3];}
function updateNessieFinal(dt){const n=nessieTwist;n.time+=dt;n.total+=dt;boss.clock+=dt;boss.hitCooldown=Math.max(0,boss.hitCooldown-dt);if(!n.ready)nessie.x=clamp(nessie.x,2730,3650);
 if(n.phase==='arrival'){boss.x=3750-470*smoothUnit(clamp(n.time/2.8,0,1));boss.y=510+Math.sin(n.time*2)*18;if(n.time>=2.8){nessieNext('wait');if(!openDialogue('nessie-crown',()=>nessieNext('transform')))nessieNext('transform');}return;}
 if(n.phase==='wait')return;
 if(n.phase==='transform'){if(n.time>=2.8){boss.active=true;invincible=1;nessieNext('charge');}return;}
 if(n.phase==='defeated'){boss.y+=dt*20;if(n.time>2.8&&!n.ready){n.ready=true;setupRanaExitCorridor();openDialogue('nessie-win');}return;}
 const enraged=boss.hp<=3;
 if(n.phase==='charge'){boss.x+=(3290-boss.x)*dt*2;boss.y+=(n.target.y-boss.y)*dt*2;if(n.time>1.25)nessieNext(n.attack);}
 else if(n.phase==='volley'){n.shot-=dt;if(n.shot<=0){const spread=enraged?[-.48,-.24,0,.24,.48]:[-.36,0,.36];spread.forEach(a=>shoot(boss.x-80,boss.y,250,a,'pearl','straight'));n.shot=.7;}if(n.time>1.5)nessieNext('open');}
 else if(n.phase==='rush'){const u=clamp(n.time/1.5,0,1),travel=Math.sin(u*Math.PI);boss.x=n.origin.x+(2790-n.origin.x)*travel;boss.y=n.origin.y+(n.target.y-n.origin.y)*travel;if(n.time>=1.5)nessieNext('open');}
 else if(n.phase==='wave'){if(!n.shot){n.shot=1;n.rings.push({x:boss.x,y:boss.y,r:45,gap:Math.atan2(nessie.y-boss.y,nessie.x-boss.x),width:enraged?.6:.8});}if(n.time>2.6)nessieNext('open');}
 else if(n.phase==='open'){boss.y+=Math.sin(n.total*2)*dt*12;if(n.time>3)nessieNext('charge');}
 else if(n.phase==='stagger'&&n.time>.85)nessieNext('charge');
 for(const r of n.rings){r.r+=dt*240;const d=Math.hypot(nessie.x-r.x,nessie.y-r.y),a=Math.atan2(nessie.y-r.y,nessie.x-r.x);if(Math.abs(d-r.r)<23&&Math.abs(ranaAngle(a-r.gap))>r.width&&dashTime<=0)hurt(r.x);}n.rings=n.rings.filter(r=>r.r<1050);
 if(Math.hypot(nessie.x-boss.x,nessie.y-boss.y)<145&&boss.hitCooldown<=0){if(boss.vulnerable&&dashTime>0){boss.hp--;score+=450;bossLeapReady=true;boss.hitCooldown=1;invincible=1;dashTime=0;bossImpact(boss);projectiles=[];n.rings=[];nessieNext(boss.hp>0?'stagger':'defeated');if(boss.hp<=0){score+=2400;boss.active=false;}else if(boss.hp===4||boss.hp===2)powerups.push({x:2940,y:690,type:'heart',phase:0,taken:false});}else if(!boss.vulnerable&&n.phase!=='stagger')hurt(boss.x);}
}
function drawNessieGuest(x,y,t,size=260,crowned=false){if(drawBossV4('nessie',x-camera,y,size,t,crowned?(nessieTwist?.phase||'idle'):'friendly'))return;ctx.save();ctx.translate(x-camera,y);ctx.scale(-1,1);ctx.rotate(reducedMotion?0:Math.sin(t*1.7)*.045);if(crowned){ctx.shadowColor='#ce95ff';ctx.shadowBlur=25;}drawLivingHero(sprite,size,size*154/230,reducedMotion?0:t*3,crowned?1.2:.4);ctx.shadowBlur=0;
 if(crowned){ctx.strokeStyle='#534270';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(size*.255,-size*.237);ctx.lineTo(size*.295,-size*.222);ctx.stroke();}
 if(crowned){ctx.translate(size*.29,-size*.3);ctx.rotate(-.12);const g=ctx.createLinearGradient(0,-35,0,12);g.addColorStop(0,'#fff6bc');g.addColorStop(.5,'#ffc252');g.addColorStop(1,'#a95835');ctx.fillStyle=g;ctx.strokeStyle='#fff1bc';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-31,10);ctx.lineTo(-35,-23);ctx.lineTo(-15,-10);ctx.lineTo(0,-37);ctx.lineTo(15,-10);ctx.lineTo(35,-23);ctx.lineTo(31,10);ctx.closePath();ctx.fill();ctx.stroke();for(const x of [-19,0,19]){ctx.fillStyle=x?'#7ef6df':'#e694ff';ctx.beginPath();ctx.ellipse(x,0,4,6,0,0,Math.PI*2);ctx.fill();}}ctx.restore();}
function drawNessieSubplot(t){if(mode!=='sarah')return;
 if(stage===0&&nessie.x<1100){const x=650+(dialogueSeen.has('nessie-meet')?Math.min(200,elapsed*8):0);drawNessieGuest(x,440+Math.sin(t*1.8)*14,t);if(!dialogueSeen.has('nessie-meet'))drawFamilyBubble(x,310,'Psst! A very normal quest…',t);}
 if(!isNessieFinal())return;const n=nessieTwist,crowned=!['arrival','wait','defeated'].includes(n.phase),x=boss.x-camera,y=boss.y;
 ctx.save();ctx.beginPath();ctx.rect(0,waterSurface(),vw,H-waterSurface());ctx.clip();const shade=ctx.createLinearGradient(0,waterSurface(),0,H);shade.addColorStop(0,'#27205d00');shade.addColorStop(1,'#27154155');ctx.fillStyle=shade;ctx.fillRect(0,waterSurface(),vw,H);if(n.phase==='rush'){for(let i=1;i<5;i++){ctx.globalAlpha=.12/i;drawNessieGuest(boss.x+i*35,boss.y,t-i*.07,340,true);}ctx.globalAlpha=1;}
 if(n.phase==='transform'){const u=clamp(n.time/2.8,0,1);for(let i=0;i<3;i++){ctx.strokeStyle='#e7b9ff88';ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,60+((u*400+i*100)%360),0,Math.PI*2);ctx.stroke();}}
 for(const r of n.rings){ctx.strokeStyle='#b594ff55';ctx.lineWidth=22;ctx.beginPath();ctx.arc(r.x-camera,r.y,r.r,r.gap+r.width,r.gap+Math.PI*2-r.width);ctx.stroke();ctx.strokeStyle='#e9ceff';ctx.lineWidth=4;ctx.stroke();}
 if(n.phase==='charge'){drawCueBadge(x,y-180,'warning',false,t);if(n.attack==='rush'){ctx.strokeStyle='#ffd89899';ctx.lineWidth=3;ctx.setLineDash([10,12]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(2790-camera,n.target.y);ctx.stroke();ctx.setLineDash([]);}}
 if(boss.vulnerable){ctx.strokeStyle='#9fffd9';ctx.lineWidth=5;ctx.shadowColor='#72ffc6';ctx.shadowBlur=20;ctx.beginPath();ctx.ellipse(x,y,175,130,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;drawCueBadge(x,y-175,'boost',true,t);}
 ctx.restore();drawNessieGuest(boss.x,boss.y,t,n.phase==='transform'?260+80*smoothUnit(clamp(n.time/2.8,0,1)):crowned?340:260,crowned);
}
