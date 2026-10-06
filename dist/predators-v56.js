// Sarah Maria 5.8 · Definitive Shark Update
// Layered gentleman reef shark inspired by the supplied top-hat/monocle shark reference.

const SHARK_TUNE={
  detectRange:920,
  loseRange:1180,
  patrolSpeed:74,
  investigateSpeed:150,
  stalkSpeed:235,
  circleSpeed:270,
  chargeSpeed:900,
  enragedChargeSpeed:1030,
  turnRate:3.25,
  verticalTurnRate:3.8,
  steerSmoothing:5.2,
  maxAccel:1320,
  faceHold:.3,
  investigateTime:.42,
  stalkTime:.72,
  circleTime:.82,
  lockTime:.42,
  lungeTime:.58,
  biteTime:.22,
  overshootTime:.34,
  recoverTime:.64,
  stunnedTime:1.08,
  cooldown:1.05,
  enragedCooldown:.72,
  bodyRadiusX:88,
  bodyRadiusY:46,
  sensorDistance:130,
  sensorSpread:72
};

function isReefShark(e){return !!e&&e.kind==='reef-shark';}

function spawnReefShark(x,y,phase=0,options={}){
  const maxHp=options.hp??3;
  const e={
    kind:'reef-shark',x,y,bx:x,by:y,hp:maxHp,maxHp,phase,clock:phase*.43,
    sharkState:'patrol',sharkTime:phase*.09,cooldown:.35+phase*.07,
    facing:phase%2?1:-1,heading:phase%2?Math.PI:0,aimX:x-120,aimY:y,
    vx:0,vy:0,recoil:0,turnBias:phase%2?1:-1,collided:false,
    biteLatch:false,alert:0,eyeBlink:phase*.17%1,nearMiss:0,lastSeenX:x,lastSeenY:y,
    steerX:x,steerY:y,renderAngle:0,faceHoldUntil:0,avoidUntil:0,
    aggressive:!!options.aggressive,arenaShark:!!options.arena
  };
  enemies.push(e);
  return e;
}

function setupReefSharks(){
  if(mode==='trial'||isTraining())return;
  if(stage===0){
    spawnReefShark(8450,520,0);spawnReefShark(12550,690,1);
  }else if(stage===1){
    spawnReefShark(2780,520,0);spawnReefShark(5900,690,1);
  }else if(stage===2){
    spawnReefShark(3700,690,0);spawnReefShark(5850,500,1);
  }else if(stage===3){
    const pack=[[3120,500],[3780,705],[4520,455],[5260,690],[6020,500],[6760,710]];
    for(const [i,p] of pack.entries())spawnReefShark(p[0],p[1],i,{hp:4,aggressive:true,arena:true});
  }
}

function sharkState(e,state){
  e.sharkState=state;e.sharkTime=0;e.biteLatch=false;
  if(['investigate','stalk','circle','lock','charge'].includes(state)){
    e.lastSeenX=nessie.x;e.lastSeenY=nessie.y;
  }
  if(state==='lock'||state==='charge'){
    e.aimX=nessie.x;e.aimY=nessie.y;
  }
  if(state==='stunned'){
    e.recoil=1;e.vx*=.18;e.vy*=.18;
    ranaBurst(e.x,e.y,18,'#c8fff1',130);
    tone(170,.08,.018);
  }
}

function sharkPointBlocked(x,y,rx=SHARK_TUNE.bodyRadiusX,ry=SHARK_TUNE.bodyRadiusY){
  if(x-rx<105||x+rx>W-105||y-ry<waterSurface()+52||y+ry>865)return true;
  for(const o of obstacles){
    if(x+rx>o.x&&x-rx<o.x+o.w&&y+ry>o.y&&y-ry<o.y+o.h)return true;
  }
  return false;
}

function sharkObstacleSteer(e,tx,ty){
  const dx=tx-e.x,dy=ty-e.y,len=Math.max(1,Math.hypot(dx,dy)),nx=dx/len,ny=dy/len;
  const forward=SHARK_TUNE.sensorDistance+(e.sharkState==='lunge'?70:0);
  const fx=e.x+nx*forward,fy=e.y+ny*forward;
  if(!sharkPointBlocked(fx,fy,82,42))return {x:tx,y:ty,blocked:false};
  const up={x:e.x+nx*72,y:e.y-SHARK_TUNE.sensorSpread};
  const down={x:e.x+nx*72,y:e.y+SHARK_TUNE.sensorSpread};
  const upBlocked=sharkPointBlocked(up.x,up.y,78,40),downBlocked=sharkPointBlocked(down.x,down.y,78,40);
  let choice;
  if(!upBlocked&&!downBlocked){
    const upCost=Math.abs(ty-up.y),downCost=Math.abs(ty-down.y);
    choice=(e.avoidUntil>e.clock?(e.turnBias<0?up:down):(upCost<downCost?up:down));
    if(!(e.avoidUntil>e.clock))e.avoidUntil=e.clock+.45;
  }else if(!upBlocked)choice=up;
  else if(!downBlocked)choice=down;
  else choice={x:e.x-nx*90,y:clamp(e.y+e.turnBias*95,waterSurface()+85,830)};
  e.turnBias=choice.y<e.y?-1:1;
  return {x:choice.x,y:choice.y,blocked:true};
}

function sharkMoveToward(e,tx,ty,speed,dt,turnBoost=1){
  const steer=sharkObstacleSteer(e,tx,ty),smooth=1-Math.exp(-dt*SHARK_TUNE.steerSmoothing*(steer.blocked?.62:1));
  e.steerX+=(steer.x-e.steerX)*smooth;e.steerY+=(steer.y-e.steerY)*smooth;
  const dx=e.steerX-e.x,dy=e.steerY-e.y,d=Math.max(1,Math.hypot(dx,dy)),targetVx=dx/d*speed,targetVy=dy/d*speed;
  const accel=SHARK_TUNE.maxAccel*turnBoost*(e.aggressive?1.12:1);
  e.vx+=clamp(targetVx-e.vx,-accel*dt,accel*dt);e.vy+=clamp(targetVy-e.vy,-accel*dt,accel*dt);
  const dragX=1-Math.exp(-dt*SHARK_TUNE.turnRate*.18),dragY=1-Math.exp(-dt*SHARK_TUNE.verticalTurnRate*.2);
  e.vx+=(targetVx-e.vx)*dragX;e.vy+=(targetVy-e.vy)*dragY;
  e.x+=e.vx*dt;e.y+=e.vy*dt;e.heading=Math.atan2(e.vy,e.vx||1);
  const pitch=Math.atan2(e.vy,Math.max(70,Math.abs(e.vx)));e.renderAngle+=(clamp(pitch,-.34,.34)-e.renderAngle)*(1-Math.exp(-dt*5));
  return steer;
}
function updateSharkFacing(e,dx,committed=false){
  const desired=committed&&Math.abs(e.vx)>10?(e.vx<0?1:-1):Math.abs(e.vx)>45?(e.vx<0?1:-1):dx<0?1:-1;
  if(desired!==e.facing&&e.clock>=(e.faceHoldUntil||0)&&(committed||Math.abs(dx)>115)){e.facing=desired;e.faceHoldUntil=e.clock+SHARK_TUNE.faceHold;}
}

function sharkTargetSide(e,distance=175){
  const side=nessie.x<e.x?1:-1;
  return {x:nessie.x+side*distance,y:nessie.y+Math.sin(e.clock*2.1+e.phase)*42};
}

function sharkWake(e,intensity=1){
  if(reducedMotion||Math.random()>.48*intensity)return;
  const tailX=e.x+(e.facing>0?92:-92),tailY=e.y+Math.sin(e.clock*7)*12;
  particles.push({
    x:tailX,y:tailY,vx:(e.facing>0?1:-1)*(28+Math.random()*36),vy:(Math.random()-.5)*32,
    life:.32+Math.random()*.28,max:.6,color:'#d8fff4',r:2+Math.random()*2,bubble:true
  });
  if(particles.length>280)particles.splice(0,particles.length-280);
}

function sharkBiteBurst(e){
  const mx=e.x+(e.facing>0?-82:82),my=e.y+8;
  ranaBurst(mx,my,16,'#fff0c2',150);
  if(!reducedMotion){
    for(let i=0;i<10;i++){
      const a=(i/10-.5)*1.5+(e.facing>0?Math.PI:0),v=90+Math.random()*110;
      particles.push({x:mx,y:my,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.3+Math.random()*.28,max:.58,color:i%2?'#d8fff4':'#fff1bd',r:2+Math.random()*2.4,bubble:i%3===0});
    }
  }
  tone(78,.1,.03);
}

function updateReefSharks(dt){
  if(mode==='trial'||isTraining())return;
  for(const e of enemies){
    if(!isReefShark(e)||e.hp<=0)continue;
    const oldX=e.x,oldY=e.y;
    e.clock+=dt;e.sharkTime+=dt;e.cooldown=Math.max(0,e.cooldown-dt);
    e.recoil=Math.max(0,e.recoil-dt*2.4);e.alert=Math.max(0,e.alert-dt*.7);e.eyeBlink=(e.eyeBlink+dt*.28)%1;
    const dx=nessie.x-e.x,dy=nessie.y-e.y,d=Math.hypot(dx,dy),enraged=e.hp===1,playerVisible=!leap.breached&&d<SHARK_TUNE.loseRange;
    if(playerVisible){e.lastSeenX=nessie.x;e.lastSeenY=nessie.y;}
    // Hysteresis prevents visual left/right chatter when the player crosses the nose.
    const committed=['charge','lunge','bite','overshoot'].includes(e.sharkState),wounded=e.hp<=Math.ceil(e.maxHp/2),aggression=(e.aggressive?1.2:1)*(wounded?1.1:1);
    updateSharkFacing(e,dx,committed);

    if(e.sharkState==='patrol'){
      const px=e.bx+Math.sin(e.clock*.42+e.phase)*180,py=e.by+Math.sin(e.clock*.77+e.phase*1.6)*55;
      sharkMoveToward(e,px,py,SHARK_TUNE.patrolSpeed*aggression,dt,.75);
      if(d<SHARK_TUNE.detectRange&&!leap.breached&&e.cooldown<=0){e.alert=1;sharkState(e,'investigate');}
    }else if(e.sharkState==='investigate'){
      sharkMoveToward(e,e.lastSeenX,e.lastSeenY,SHARK_TUNE.investigateSpeed*aggression,dt,1.05);
      if(e.sharkTime>SHARK_TUNE.investigateTime)sharkState(e,'stalk');
    }else if(e.sharkState==='stalk'){
      const target=sharkTargetSide(e,enraged?125:165);
      sharkMoveToward(e,target.x,target.y,SHARK_TUNE.stalkSpeed*aggression,dt,1.18);
      sharkWake(e,.6);
      if(!playerVisible&&e.sharkTime>.5)sharkState(e,'recover');
      else if(e.sharkTime>SHARK_TUNE.stalkTime)sharkState(e,'circle');
    }else if(e.sharkState==='circle'){
      const orbit=e.turnBias,ang=e.clock*(wounded?2.25:1.78)+e.phase,rx=wounded?135:175,ry=wounded?82:98;
      const tx=nessie.x+Math.cos(ang)*rx,ty=nessie.y+Math.sin(ang)*ry*orbit;
      sharkMoveToward(e,tx,ty,SHARK_TUNE.circleSpeed*aggression,dt,1.35);
      sharkWake(e,.85);
      if(e.sharkTime>SHARK_TUNE.circleTime)sharkState(e,'lock');
    }else if(e.sharkState==='lock'){
      if(!playerVisible){sharkState(e,'recover');continue;}
      updateSharkFacing(e,dx,false);
      e.vx*=Math.exp(-dt*4.2);e.vy*=Math.exp(-dt*4.2);e.x+=e.vx*dt;e.y+=e.vy*dt;
      e.aimX=nessie.x;e.aimY=nessie.y;e.alert=1;
      if(e.sharkTime>SHARK_TUNE.lockTime)sharkState(e,'charge');
    }else if(e.sharkState==='charge'){
      const a=Math.atan2(e.aimY-e.y,e.aimX-e.x),speed=(wounded?SHARK_TUNE.enragedChargeSpeed:SHARK_TUNE.chargeSpeed)*(e.aggressive?1.08:1);
      e.vx=Math.cos(a)*speed;e.vy=Math.sin(a)*speed;e.heading=a;e.facing=e.vx<0?1:-1;
      sharkState(e,'lunge');sharkWake(e,1.6);tone(enraged?82:92,.09,.024);
    }else if(e.sharkState==='lunge'){
      const aheadX=e.x+e.vx*dt*2.3,aheadY=e.y+e.vy*dt*2.3;
      if(sharkPointBlocked(aheadX,aheadY,86,44)){
        e.vx*=-.18;e.vy*=-.18;e.nearMiss=1;sharkState(e,'overshoot');
      }else{
        e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=Math.exp(-dt*.42);e.vy*=Math.exp(-dt*.42);sharkWake(e,1.8);
        if(Math.hypot(nessie.x-e.x,nessie.y-e.y)<115&&!leap.breached&&!e.biteLatch){
          e.biteLatch=true;sharkState(e,'bite');sharkBiteBurst(e);
          if(dashTime>0){
            e.hp--;score+=260;dashTime=0;dashCooldown=.12;e.recoil=1;
            popups.push({x:e.x,y:e.y-102,text:e.hp>0?'STUN! '+e.hp+'/'+e.maxHp:'SHARK DOWN! +260',life:1.05,color:'#fff2b8'});
            sharkState(e,'stunned');
            if(e.hp<=0){ranaBurst(e.x,e.y,36,'#bff8e9',190);tone(390,.16,.035);}
          }else if(invincible<=0)hurt(e.x);
        }else if(e.sharkTime>SHARK_TUNE.lungeTime)sharkState(e,'overshoot');
      }
    }else if(e.sharkState==='bite'){
      e.vx*=Math.exp(-dt*4.6);e.vy*=Math.exp(-dt*4.6);e.x+=e.vx*dt;e.y+=e.vy*dt;
      if(e.sharkTime>SHARK_TUNE.biteTime)sharkState(e,'overshoot');
    }else if(e.sharkState==='overshoot'){
      e.vx*=Math.exp(-dt*2.6);e.vy*=Math.exp(-dt*2.6);e.x+=e.vx*dt;e.y+=e.vy*dt;
      if(e.sharkTime>SHARK_TUNE.overshootTime)sharkState(e,'recover');
    }else if(e.sharkState==='stunned'){
      e.vx*=Math.exp(-dt*3.5);e.vy*=Math.exp(-dt*3.5);e.x+=e.vx*dt;e.y+=Math.sin(e.clock*15)*dt*18;
      if(e.sharkTime>SHARK_TUNE.stunnedTime)sharkState(e,'recover');
    }else if(e.sharkState==='recover'){
      const retreatX=clamp(e.x+(e.facing>0?165:-165),160,W-160),retreatY=clamp(e.by+Math.sin(e.clock+e.phase)*70,waterSurface()+95,820);
      sharkMoveToward(e,retreatX,retreatY,SHARK_TUNE.investigateSpeed,dt,.9);
      if(e.sharkTime>SHARK_TUNE.recoverTime){e.bx=e.x;e.by=e.y;e.cooldown=(wounded?SHARK_TUNE.enragedCooldown:SHARK_TUNE.cooldown)*(e.aggressive?.78:1);sharkState(e,'patrol');}
    }

    resolveEnemyScenery(e,oldX,oldY);
    if(e.collided&&['lunge','bite'].includes(e.sharkState)){
      e.vx*=-.12;e.vy*=-.12;e.nearMiss=1;sharkState(e,'overshoot');
    }

    if(e.sharkState!=='lunge'&&e.sharkState!=='bite'){
      const hit=Math.hypot(nessie.x-e.x,nessie.y-e.y);
      if(hit<92&&!leap.breached&&e.sharkState!=='stunned'){
        if(dashTime>0){
          e.hp--;score+=240;dashTime=0;dashCooldown=.12;
          popups.push({x:e.x,y:e.y-96,text:e.hp>0?'STUN! '+e.hp+'/'+e.maxHp:'REEF SHARK! +240',life:1,color:'#c8fff1'});
          sharkState(e,'stunned');
          if(e.hp<=0){ranaBurst(e.x,e.y,32,'#bff8e9',180);tone(410,.14,.032);}
        }else if(invincible<=0&&e.sharkState!=='stunned')hurt(e.x);
      }
    }
  }
}

function drawSharkHealthBar(e,x,y,t){
  if(e.hp<=0||e.maxHp<=0)return;
  const near=Math.abs(nessie.x-e.x)<950||e.alert>0||e.hp<e.maxHp||e.arenaShark;if(!near)return;
  const width=e.arenaShark?122:104,height=8,gap=3,seg=(width-gap*(e.maxHp-1))/e.maxHp,left=x-width/2,top=y-132;
  ctx.save();ctx.globalAlpha=.94;ctx.fillStyle='#061d2dcc';ctx.strokeStyle='#d9f5e6a8';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(left-5,top-5,width+10,height+10,7);ctx.fill();ctx.stroke();
  for(let i=0;i<e.maxHp;i++){ctx.fillStyle=i<e.hp?(e.hp<=Math.ceil(e.maxHp/2)?'#ffb071':'#8ee6c7'):'#294454';ctx.beginPath();ctx.roundRect(left+i*(seg+gap),top,seg,height,3);ctx.fill();}
  ctx.fillStyle='#effff7';ctx.font='800 9px Nunito,sans-serif';ctx.textAlign='center';ctx.fillText(e.arenaShark?'HUNT SHARK':'SHARK',x,top-6);ctx.restore();
}
function drawSharkWake(e,t,intensity){
  if(reducedMotion||intensity<=0)return;
  ctx.save();ctx.globalAlpha=.12+.2*intensity;ctx.strokeStyle='#d9fff3';ctx.lineWidth=2;
  for(let i=0;i<3;i++){
    const yy=(i-1)*12+Math.sin(t*6+i)*4,back=118+i*20;
    ctx.beginPath();ctx.moveTo(back,yy);ctx.quadraticCurveTo(back+30,yy-8,back+58,yy+Math.sin(t*4+i)*8);ctx.stroke();
  }
  ctx.restore();
}

function sharkLayerFin(fill,stroke,x,y,points,rotation=0){
  ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.beginPath();
  ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
}

function drawReefShark(e,t){
  if(drawPaintedReefShark(e,t))return true;
  const x=e.x-camera,y=e.y;if(x<-280||x>vw+280)return true;
  const state=e.sharkState||'patrol',face=e.facing||1,enraged=e.hp===1;
  const targetDx=(nessie.x-e.x)*face,targetDy=nessie.y-e.y;
  const headAim=reducedMotion?0:clamp(Math.atan2(targetDy,Math.max(70,Math.abs(targetDx))),-.3,.3);
  const speed=Math.hypot(e.vx||0,e.vy||0),speedNorm=clamp(speed/SHARK_TUNE.enragedChargeSpeed,0,1);
  const lunge=['charge','lunge','bite'].includes(state),stun=state==='stunned',lock=state==='lock';
  const jawOpen=state==='bite'?.95:state==='lunge'?.58:state==='lock'?.36:state==='stunned'?.12:.08+Math.sin(e.clock*3.1)*.035;
  const tailAmp=reducedMotion?0:(.13+speedNorm*.28+(enraged?.05:0));
  const tail1=Math.sin(e.clock*(4.2+speedNorm*5)+e.phase)*tailAmp;
  const tail2=Math.sin(e.clock*(4.9+speedNorm*6)+e.phase+1.05)*tailAmp*1.45;
  const bodyRoll=reducedMotion?0:Math.sin(e.clock*2.1+e.phase)*.025;
  const blink=e.eyeBlink>.94?1:0;
  const wakeIntensity=lunge?1:state==='stalk'||state==='circle'?.55:0;

  ctx.save();ctx.translate(x,y);ctx.scale(face,1);ctx.rotate(headAim*.45+bodyRoll+Math.sin(e.recoil*12)*e.recoil*.055);
  drawSharkWake(e,t,wakeIntensity);

  // Rear tail stalk and articulated tail lobes.
  ctx.save();ctx.translate(88,2);ctx.rotate(tail1);
  const tailGrad=ctx.createLinearGradient(0,-25,110,25);tailGrad.addColorStop(0,'#4f7777');tailGrad.addColorStop(1,'#304e54');
  ctx.fillStyle=tailGrad;ctx.strokeStyle='#243f47';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-2,-20);ctx.quadraticCurveTo(34,-18,65,-9);ctx.quadraticCurveTo(79,-4,93,0);ctx.quadraticCurveTo(76,8,60,13);ctx.quadraticCurveTo(30,20,-2,18);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.translate(82,0);ctx.rotate(tail2);
  sharkLayerFin('#456b70','#243f47',0,0,[[0,-5],[21,-60],[33,-18],[19,0],[34,20],[19,63],[-3,7]],0);
  ctx.fillStyle='#193943';ctx.beginPath();ctx.moveTo(16,-54);ctx.lineTo(24,-64);ctx.lineTo(29,-43);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(20,52);ctx.lineTo(27,63);ctx.lineTo(30,42);ctx.closePath();ctx.fill();
  ctx.restore();

  // Dorsal fin behind the body.
  sharkLayerFin('#547e7d','#29464b',-3,-31,[[-17,8],[7,-69],[34,5]],-.02+bodyRoll);

  // Main torso volume.
  const body=ctx.createLinearGradient(-104,-55,112,55);
  body.addColorStop(0,'#b7ccc5');body.addColorStop(.18,'#8fb0a9');body.addColorStop(.48,'#608984');body.addColorStop(.78,'#426766');body.addColorStop(1,'#294b50');
  ctx.fillStyle=body;ctx.strokeStyle='#243e45';ctx.lineWidth=3.2;ctx.beginPath();
  ctx.moveTo(-111,-6);ctx.bezierCurveTo(-96,-48,-47,-59,13,-52);ctx.bezierCurveTo(53,-48,83,-32,101,-15);
  ctx.bezierCurveTo(110,-6,111,8,99,17);ctx.bezierCurveTo(72,39,28,48,-29,43);ctx.bezierCurveTo(-77,38,-104,22,-111,-6);ctx.closePath();ctx.fill();ctx.stroke();

  // Belly plane.
  const belly=ctx.createLinearGradient(-95,5,70,35);belly.addColorStop(0,'#dce5dc');belly.addColorStop(1,'#839c91');
  ctx.fillStyle=belly;ctx.globalAlpha=.92;ctx.beginPath();ctx.moveTo(-105,6);ctx.bezierCurveTo(-71,28,-19,36,48,29);ctx.bezierCurveTo(68,27,84,22,97,15);ctx.bezierCurveTo(71,42,24,49,-31,43);ctx.bezierCurveTo(-77,38,-100,24,-105,6);ctx.closePath();ctx.fill();ctx.globalAlpha=1;

  // Pectoral fins.
  const finLift=lunge?-.22:state==='circle'?.12:Math.sin(e.clock*2.4)*.04;
  sharkLayerFin('#628983','#29484a',-1,20,[[-8,-2],[36,12],[14,49],[-14,17]],finLift);
  sharkLayerFin('#4c7474','#29484a',17,-10,[[-5,1],[39,-4],[19,26],[-10,17]],-.15-finLift*.4);

  // Head mass.
  ctx.save();ctx.translate(-72,-5);ctx.rotate(headAim*.55);
  const head=ctx.createRadialGradient(-18,-20,8,0,0,92);head.addColorStop(0,'#b9cdc3');head.addColorStop(.48,'#7c9f98');head.addColorStop(1,'#496d6d');
  ctx.fillStyle=head;ctx.strokeStyle='#29464b';ctx.lineWidth=3;ctx.beginPath();
  ctx.moveTo(-47,-12);ctx.quadraticCurveTo(-42,-43,-6,-48);ctx.quadraticCurveTo(33,-47,48,-18);ctx.quadraticCurveTo(57,0,43,15);ctx.quadraticCurveTo(17,33,-22,27);ctx.quadraticCurveTo(-46,22,-50,5);ctx.closePath();ctx.fill();ctx.stroke();

  // Snout highlight and scars.
  ctx.strokeStyle='#d9eee4';ctx.globalAlpha=.35;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-43,-16);ctx.quadraticCurveTo(-19,-35,12,-31);ctx.stroke();ctx.globalAlpha=1;
  ctx.strokeStyle='#a46e75';ctx.lineWidth=2.3;for(const scar of [[5,-35,13,-25],[22,-30,31,-21],[-3,17,10,21]]){ctx.beginPath();ctx.moveTo(scar[0],scar[1]);ctx.lineTo(scar[2],scar[3]);ctx.stroke();}

  // Mouth cavity and articulated lower jaw.
  ctx.save();ctx.translate(-27,9);ctx.rotate(jawOpen*.25);
  ctx.fillStyle='#401f29';ctx.strokeStyle='#2d1d25';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-13,-4);ctx.quadraticCurveTo(12,-14,49,-7);ctx.quadraticCurveTo(34,16,2,19);ctx.quadraticCurveTo(-14,13,-13,-4);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#7b3949';ctx.beginPath();ctx.ellipse(15,9,20,7,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f6e7c1';for(let i=0;i<7;i++){const tx=-5+i*8,th=7+(i%2)*3;ctx.beginPath();ctx.moveTo(tx,-5);ctx.lineTo(tx+4,-5);ctx.lineTo(tx+2,th*.5);ctx.closePath();ctx.fill();}
  for(let i=0;i<6;i++){const tx=0+i*8,th=6+(i%2)*3;ctx.beginPath();ctx.moveTo(tx,15);ctx.lineTo(tx+4,15);ctx.lineTo(tx+2,15-th*.65);ctx.closePath();ctx.fill();}
  ctx.fillStyle='#ffd45f';ctx.beginPath();ctx.moveTo(28,-5);ctx.lineTo(33,-5);ctx.lineTo(31,4);ctx.closePath();ctx.fill();
  ctx.restore();

  // Eye, tracked pupil and monocle.
  const eyeX=-9,eyeY=-21,pupilX=clamp(targetDx/280,-3.2,3.2),pupilY=clamp(targetDy/220,-2.6,2.6);
  ctx.fillStyle='#edf1d7';ctx.strokeStyle='#314c4c';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(eyeX,eyeY,10,8-blink*6,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  if(!blink){ctx.fillStyle=enraged?'#ffb35c':'#6c8462';ctx.beginPath();ctx.arc(eyeX+pupilX,eyeY+pupilY,4.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#17282b';ctx.beginPath();ctx.arc(eyeX+pupilX+.5,eyeY+pupilY,1.8,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='#d5af53';ctx.lineWidth=2.3;ctx.beginPath();ctx.arc(eyeX,eyeY,14,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(eyeX+11,eyeY+9);ctx.quadraticCurveTo(18,1,31,11);ctx.quadraticCurveTo(39,18,38,29);ctx.stroke();

  // Gills and spotting.
  ctx.strokeStyle='#456b69';ctx.lineWidth=2.2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(27+i*7,-8);ctx.quadraticCurveTo(24+i*7,4,29+i*7,14);ctx.stroke();}
  ctx.fillStyle='#597a72';for(const [sx,sy,r] of [[18,-33,3],[34,-27,2.5],[15,17,2.3],[42,8,2.1],[-27,-31,2.4],[-35,10,2]]){ctx.beginPath();ctx.arc(sx,sy,r,0,Math.PI*2);ctx.fill();}

  // Top hat: deliberately slightly oversized and bouncy like the reference sheet.
  const hatBounce=reducedMotion?0:Math.sin(e.clock*5.1)*2+(lock?2:0);
  ctx.save();ctx.translate(5,-49+hatBounce);ctx.rotate(-.05-headAim*.2);
  ctx.fillStyle='#282a2d';ctx.strokeStyle='#16181c';ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(0,7,26,7,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle='#33363a';ctx.fillRect(-15,-25,30,32);ctx.strokeRect(-15,-25,30,32);
  ctx.fillStyle='#8f4e42';ctx.fillRect(-16,-3,32,7);
  ctx.fillStyle='#777a78';ctx.globalAlpha=.42;ctx.fillRect(-10,-21,4,17);ctx.globalAlpha=1;ctx.restore();

  ctx.restore();

  // Body spots, side highlight and state glow.
  ctx.fillStyle='#537570';for(const [sx,sy,r] of [[-38,-33,3.6],[-18,-39,2.8],[7,-34,3.2],[31,-25,2.7],[48,-12,2.4],[-9,19,2.2],[25,16,2.6],[-55,13,2.4]]){ctx.beginPath();ctx.arc(sx,sy,r,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle=enraged?'#ffd07a66':'#d6fff044';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-56,-40);ctx.quadraticCurveTo(5,-57,70,-24);ctx.stroke();

  if(lock||state==='charge'){
    ctx.save();ctx.strokeStyle=enraged?'#ffd36dcc':'#ffe8a7aa';ctx.lineWidth=2.2;ctx.setLineDash([7,9]);ctx.beginPath();ctx.moveTo(-104,0);ctx.lineTo((e.aimX-e.x)*face,(e.aimY-e.y));ctx.stroke();ctx.setLineDash([]);
    ctx.globalAlpha=.7+.2*Math.sin(t*12);ctx.beginPath();ctx.arc((e.aimX-e.x)*face,(e.aimY-e.y),22+(lock?5:10),0,Math.PI*2);ctx.stroke();ctx.restore();
    drawReleaseBadge(0,-102,'warning',false,t);
  }
  if(stun){
    drawReleaseBadge(0,-105,'combo',false,t);
    ctx.save();ctx.globalAlpha=.9;for(let i=0;i<4;i++){const a=t*3+i*Math.PI/2,r=68;ctx.fillStyle=i%2?'#fff0a8':'#d5fbff';ctx.font='900 18px Nunito,sans-serif';ctx.textAlign='center';ctx.fillText('✦',Math.cos(a)*r,-60+Math.sin(a)*20);}ctx.restore();
  }
  if(enraged&&!stun){
    ctx.save();ctx.globalAlpha=.22+.15*Math.sin(t*7);ctx.strokeStyle='#ffb16a';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(-5,0,124,58,0,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  ctx.restore();
  drawSharkHealthBar(e,x,y,t);
  return true;
}


// Painted, state-specific silhouettes. Low-density mesh moves the tail and fins
// without bending the face, teeth, pinstripes or top hat into rubber.
function sharkPaintedPose(state){
  return state==='stunned'?3:state==='bite'?2:['lock','charge','lunge'].includes(state)?1:0;
}
function drawPaintedReefShark(e,t){
  if(!sharkPaintedArt?.complete||!sharkPaintedArt.naturalWidth)return false;
  const x=e.x-camera;if(x<-260||x>vw+260)return true;
  const state=e.sharkState||'patrol',pose=sharkPaintedPose(state),face=e.facing||1;
  const speed=clamp(Math.hypot(e.vx||0,e.vy||0)/1030,0,1),tick=reducedMotion?0:e.clock;
  const crop=[(pose%2)*.5,Math.floor(pose/2)*.5,.5,.5],w=310,h=207;
  const swimAngle=e.renderAngle||0;
  ctx.save();ctx.translate(x,e.y);ctx.scale(-face,1);
  ctx.rotate(clamp(swimAngle,-.38,.38)*(face>0?-1:1));
  drawSharkWake(e,t,['lunge','bite'].includes(state)?1:state==='circle'?.5:0);
  ctx.rotate(Math.sin(tick*2)*.018+Math.sin(tick*18)*(e.recoil||0)*.045);
  const amplitude=reducedMotion?0:4+speed*7;
  warpedSprite(sharkPaintedArt,crop,w,h,(u,v)=>{
    const tail=Math.max(0,(.43-u)/.43),fin=Math.max(0,(v-.58)/.42);
    return {x:(u-.5)*w,y:(v-.5)*h+Math.sin(tick*(4+speed*5)-u*5)*tail*tail*amplitude+Math.sin(tick*3.4-u*4)*fin*2};
  },6,4);
  ctx.restore();
  if(state==='lock'||state==='charge'){
    // World-space aim stays on the actual committed trajectory when facing flips.
    ctx.save();ctx.strokeStyle=e.hp===1?'#ffbb7d':'#ffe8ac';ctx.globalAlpha=.6;
    ctx.lineWidth=2;ctx.setLineDash([8,10]);ctx.beginPath();ctx.moveTo(x,e.y);ctx.lineTo(e.aimX-camera,e.aimY);ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.arc(e.aimX-camera,e.aimY,22+Math.sin(t*9)*3,0,Math.PI*2);ctx.stroke();ctx.restore();
    drawReleaseBadge(x,e.y-112,'warning',false,t);
  }
  drawSharkHealthBar(e,x,e.y,t);
  if(state==='stunned'){
    ctx.save();ctx.fillStyle='#ffe5a5';ctx.font='900 19px Nunito,sans-serif';ctx.textAlign='center';
    for(let i=0;i<3;i++){const a=(reducedMotion?0:t*3)+i*Math.PI*2/3;ctx.fillText('✦',x+Math.cos(a)*46,e.y-98+Math.sin(a)*12);}ctx.restore();
  }
  return true;
}
