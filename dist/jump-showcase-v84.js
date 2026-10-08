'use strict';
// Six routines share the same flight physics; only the painted pose and flourish vary.
const JUMP_STYLES84=[
 {id:'front-flip',name:'Pearl front flip',color:'#b5fff1',second:'#fff0b5'},
 {id:'back-flip',name:'Moon backflip',color:'#d3baff',second:'#b1eaff'},
 {id:'corkscrew',name:'Coral corkscrew',color:'#ffb5d9',second:'#ffe8ac'},
 {id:'star-float',name:'Starfish float',color:'#ffe9a8',second:'#baffea'},
 {id:'dolphin-dive',name:'Dolphin dive',color:'#a9eaff',second:'#d4bdff'},
 {id:'cartwheel',name:'Rainbow cartwheel',color:'#a5ffdb',second:'#ffb8ef'}
];
let jumpSequence84=0;
function isSarahJump84(){return mode!=='story'&&!(isTraining()&&trainingHero==='daddy');}
function assignJump84(jump){if(!isSarahJump84())return;jump.style84=jumpSequence84++%JUMP_STYLES84.length;jump.color=JUMP_STYLES84[jump.style84].color;sarahGhostTime81=-Infinity;}
function jumpStyle84(){return isSarahJump84()&&Number.isInteger(leap.style84)?JUMP_STYLES84[leap.style84]:null;}
function sarahFlight84(progress,variant='standard',style=0){
 const p=clamp(progress,0,1),env=Math.sin(Math.PI*p)**2,finish=sarahEase82((p-.05)/.9),early=sarahEase82((p-.04)/.76),late=sarahEase82((p-.16)/.78),powered=['boost','combo','boss'].includes(variant),double=variant==='boss'?2:1;
 let angle=0,roll=0,tuck=0,open=0,reach=0,curl=0,fan=0;
 switch(style){
 case 0:angle=Math.PI*2*double*early;tuck=env*.95;curl=env*.30;open=env*sarahEase82((p-.5)/.26);break;
 case 1:angle=-Math.PI*2*double*late;tuck=env*.6;curl=-env*.20;open=env*.8;reach=-env*.42;roll=Math.sin(late*Math.PI*2)*env*.5;break;
 case 2:angle=Math.PI*2*double*finish;roll=Math.sin(finish*Math.PI*4)*env;tuck=env*.78;reach=roll*.30;curl=roll*.20;open=env*.4;break;
 case 3:angle=variant==='boss'?Math.PI*4*finish:Math.sin(p*Math.PI*2)*env*.25;open=env*1.1;fan=env*.75;reach=-env*.56;curl=env*.12;roll=Math.sin(p*Math.PI*4)*env*.3;break;
 case 4:angle=variant==='boss'?Math.PI*4*finish:-Math.sin(p*Math.PI*2)*env*.82;reach=-env*.38;tuck=env*.18;curl=Math.sin(p*Math.PI*2)*env*.34;open=env*.35;roll=Math.sin(p*Math.PI*2)*env*.25;break;
 case 5:angle=Math.PI*2*double*finish;open=env;fan=env*.55;reach=-env*.45;curl=-env*.12;roll=Math.sin(finish*Math.PI*2)*env*.8;break;
 }
 if(powered){tuck=Math.min(1,tuck*1.12);curl*=1.15;}
 return {p,angle,roll,tuck,open,reach,curl,fan};
}
function activeSarahFlight84(progress){return jumpStyle84()?sarahFlight84(progress,leap.variant,leap.style84):sarahFlight82(progress,leap.variant);}
function jumpPalette84(){const s=jumpStyle84();return leap.variant==='boss'?['#ffb7df','#debaff','#a7edff']:s?[s.color,s.second]:null;}
function drawJumpFlourish84(front){
 const style=jumpStyle84();if(!style)return false;if(!leap.active||!leap.breached||reducedMotion||state==='portal')return true;
 const p=sarahAirProgress83(),fade=Math.sin(Math.PI*p)**2;if(fade<.015)return true;
 const colors=jumpPalette84(),spin=activeSarahFlight84(p).angle,kind=leap.style84;
 ctx.save();ctx.translate(nessie.x-camera,nessie.y);ctx.scale(nessie.face,1);ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowBlur=8;
 for(let band=0;band<colors.length;band++){
  ctx.strokeStyle=colors[band];ctx.shadowColor=colors[band];ctx.lineWidth=front?2.2:3.5;ctx.globalAlpha=fade*(front?.65:.24);ctx.beginPath();let connected=false;
  for(let i=0;i<=28;i++){
   const u=i/28,a=u*Math.PI*2+spin+band*.9,z=Math.sin(a),show=front?z>=0:z<0;
   let x,y;if(kind===2){x=(u-.5)*220;y=Math.cos(a*2)*(24+band*9);}else if(kind===3){const r=76+Math.cos(a*5)*12;x=Math.cos(a)*r;y=Math.sin(a)*r*.55;}else if(kind===4){x=(u-.5)*230;y=Math.sin(u*Math.PI)*(24+band*14)*Math.cos(spin+u*2);}else{x=Math.cos(a)*(100+band*12);y=Math.sin(a)*(35+band*8);}
   if(show){if(connected)ctx.lineTo(x,y);else ctx.moveTo(x,y);connected=true;}else connected=false;
  }ctx.stroke();
  if(front){const a=spin+band*2.4,x=Math.cos(a)*98,y=Math.sin(a)*38;ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=colors[band];ctx.globalAlpha=fade*.9;ctx.beginPath();for(let j=0;j<8;j++){const r=j%2?2:7,q=j*Math.PI/4;j?ctx.lineTo(Math.cos(q)*r,Math.sin(q)*r):ctx.moveTo(Math.cos(q)*r,Math.sin(q)*r);}ctx.closePath();ctx.fill();ctx.restore();}
 }ctx.restore();return true;
}
function drawJumpLanding84(r){if(!r.landing||!Number.isInteger(r.style84)||!JUMP_STYLES84[r.style84]||reducedMotion)return;const style=JUMP_STYLES84[r.style84],age=1-r.life;
 ctx.save();ctx.translate(r.x-camera,r.y);ctx.strokeStyle=style.color;ctx.lineWidth=2;ctx.globalAlpha=r.life*r.life*.55;
 for(let i=0;i<5;i++){const a=Math.PI+i/4*Math.PI,x=Math.cos(a)*(22+age*115),y=Math.sin(a)*(10+age*36);ctx.beginPath();ctx.ellipse(x,y,3+age*4,2+age*2,a,0,Math.PI*2);ctx.stroke();}ctx.restore();}
