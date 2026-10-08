'use strict';
// Sarah's painted face is a rigid head sprite. Only hair, scales and fins use a mesh.
const SARAH81_IMAGES=[new Image(),new Image()];
SARAH81_IMAGES[0].src='assets/sarah-parts-v81.webp';
SARAH81_IMAGES[1].src='assets/sarah-arms-refined-v81.webp';
const SARAH81_ARM_CROPS=[[0.015625,0.201171875,0.46875,0.59765625],[0.515625,0.193359375,0.46875,0.611328125]];
const SARAH81_ARM_SIZE={near:{length:69,height:29},far:{length:64,height:24}};
let sarahPaint81=null,sarahGhost81=null,sarahGhostTime81=-Infinity;
const SARAH81_STATE={boost:0,look:0,air:0,turn:0,lastFace:1};
const SARAH81_CROPS=[[0.0078125,0.0185546875,0.234375,0.212890625],[0.2578125,0.0107421875,0.234375,0.2275390625],[0.5078125,0.044921875,0.234375,0.16015625],[0.7578125,0.013671875,0.234375,0.2216796875],[0.0078125,0.30859375,0.234375,0.1318359375],[0.2578125,0.3173828125,0.234375,0.115234375],[0.51171875,0.296875,0.2265625,0.1552734375],[0.7578125,0.306640625,0.234375,0.1357421875],[0.0078125,0.56640625,0.234375,0.1171875],[0.2578125,0.544921875,0.234375,0.16015625],[0.5078125,0.56640625,0.234375,0.1171875],[0.7578125,0.5634765625,0.234375,0.123046875],[0.0078125,0.7783203125,0.234375,0.1923828125],[0.2578125,0.7744140625,0.234375,0.201171875],[0.5078125,0.822265625,0.234375,0.10546875],[0.7578125,0.7998046875,0.234375,0.150390625]];
function resetSarahPose81(){sarahGhostTime81=-Infinity;SARAH81_STATE.boost=0;SARAH81_STATE.look=0;SARAH81_STATE.air=0;SARAH81_STATE.turn=0;SARAH81_STATE.lastFace=nessie.face;}
function updateSarahPose81(dt){if(!['playing','intro','portal'].includes(state))return;const d=clamp(dt,0,.1),follow=1-Math.exp(-d*10),s=SARAH81_STATE,boost=dashTime>0||(isExpandedHighland()&&highland?.fall?.boost>0)?1:0;
 s.boost+=(boost-s.boost)*follow;s.look+=(clamp(nessie.vy/420*nessie.face,-1,1)-s.look)*(1-Math.exp(-d*6));s.air+=((leap.breached?1:0)-s.air)*follow;
 if(nessie.face!==s.lastFace){s.turn=1;s.lastFace=nessie.face;}s.turn*=Math.exp(-d*7);
}
function sarahMotion81(wave,speed=0,air=0){const moving=clamp(speed,0,2),s=SARAH81_STATE,title=state==='ready',quiet=reducedMotion,tick=quiet?0:wave;
 const boost=title||quiet?0:s.boost,flight=title||quiet?0:Math.max(s.air,air>0?.7:0),stroke=quiet?0:(.075+moving*.055)*(1-boost*.85)*(1-flight*.65),phase=tick*.82;
 return {boost,flight,phase,head:quiet?0:s.look*.12+Math.sin(tick*.38)*.025+boost*.10+s.turn*.035,neck:quiet?0:-s.look*.035+Math.sin(tick*.31)*.018,
 torso:quiet?0:Math.sin(tick*.46)*.014-boost*.025,nearShoulder:.06+Math.sin(phase)*stroke-boost*.18-flight*.05,farShoulder:-.18+Math.sin(phase+Math.PI)*stroke-boost*.06,
 nearElbow:quiet?.10:.10+Math.sin(phase-1)*stroke*.5-boost*.075,farElbow:quiet?.08:.08+Math.sin(phase+2.1)*stroke*.45-boost*.055,
 nearWrist:quiet?0:Math.sin(phase-1.5)*.025*(1-boost),farWrist:quiet?0:Math.sin(phase+1.9)*.022*(1-boost),
 tailBase:quiet?0:Math.sin(tick*.88)*(.035+moving*.022)*(1-boost*.3),tailTip:quiet?0:Math.sin(tick*.88-1.1)*(.06+moving*.033),
 finTop:quiet?0:Math.sin(tick*1.35-1.9)*(.055+moving*.03),finBottom:quiet?0:Math.sin(tick*1.43-2.5)*(.065+moving*.022),sideFin:quiet?0:Math.sin(tick*1.61-.7)*.08,
 hair:quiet?0:Math.sin(tick*.58)*.028-boost*.035,hairLock:quiet?0:Math.sin(tick*.69-1.2)*.055,hairStrand:quiet?0:Math.sin(tick*.77-2)*.055,flutter:quiet?0:.65+moving*.45+boost*.5+flight*.3,bob:quiet?0:Math.sin(tick*.5)*1.1};
}
function sarahPart81(index,x,y,w,h,angle=0,pivotX=0,pivotY=0){const paint=sarahPaint81||ctx;const im=SARAH81_IMAGES[0],crop=SARAH81_CROPS[index];if(!crop)return;paint.save();paint.translate(pivotX,pivotY);paint.rotate(angle);paint.drawImage(im,crop[0]*im.naturalWidth,crop[1]*im.naturalHeight,crop[2]*im.naturalWidth,crop[3]*im.naturalHeight,x-pivotX,y-pivotY,w,h);paint.restore();}
function sarahFlow81(index,x,y,w,h,tick,amount,cols=4,rows=2){const paint=sarahPaint81||ctx;const crop=SARAH81_CROPS[index];if(!crop)return;paint.save();paint.translate(x+w/2,y+h/2);if(reducedMotion||amount===0||sarahPaint81)sarahPart81(index,-w/2,-h/2,w,h);else warpedSprite(SARAH81_IMAGES[0],crop,w,h,(u,v)=>({x:(u-.5)*w,y:(v-.5)*h+Math.sin(tick-(1-u)*4.5+v*.8)*(1-u)*(1-u)*amount}),cols,rows);paint.restore();}
// Continuous skinning keeps the elbow and wrist inside one painted silhouette.
function sarahArmPoint81(u,v,length,height,bend,wrist){const x=u*length,y=(v-.28)*height,e=length*.46,w=length*.80,blend=smoothUnit((x-e+5)/10),ca=Math.cos(bend),sa=Math.sin(bend),dx=x-e;
 let px=x+blend*((e+ca*dx-sa*y)-x),py=y+blend*((sa*dx+ca*y)-y);
 const wx=e+ca*(w-e),wy=sa*(w-e),finger=smoothUnit((x-w+3)/6),fx=px-wx,fy=py-wy,cw=Math.cos(wrist),sw=Math.sin(wrist);
 px+=finger*((wx+cw*fx-sw*fy)-px);py+=finger*((wy+sw*fx+cw*fy)-py);return {x:px-length/2,y:py};}
function sarahArm81(near,m){const paint=sarahPaint81||ctx,art=SARAH81_IMAGES[1],crop=SARAH81_ARM_CROPS[near?0:1],size=near?SARAH81_ARM_SIZE.near:SARAH81_ARM_SIZE.far;
 const shoulder=near?{x:23,y:7}:{x:62,y:-6},upper=near?m.nearShoulder:m.farShoulder,bend=near?m.nearElbow:m.farElbow,wrist=near?m.nearWrist:m.farWrist;
 if(!crop||!art.complete||!art.naturalWidth)return;
 paint.save();paint.translate(shoulder.x,shoulder.y);paint.rotate(upper);paint.translate(-5+size.length/2,0);
 if(reducedMotion||sarahPaint81){paint.drawImage(art,crop[0]*art.naturalWidth,crop[1]*art.naturalHeight,crop[2]*art.naturalWidth,crop[3]*art.naturalHeight,-size.length/2,-size.height*.28,size.length,size.height);}
 else warpedSprite(art,crop,size.length,size.height,(u,v)=>sarahArmPoint81(u,v,size.length,size.height,bend,wrist),8,2);
 paint.restore();}
function drawSarahRig81(w,h,wave,speed=0,air=0){const paint=sarahPaint81||ctx;const art=SARAH81_IMAGES[0];if(!art.complete||!art.naturalWidth||!SARAH81_IMAGES[1].complete||!SARAH81_IMAGES[1].naturalWidth||SARAH81_CROPS.length!==16||SARAH81_ARM_CROPS.length!==2)return false;const m=sarahMotion81(wave,speed,air),tick=reducedMotion?0:wave;
 paint.save();paint.scale(w/230,h/154);paint.translate(0,m.bob);paint.shadowBlur=0;paint.imageSmoothingEnabled=true;paint.imageSmoothingQuality='high';
 // Back hair precedes the far arm, torso and face; skin pieces overlap at their joints.
 paint.save();paint.translate(49,-23);paint.rotate(m.hair);sarahFlow81(2,-105,-46,116,77,tick*.66,m.flutter*2.2);paint.save();paint.rotate(m.hairStrand);sarahFlow81(15,-109,-18,109,28,tick*.76-1.1,m.flutter*2.5);paint.restore();paint.restore();
 sarahArm81(false,m);
 // A parented two-bone tail carries two independently fluttering terminal fins.
 paint.save();paint.translate(13,30);paint.rotate(m.tailBase);paint.save();paint.translate(-62,-1);paint.rotate(m.tailTip);sarahFlow81(11,-42,-13,50,26,tick*.88-1.1,m.flutter*1.2,3,2);paint.translate(-34,-2);
 paint.save();paint.rotate(m.finBottom);sarahFlow81(13,-37,-7,46,38,tick*1.43-2.5,m.flutter*1.6,3,2);paint.restore();paint.save();paint.rotate(m.finTop);sarahFlow81(12,-40,-49,49,57,tick*1.35-1.9,m.flutter*1.5,3,2);paint.restore();paint.restore();sarahFlow81(10,-70,-24,78,49,tick*.88,m.flutter*.9,4,2);paint.restore();
 paint.save();paint.translate(5,45);paint.rotate(m.sideFin);sarahFlow81(14,-36,-6,43,20,tick*1.61-.7,m.flutter,3,1);paint.restore();
 sarahPart81(0,5,-18,73,67,m.torso,12,24);
 // Never warp facial pixels. Neck and head rotate as separate rigid transforms.
 paint.save();paint.translate(48,-12);paint.rotate(m.neck);paint.translate(m.boost*2,m.boost*2);sarahPart81(1,-13,-61,67,73,m.head,8,-5);paint.restore();
 paint.save();paint.translate(46,-26);paint.rotate(m.hairLock);sarahFlow81(3,-27,-4,33,49,tick*.69-1.2,m.flutter*.7,2,2);paint.restore();
 sarahArm81(true,m);paint.restore();return true;
}
// One reusable offscreen pose supplies every afterimage. No full rig per trail stamp.
function drawSarahTrail81(){if(mode==='story'||(isTraining()&&trainingHero==='daddy')||typeof OffscreenCanvas==='undefined'||!SARAH81_IMAGES[0].complete||!SARAH81_IMAGES[0].naturalWidth||!SARAH81_IMAGES[1].complete||!SARAH81_IMAGES[1].naturalWidth)return false;
 if(!motionTrail.length)return true;sarahGhost81??=new OffscreenCanvas(276,192);
 if(elapsed-sarahGhostTime81>.07||elapsed<sarahGhostTime81){const paint=sarahGhost81.getContext('2d');paint.clearRect(0,0,276,192);paint.save();paint.translate(138,96);sarahPaint81=paint;try{drawSarahRig81(230,154,swimTime,clamp(Math.hypot(nessie.vx,nessie.vy)/360,0,2),leap.breached?leap.airTime:0);}finally{sarahPaint81=null;paint.restore();}sarahGhostTime81=elapsed;}
 ctx.save();for(const p of motionTrail){ctx.save();ctx.globalAlpha=p.life*.2;ctx.translate(p.x-camera,p.y);ctx.scale(p.face,1);ctx.rotate(p.angle||0);ctx.drawImage(sarahGhost81,-138,-96);ctx.restore();}ctx.restore();return true;}
function installSarahDynamic81(){const baseUpdate=update,baseLoad=loadStage,baseTrail=drawMotionTrail;drawMotionTrail=function(){if(!drawSarahTrail81())baseTrail();};update=function(dt){baseUpdate(dt);updateSarahPose81(dt);};loadStage=function(){const out=baseLoad();resetSarahPose81();return out;};resetSarahPose81();}
