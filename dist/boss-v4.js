'use strict';
// Big Boss Update: detached painted parts, hierarchical joints and blended poses.
const BOSS_V4_IMAGES=[];
const BOSS_V4_RIGS=new Map();
let bossV4Crops=[];
function initializeBossV4(){for(const name of ['boss-wild-parts','boss-sea-parts','boss-royal-parts','boss-spell-parts']){const art=new Image();art.src='assets/'+name+'.webp';BOSS_V4_IMAGES.push(art);}}
function bossV4Ready(atlas){return !!(BOSS_V4_IMAGES[atlas]?.complete&&BOSS_V4_IMAGES[atlas]?.naturalWidth&&bossV4Crops[atlas]);}
function bossPart(atlas,tile,x,y,w,h,angle=0,flip=1){const art=BOSS_V4_IMAGES[atlas],c=bossV4Crops[atlas]?.[tile];if(!art?.naturalWidth||!c)return;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(flip,1);ctx.drawImage(art,...c,-w/2,-h/2,w,h);ctx.restore();}
function bossBone(atlas,tile,x,y,length,width,angle,flip=1){const end={x:x+Math.cos(angle)*length,y:y+Math.sin(angle)*length};const horizontal=(atlas===0&&[6,7,13,14].includes(tile))||(atlas===1&&[14,15].includes(tile));bossPart(atlas,tile,(x+end.x)/2,(y+end.y)/2,horizontal?length+width*.45:width,horizontal?width:length+width*.28,horizontal?angle:angle-Math.PI/2,flip);return end;}
function bossArm(atlas,base,x,y,a,b,c,upper=55,lower=49,hand=true){const elbow=bossBone(atlas,base,x,y,upper,31,a),wrist=bossBone(atlas,base+1,elbow.x,elbow.y,lower,26,a+b);if(hand)bossPart(atlas,base+2,wrist.x,wrist.y+8,30,35,a+b+c-Math.PI/2);return wrist;}
// Pose clocks are per character; analytic springs retain velocity across attack transitions.
const BOSS_STYLE83={carlo:{speed:11,phase:.3},miguel:{speed:7,phase:1.4},rana:{speed:10,phase:2.2},daddy:{speed:8,phase:.8},queen:{speed:7,phase:1.8},nessie:{speed:9,phase:2.8}};
function bossRigPose(kind,t,stateName='idle'){
 const style=BOSS_STYLE83[kind]||BOSS_STYLE83.rana;let rig=BOSS_V4_RIGS.get(kind);
 if(!rig){rig={last:t,tick:t,pose:stateName,age:0,values:{lift:0,bend:0,reach:0,fold:0,tilt:0,kick:0,energy:0,head:0,staff:0},velocity:{}};BOSS_V4_RIGS.set(kind,rig);}
 const historical=t<rig.last,dt=state==='paused'||historical?0:clamp(t-rig.last,0,.1);rig.last=Math.max(rig.last,t);rig.tick+=dt;
 if(state!=='paused'&&!historical&&rig.pose!==stateName){rig.pose=stateName;rig.age=0;}else rig.age+=dt;
 const name=rig.pose.toLowerCase(),time=reducedMotion?0:rig.tick;
 const charge=/charge|prepare|command/.test(name),release=/volley|release|strike|snap|sweep|burst|bolt|fan|wave|crown|bloom|whirl|shockwave|retaliation/.test(name)&&!charge;
 const rush=/lunge$|rush|bellyflop|daddash/.test(name),stun=/stagger|vulnerable|^open$/.test(name),dead=/defeated/.test(name),greeting=/teach|welcome|arrival|celebrate/.test(name);
 const impact=release?Math.exp(-rig.age*5):0;
 const goal={lift:charge?1:release?.45+impact*.25:greeting?.65:stun?-.35:0,bend:charge?.9:release?-.35-impact*.25:stun?.6:.15,reach:release?.65+impact*.35:rush?.8:0,fold:rush?1:charge?.4:0,tilt:rush?-.13:dead?.2:stun?.09:release?-.025*impact:0,kick:rush?1:charge?-.35:0,energy:charge?.75:release?1:0,head:charge?-.07:stun?.12:release?-.03*impact:0,staff:charge?.18:release?-.32:rush?.28:0};
 for(const k of Object.keys(goal)){if(reducedMotion){rig.values[k]=goal[k];rig.velocity[k]=0;continue;}const omega=style.speed*(release?1.5:1),offset=rig.values[k]-goal[k],v=rig.velocity[k]||0,c=v+omega*offset,e=Math.exp(-omega*dt);rig.values[k]=goal[k]+(offset+c*dt)*e;rig.velocity[k]=(v-omega*c*dt)*e;}
 return {...rig.values,t:time,phase:style.phase,impact,dead,stun,charge,release,rush};
}
function bossSpell(tile,x,y,size,t,alpha=1){if(!bossV4Ready(3))return;ctx.save();ctx.globalAlpha*=alpha;bossPart(3,tile,x,y,size,size,reducedMotion?0:Math.sin(t*1.7)*.12);ctx.restore();}
function drawBossV4(kind,x,y,size,t,pose='idle',mirror=false){if(x+size*1.5<0||x-size*1.5>vw||y+size*1.5<0||y-size*1.5>H)return true;const atlas={rana:0,nessie:0,carlo:1,miguel:1,daddy:2,queen:2}[kind];if(!bossV4Ready(atlas))return false;const p=bossRigPose(kind,t,pose),tick=p.t,scale=size/(kind==='daddy'||kind==='queen'?340:320);ctx.save();ctx.translate(x,y);ctx.scale(scale*(mirror?-1:1),scale);const hit=kind==='daddy'?(training?.hit||0):kind==='queen'?(queen?.hit||0):kind==='rana'?(rana?.recoil||0):(boss?.hitCooldown||0);ctx.rotate(p.tilt+Math.sin(tick*.9)*.018+(reducedMotion?0:Math.sin(tick*22)*hit*.035));if(pose==='whirl')ctx.scale(.45+.55*Math.abs(Math.cos(tick*5)),1);ctx.translate(0,Math.sin(tick*1.7)*3);const wave=(phase,speed=2)=>Math.sin(tick*speed+phase+p.phase);
 if(kind==='carlo'){
  // Three hip/knee pairs on each side and two independent shoulder/elbow claws.
  for(const side of [-1,1])for(let leg=0;leg<3;leg++){const a=(side<0?2.55:.6)+side*(leg-.8)*.22+wave(leg*1.9+(side<0?Math.PI:0),5)*.18,knee=bossBone(1,6,side*48,20+leg*10,54,20,a);bossBone(1,7,knee.x,knee.y,56,16,Math.PI/2+side*.42+wave(leg*1.9+1,5)*.28);}
  for(const side of [-1,1]){const a=side<0?-2.6:-.54;
   const elbow=bossBone(1,2,side*66,-18,57,38,a+side*p.lift*.5),wrist=bossBone(1,3,elbow.x,elbow.y,58,32,a+side*(.7+p.bend*.5));bossPart(1,4,wrist.x,wrist.y,76,82,-side*.4);bossPart(1,5,wrist.x+side*21,wrist.y-24,35,63,side*(.3+Math.max(0,wave(side,3))*.25+(p.charge?.5:0)-p.impact*.22));if(p.energy>.1)bossSpell(0,wrist.x,wrist.y-45,39,tick,p.energy*.8);}
  bossPart(1,0,0,15,175,115);bossPart(1,1,0,-57,142,134,wave(0,1.2)*.03+p.head);
 }else if(kind==='miguel'){
  const tail=bossBone(1,14,0,35,92,40,Math.PI/2+wave(0,2)*.2);bossBone(1,15,tail.x,tail.y,105,30,Math.PI/2+wave(-1,2)*.45);
  for(const side of [-1,1]){const flap=wave(side*.3,2.7)*(p.rush?.23:.38),inner=side<0?12:10,outer=side<0?13:11;ctx.save();ctx.translate(side*29,-5);ctx.rotate(side*(flap-p.fold*.35));bossPart(1,inner,side*56,0,136,140);ctx.translate(side*108,4);ctx.rotate(side*(wave(-.8+side*.3,2.7)*.40-p.fold*.25-p.reach*.12));bossPart(1,outer,side*45,0,114,120);ctx.restore();}
  bossPart(1,8,0,0,119,167);bossPart(1,9,0,-56,112,86,p.head);if(p.energy>.15)bossSpell(1,-16,-50,50,tick,p.energy);
 }else if(kind==='rana'){
  // Eight textured tentacles: four serial joints per appendage, phase-delayed tips.
  for(const side of [-1,1])for(let tentacle=0;tentacle<4;tentacle++){let point={x:side*(50+tentacle*9),y:15+tentacle*18};for(let joint=0;joint<4;joint++){const a=(side<0?2.9:.24)+side*(wave(tentacle*.9-joint*.7,1.7)*.3+joint*.23-p.lift*.32+p.fold*joint*.07-p.reach*.12),length=34+tentacle*3;point=bossBone(0,joint===3?7:6,point.x,point.y,length,20-joint*3,a);}if(p.energy>.3)bossSpell(7,point.x,point.y,24,tick+tentacle,p.energy*.7);}
  for(const side of [-1,1]){const hip=bossBone(0,4,side*48,44,62,59,side<0?2.55+p.kick*.4:.6-p.kick*.4);bossBone(0,5,hip.x,hip.y,60,48,Math.PI/2+side*(.55+wave(side,2)*.12-p.kick*.5));}
  bossPart(0,0,0,6,183,177);for(const side of [-1,1]){const a=Math.PI/2-side*(.7+p.lift*.9-wave(side,1.9)*.1),elbow=bossBone(0,2,side*65,-30,54,40,a);bossRanaForearm(elbow.x,elbow.y,65,41,a-side*(.6+p.bend*.6),side*(p.reach*.25+wave(side,2)*.08));}
  bossPart(0,1,-33,-85,164,133,p.head+wave(0,1.3)*.018);
  if(p.energy>.1){const laser=/laser|disco|retaliation/i.test(pose);if(laser){for(const eye of [-73,-8])bossSpell(7,eye,-85,45+p.energy*18,tick,p.energy);}else bossSpell(/acid/.test(pose)?4:/seed/.test(pose)?6:5,-61,-44,48+p.energy*14,tick,p.energy);}
 }else if(kind==='daddy'||kind==='queen'){
  const base=kind==='daddy'?0:8,daddy=kind==='daddy';if(daddy&&isTraining()){drawTutorialDaddyRig85(pose,p,tick,x);ctx.restore();return true;}if(daddy&&p.rush)ctx.scale(1.08,.94);
  const tailAngle=Math.PI/2+wave(0,daddy?2.2:1.6)*(daddy?.24:.17)+(daddy?p.kick*.32:0),tail=bossBone(2,base+5,0,25,91,88,tailAngle);bossPart(2,base+6,tail.x+wave(-1,daddy?2.2:1.6)*(daddy?22:16),tail.y+36,124,90,wave(-1.2,daddy?2.1:1.6)*(daddy?.32:.23)+p.kick*.18);
  // Each arm is a three-node chain: shoulder → elbow → wrist, with stronger pose silhouettes for Daddy's named tutorial moves.
  for(const side of [1,-1]){const daddyReach=daddy?(p.reach*.22+p.kick*.12):0,a=Math.PI/2-side*(.34+p.lift*1.35+daddyReach+wave(side,daddy?1.8:1.4)*.065),wrist=bossArm(2,base+2,side*43,-53,a,-side*(.3+p.bend*.65+daddyReach),wave(side,daddy?2.6:2)*.08,51,46,true);if(side===-1){const staffSwing=p.staff*(daddy?1:.75);bossPart(2,base+7,wrist.x-9,wrist.y-34,daddy?49:42,daddy?215:133,-.12-p.reach*.3+wave(0,daddy?1.8:1.4)*.045+staffSwing);if(p.energy>.1)bossSpell(daddy?2:3,wrist.x-2,wrist.y-(daddy?133:91),70,tick,p.energy);}else if(p.energy>.1)bossSpell(daddy?2:3,wrist.x,wrist.y,42,tick,p.energy*.75);}
  bossPart(2,base,0,-17,135,141);if(daddy&&isTraining())drawTutorialDaddyHead(pose,p,tick,x);else bossPart(2,base+1,0,-112,103,112,p.head+wave(.4,daddy?1.55:1.2)*.035+(daddy&&p.rush?-.05:0));
  if(daddy&&/bubbleBurst/.test(pose)){for(let i=0;i<6;i++){const a=i/6*Math.PI*2+tick*1.7;bossSpell(3,Math.cos(a)*88,Math.sin(a)*42-12,25,tick+i,.45);}}
  if(daddy&&/celebrate/.test(pose)){for(let i=0;i<5;i++){const a=i/5*Math.PI*2+tick;bossSpell(2,Math.cos(a)*95,Math.sin(a)*36-65,24,tick+i,.35);}}
 }else if(kind==='nessie'){
  const tail=bossBone(0,13,62,18,78,57,-.3+wave(0,1.7)*.22);bossBone(0,14,tail.x,tail.y,75,42,-.8+wave(-1,1.7)*.35-p.fold*.12);
  bossPart(0,12,48,54,86,62,.3+wave(1,2)*.3);bossPart(0,11,-18,58,80,69,-.3+wave(0,2)*.32-p.reach*.4);
  bossPart(0,8,8,13,179,99);const neck=bossBone(0,10,-48,-6,55,48,-Math.PI/2+wave(0,1.5)*.12-p.fold*.2);const top=bossBone(0,10,neck.x,neck.y,40,40,-Math.PI/2+wave(-.5,1.5)*.12-p.reach*.2);bossPart(0,9,top.x-10,top.y-15,101,77,p.head,-1);
  if(pose!=='friendly'&&pose!=='defeated'){bossPart(0,15,top.x-8,top.y-60,73,57,Math.sin(tick*2)*.04);if(p.energy>.1)bossSpell(8,top.x-8,top.y-65,85,tick,p.energy*.7);}
 }
 ctx.restore();return true;
}
function drawRanaV4(t){if(!bossV4Ready(0)||!rana||!boss)return false;if(boss.hp<=0&&!boss.active)return true;const x=boss.x-camera,y=boss.y,s=rana.state;
 if(boss.vulnerable){bossSpell(11,x,y,390,t,.7);drawCueBadge(x,y-205,'boost',true,t);}else if(/Charge|Prepare|Command/.test(s)&&boss.active)drawCueBadge(x,y-205,s==='retaliationCharge'?'double':'warning',false,t);
 drawBossV4('rana',x,y,320*(boss.hp<=0?.85:1),t,s);if(s==='phaseTransition')bossSpell(10,x,y,200+Math.min(1,rana.time)*130,t,.65);return true;}
function drawBossProjectileV4(p,t){const tile=({'shell':0,'star':1,'training-bolt':2,'royal-pearl':3,'acid':4,'spore':5,'seed':6,'mine':6,'pearl':isNessieFinal()?8:3})[p.type];if(tile===undefined||!bossV4Ready(3))return false;ctx.save();const x=p.x-camera,y=p.y,a=Math.atan2(p.vy,p.vx);ctx.translate(x,y);ctx.rotate(a);const color=tile===2?'#b1edff':tile>=4?'#e9b7fa':'#ffe3b1';ctx.lineCap='round';ctx.strokeStyle=color+'33';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(-8,0);ctx.quadraticCurveTo(-35,Math.sin(t*5)*8,-70,0);ctx.stroke();bossPart(3,tile,0,0,tile===2?58:45,tile===2?58:45,tile===2?Math.PI/2:reducedMotion?0:t*2);ctx.restore();return true;}
function drawRanaHazardsV4(t){if(!bossV4Ready(0)||!bossV4Ready(3)||!rana)return false;for(const h of finalHazards){const x=h.x-camera,y=h.y;if(x<-180||x>vw+180)continue;ctx.save();if(h.warning||h.active){ctx.strokeStyle=h.warning?'#ffe0a0':'#ff88a9';ctx.lineWidth=2;ctx.setLineDash(h.warning?[7,8]:[]);ctx.beginPath();ctx.ellipse(x,h.kind==='spore'?y:875,h.kind==='spore'?106:58,h.kind==='spore'?100:19,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}if(h.warning)bossSpell(h.kind==='spore'?5:h.kind==='vine'?6:9,x,h.kind==='spore'?y:860,h.kind==='spore'?70:48,t,.3);
 if(h.active){if(h.kind==='vine'){const pts=ranaVinePoints(h);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],angle=Math.atan2(b.y-a.y,b.x-a.x);bossBone(0,i===pts.length-1?7:6,a.x-camera,a.y,Math.hypot(b.x-a.x,b.y-a.y),25,angle);}bossSpell(6,pts.at(-1).x-camera,pts.at(-1).y,38,t,.9);}else if(h.kind==='spore'){bossSpell(5,x,y,190,t,.85);for(let i=0;i<5;i++)bossSpell(5,x+Math.sin(t+i*2)*65,y+Math.cos(t+i*2)*58,32,t+i,.65);}else{const height=370*h.strength;for(let i=0;i<5;i++)bossPart(3,9,x,866-height*i/5,110,height/3+25,-Math.PI/2);bossSpell(7,x,870-height,68,t,.75);}}ctx.restore();}return true;}

function bossRanaForearm(x,y,length,width,angle,wrist){const art=BOSS_V4_IMAGES[0],c=bossV4Crops[0][3];ctx.save();ctx.translate(x,y);ctx.rotate(angle-Math.PI/2);ctx.drawImage(art,c[0],c[1],c[2],c[3]*.56,-width/2,-4,width,length*.56+4);ctx.translate(0,length*.52);ctx.rotate(wrist);ctx.drawImage(art,c[0],c[1]+c[3]*.52,c[2],c[3]*.48,-width/2,0,width,length*.48+5);ctx.restore();}
