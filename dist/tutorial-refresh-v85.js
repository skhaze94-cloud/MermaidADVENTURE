'use strict';
// 8.5: tutorial-only choreography, solid painted reefs and a connected royal rig.
const TUTORIAL85_ART=new Image();TUTORIAL85_ART.src='assets/tutorial-splendour-v85.webp';
const TUTORIAL85_CROPS=[[30,0,421,537],[463,87,518,410],[990,133,545,375],[42,546,494,454],[568,590,588,393],[1240,515,229,483]];
const TUTORIAL85_HEAD={last:0,look:0,from:0,to:0,blend:1};
function tutorialArt85(tile,x,y,w,h,alpha=1){const c=TUTORIAL85_CROPS[tile];if(!c||!TUTORIAL85_ART.complete||!TUTORIAL85_ART.naturalWidth)return false;ctx.save();ctx.globalAlpha*=alpha;ctx.drawImage(TUTORIAL85_ART,...c,x,y,w,h);ctx.restore();return true;}
function resetTutorial85(){Object.assign(TUTORIAL85_HEAD,{last:0,look:0,from:0,to:0,blend:1});}
function tutorialHeadPose85(pose,p,t,x){const s=TUTORIAL85_HEAD,dt=state==='paused'||t<s.last?0:clamp(t-s.last,0,.1);if(state!=='paused')s.last=Math.max(s.last,t);const tick=state==='paused'?s.last:t,target=clamp((nessie.x-camera-x)/400,-1,1),index=tutorialDaddyFaceIndex(pose);
 if(dt>0){s.look+=(target-s.look)*(1-Math.exp(-dt*4));if(index!==s.to){s.from=s.blend<.5?s.from:s.to;s.to=index;s.blend=0;}s.blend=Math.min(1,s.blend+dt*5);}
 const look=reducedMotion?0:s.look,angle=reducedMotion?0:look*.15+Math.sin(tick*1.3)*.025+p.head;
 return {look,angle,from:s.from,to:s.to,blend:smoothUnit(s.blend),jaw:reducedMotion?0:training?.speech?.who==='daddy'||(state==='dialogue'&&conversations[activeDialogueId]?.speaker==='King Daddy')?Math.sin(tick*4.4)*.7:0};
}
function drawTutorialHead85(pose,p,t,x){const h=tutorialHeadPose85(pose,p,t,x);ctx.save();ctx.translate(h.look*5,-65);ctx.rotate(h.angle+(reducedMotion?0:Math.sin(h.blend*Math.PI)*.02));ctx.scale(1-Math.abs(h.look)*.035,1);
 if(tutorialFaceArt?.complete&&tutorialFaceArt.naturalWidth){const i=h.blend<.5?h.from:h.to;atlasDraw(tutorialFaceArt,TUTORIAL_FACE_CROPS[i],-48,-101+h.jaw,96,110);}
 else bossPart(2,1,0,-46,96,110);ctx.restore();}
function drawTutorialDaddyRig85(pose,p,t,x){const wave=(phase,speed=1.8)=>reducedMotion?0:Math.sin(t*speed+phase),tailAngle=Math.PI/2+wave(0)*.13+p.kick*.18;
 // Keep the narrow end of the scaled tail overlapping the gold fin hinge.
 const tail=bossBone(2,5,0,25,119,70,tailAngle),finAngle=wave(-.85)*.19+p.kick*.12;
 ctx.save();ctx.translate(tail.x,tail.y);ctx.rotate(finAngle);bossPart(2,6,0,31,122,98);ctx.restore();
 for(const side of [-1,1]){const reach=p.reach*.16+p.kick*.09,a=Math.PI/2-side*(.30+p.lift*1.12+reach+wave(side)*.04),bend=-side*(.27+p.bend*.43+reach);
  const elbow=bossBone(2,2,side*51,-53,49,26,a),wrist=bossBone(2,3,elbow.x,elbow.y,44,23,a+bend);
  bossPart(2,4,wrist.x,wrist.y+7,27,35,a+bend-Math.PI/2+wave(side,2.4)*.045);
  if(side===-1){const staffAngle=-.1-p.reach*.20+p.staff*.7+wave(0)*.025;bossPart(2,7,wrist.x-9,wrist.y-43,49,204,staffAngle);if(p.energy>.1)bossSpell(2,wrist.x-2,wrist.y-133,54,t,p.energy*.7);}
  else if(p.energy>.1)bossSpell(2,wrist.x,wrist.y,32,t,p.energy*.6);
 }
 bossPart(2,0,0,-17,149,134);drawTutorialHead85(pose,p,t,x);
 if(/bubbleBurst|celebrate/.test(pose))for(let i=0;i<5;i++){const a=i/5*Math.PI*2+t*.8;bossSpell(/bubbleBurst/.test(pose)?3:2,Math.cos(a)*86,Math.sin(a)*37-25,20,t+i,.3);}
}
function drawTutorialEntrance85(t){const u=clamp(training.arrival/3.4,0,1),x=training.arrivalX-camera,line=waterSurface(),quiet=reducedMotion;
 const gather=smoothUnit(u/.22)*(1-smoothUnit((u-.68)/.25)),part=Math.sin(Math.PI*clamp((u-.25)/.75,0,1)),energy=smoothUnit((u-.13)/.12)*(1-smoothUnit((u-.52)/.16));
 ctx.save();const glow=ctx.createRadialGradient(x,line+55,15,x,line+55,280);glow.addColorStop(0,'#bdf9ef'+Math.round(part*45).toString(16).padStart(2,'0'));glow.addColorStop(1,'#b7ebff00');ctx.fillStyle=glow;ctx.fillRect(x-280,line-225,560,560);
 tutorialArt85(1,x-170,35,340,180,gather*.9);
 if(!quiet)tutorialArt85(0,x-95,55,190,line+100,energy*.85);
 // Parting crests expand once, then settle into the ordinary water surface.
 tutorialArt85(2,x-(230+part*90),line-85,460+part*180,185,part*.85);
 ctx.strokeStyle='#d4fff1';ctx.lineWidth=2;ctx.globalAlpha=part*.4;for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(x+side*part*110,line+15,50+part*55,10+part*8,0,0,Math.PI*2);ctx.stroke();}
 if(!quiet){ctx.globalAlpha=part*.6;for(let i=0;i<12;i++){const a=i/12*Math.PI*2,travel=40+u*125;ctx.fillStyle=i%3?'#b7fff3':'#ffedba';ctx.beginPath();ctx.ellipse(x+Math.cos(a)*travel,line+Math.sin(a)*travel*.23-part*55,2+i%2,4+i%2,-a,0,Math.PI*2);ctx.fill();}}
 ctx.restore();drawRoyalCharacter('daddy',training.guideX-camera,training.guideY,training.guideSize,quiet?0:t,'arrival');
}
function drawTutorialSolid85(o,x,t){if(!isTraining())return false;const sky=!!o.tutorialSky,vertical=o.h>o.w*1.2,tile=sky||o.y<waterSurface()+80?4:vertical&&!o.trainingRock?5:3;
 ctx.save();ctx.shadowColor='#062e4770';ctx.shadowBlur=8;ctx.shadowOffsetY=5;
 const wideFloor=o.y>740&&o.w>260,painted=wideFloor?tutorialReefPiece(o.tutorialTile||0,x,o.y,o.w,o.h):tutorialArt85(tile,x,o.y,o.w,o.h);
 if(!painted){const g=ctx.createLinearGradient(x,o.y,x+o.w,o.y+o.h);g.addColorStop(0,'#8dd5cb');g.addColorStop(.28,'#4c9b9c');g.addColorStop(1,'#164b68');ctx.fillStyle=g;reefContour751(x,o.y,o.w,o.h,0);ctx.fill();}
 ctx.restore();return true;
}
function tutorialGuideClear85(x,y){return !obstacles.some(o=>!o.tutorialSky&&x+88>o.x&&x-88<o.x+o.w&&y+170>o.y&&y-128<o.y+o.h);}
function moveTutorialGuide85(dt){if(!training||training.step<0||boss?.active)return;const anchor=[2850,3480,3940,4320,4620,5500,6800][training.step],desired=clamp(anchor,nessie.x-120,nessie.x+370),baseY=waterSurface()+130;let best=null;
 for(const dx of [0,-180,180,-320,320])for(const y of [baseY,520,620,700]){const x=clamp(desired+dx,180,W-180),cost=(x-desired)**2+(y-baseY)**2*.6;if(tutorialGuideClear85(x,y)&&(!best||cost<best.cost))best={x,y,cost};}
 if(!best)return;const f=1-Math.exp(-dt*1.9),x=training.guideX+(best.x-training.guideX)*f,y=training.guideY+(best.y-training.guideY)*f;
 training.guideX=x;training.guideY=y;
}
function tutorialQueueLesson85(id,step){const gates=[0,3300,3930,4120,4490,5470,6020];training.pendingLesson={id,minX:gates[step]||0,wait:2.4};tutorialSay(['','Lovely! Let’s swim to the coral garden.','Beautiful steering. There’s room to stretch your fins ahead.','Zoomies achieved. Let’s catch our breath before the sky lesson.','A splendid splash! Swim a little further for your next challenge.','Mum has something lovely for you, just ahead.','Follow me to the royal practice court.'][step]||'Beautiful swimming!','daddy',2.3);}
function updateTutorialLessonSpace85(dt){const q=training?.pendingLesson;if(!q)return false;q.wait=Math.max(0,q.wait-dt);if(q.wait>0||nessie.x<q.minX||leap.active||dashTime>0)return true;training.pendingLesson=null;training.speech=null;if(mode==='sarah')openDialogue(q.id);return state==='dialogue';}
function resolveTutorialSky85(px,py){if(!isTraining()||!leap.breached)return;const rx=58,ry=39;
 for(const o of obstacles){if(!o.tutorialSky||nessie.x+rx<=o.x||nessie.x-rx>=o.x+o.w||nessie.y+ry<=o.y||nessie.y-ry>=o.y+o.h)continue;
  if(px+rx<=o.x){nessie.x=o.x-rx;nessie.vx=Math.min(0,nessie.vx);}else if(px-rx>=o.x+o.w){nessie.x=o.x+o.w+rx;nessie.vx=Math.max(0,nessie.vx);}else if(py-ry>=o.y+o.h){nessie.y=o.y+o.h+ry;nessie.vy=Math.max(40,nessie.vy);}else if(py+ry<=o.y){nessie.y=o.y-ry;nessie.vy=Math.min(0,nessie.vy);}else{const left=Math.abs(nessie.x-(o.x-rx)),right=Math.abs(nessie.x-(o.x+o.w+rx));nessie.x=left<right?o.x-rx:o.x+o.w+rx;nessie.vx=0;}
  if(!training.skyLessonSeen){training.skyLessonSeen=true;tutorialSay('Floating reefs are solid too! I can steer around them.','sarah',4);}
 }
}
function installTutorial85(){const base=updateSwimmer,load=loadStage;updateSwimmer=function(dt,dx,dy){const px=nessie.x,py=nessie.y;base(dt,dx,dy);resolveTutorialSky85(px,py);};loadStage=function(){const r=load();resetTutorial85();return r;};}
