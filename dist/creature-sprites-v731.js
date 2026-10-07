'use strict';
// 7.31: clean painted poses, continuous local limb deformation, bounded offscreen work.
const crabArt731=new Image(),eelArt731=new Image(),jellyArt731=new Image();
crabArt731.src='assets/crab-poses-v731.webp';eelArt731.src='assets/eel-poses-v731.webp';jellyArt731.src='assets/jelly-v731.webp';
const CREATURE_ART_731=[crabArt731,eelArt731,jellyArt731];
function creaturePose731(e,t,kind){
 if(kind==='jelly')return 0;
 if(kind==='eel')return /lunge|dash/.test(e.sparkState||'')?3:/coil|charge/.test(e.sparkState||'')||e.windup>0?2:Math.abs(e.vx||0)>100?1:0;
 return e.state==='attack'||e.recoil>.25?3:e.windup>0||e.state==='telegraph'?2:Math.abs(e.vx||0)>18?1:0;
}
function drawCreature731(e,t,small=false){
 const kind=e.kind==='jelly'?'jelly':e.kind==='pearl-crab'||e.shadowKind?'crab':e.kind==='eel'||isSparkEel(e)?'eel':null;
 if(!kind)return false;const art=kind==='crab'?crabArt731:kind==='eel'?eelArt731:jellyArt731;
 if(!art.complete||!art.naturalWidth)return false;
 const x=e.x-camera;if(x<-240||x>vw+240)return true;
 const tick=reducedMotion?0:(e.clock??t),w=small?(e.size||15)*(kind==='jelly'?2.6:3.8):(kind==='crab'?154:kind==='jelly'?114:e.elite?230:184)*(e.renderScale||1),h=kind==='jelly'?w*1.65:kind==='crab'?w*.78:w*.65;
 const pose=creaturePose731(e,tick,kind),crop=kind==='jelly'?[0,0,1,1]:[pose/4,0,.25,1],charge=clamp(1-(e.windup||.65)/.65,0,1),recoil=Math.max(0,e.recoil||0),emerge=e.emergence731??1;
 ctx.save();ctx.translate(x,e.y+(1-emerge)*h*.65);ctx.globalAlpha*=Math.max(.08,emerge);
 if(kind==='eel')ctx.scale(small?(e.dir||1):-(e.facing||1),1);else if(kind==='crab')ctx.scale(e.dir||-(e.facing||-1),1);
 ctx.rotate(clamp(e.renderAngle||e.renderTilt||0,-.35,.35));
 if(e.shadowKind==='shadow'){ctx.shadowColor='#ae82ff';ctx.shadowBlur=reducedMotion?0:10;}
 const cols=small?2:4,rows=small?3:kind==='jelly'?9:5;
 warpedSprite(art,crop,w,h,(u,v)=>{
  let px=(u-.5)*w,py=(v-.5)*h;
  if(kind==='crab'){
   // Separate spatial fields for each pincer and each leg pair; shell stays stable.
   for(const side of [-1,1]){const claw=Math.exp(-(((u-(side<0?.20:.80))/.16)**2+((v-.33)/.23)**2));const a=(Math.sin(tick*2.6+side*1.8)*.06-charge*.16-recoil*.10)*side,dx=(u-(side<0?.34:.66))*w,dy=(v-.44)*h;px+=claw*((Math.cos(a)-1)*dx-Math.sin(a)*dy);py+=claw*(Math.sin(a)*dx+(Math.cos(a)-1)*dy);}
   const leg=Math.max(0,(v-.62)/.38),side=Math.sign(u-.5);py+=Math.sin(tick*(Math.abs(e.vx||0)>18?12:4)+u*18)*leg*6;px+=Math.cos(tick*7+u*14)*leg*side*3;
  }else if(kind==='eel'){
   const tail=Math.pow(1-u,1.6),coil=/coil|charge/.test(e.sparkState||'');py+=Math.sin(tick*(e.sparkState==='lunge'?9:4.5)+(1-u)*8)*tail*(coil?16:10);px+=Math.sin(tick*2-v*5)*tail*3;
  }else{
   const tentacle=clamp((v-.27)/.73,0,1),bell=1-tentacle,pulse=Math.sin(tick*2.8);
   px+=(u-.5)*w*pulse*.055*bell+Math.sin(tick*2.3-v*7+u*9)*tentacle*8;
   py+=(v-.2)*h*pulse*.025*bell+Math.cos(tick*2-v*4+u*5)*tentacle*3;
  }return{x:px,y:py};
 },cols,rows);ctx.restore();
 if(!small&&(e.windup>0||e.state==='telegraph'||/coil|charge/.test(e.sparkState||''))){
  ctx.save();ctx.globalAlpha=.35+charge*.35;ctx.strokeStyle=kind==='crab'?'#ffd694':kind==='jelly'?'#ffc7ff':'#88f6ff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,e.y,w*.55,h*.52,0,0,Math.PI*2);ctx.stroke();ctx.restore();
  drawReleaseBadge(x,e.y-h*.62,'warning',false,t);
 }
 if(!small&&kind==='eel'&&(e.electricPulse>.1||/coil|charge|lunge/.test(e.sparkState||''))){ctx.save();ctx.strokeStyle=e.elite?'#ffec83':'#8bf7ff';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();for(let j=0;j<6;j++){const xx=x-w*.4+j*w*.15,yy=e.y+Math.sin(tick*12+j*2+i)*8+(i-1)*h*.2;j?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();}ctx.restore();}
 if(e.elite&&!small){ctx.save();ctx.fillStyle='#123248';ctx.fillRect(x-35,e.y-h*.6,70,5);ctx.fillStyle='#ffe59c';ctx.fillRect(x-35,e.y-h*.6,70*clamp(e.hp/(e.maxHp||2),0,1),5);ctx.restore();}
 return true;
}
function updateCreatureEncounters731(dt){
 if(isTraining()||mode==='trial'||isShadowCrabKingdom())return;
 for(const e of enemies){if(e.hp<=0||e.kind!=='pearl-crab'||!e.scuttle||(e.phase||0)%3!==0)continue;
  if(e.emergence731===undefined){e.emergence731=0;e.burrowCue731=0;}
  if(e.emergence731>=1)continue;
  if(Math.abs(nessie.x-e.x)>480&&e.burrowCue731===0)continue;
  e.burrowCue731+=dt;if(e.burrowCue731>.65)e.emergence731=Math.min(1,e.emergence731+dt/ .7);
  e.cooldown=Math.max(e.cooldown||0,1);e.windup=0;
 }
}
function drawBurrowCue731(e,t){
 if(e.emergence731===undefined||e.emergence731>=1)return false;
 const x=e.x-camera;if(x<-180||x>vw+180)return true;
 ctx.save();ctx.strokeStyle='#f1d7a7';ctx.globalAlpha=.3;ctx.lineWidth=2;
 for(let i=0;i<2;i++){ctx.beginPath();ctx.ellipse(x,e.y+38,26+i*12+Math.sin(t*6)*3,6+i*3,0,0,Math.PI*2);ctx.stroke();}ctx.restore();
 if(e.emergence731>0)return false;return true;
}
