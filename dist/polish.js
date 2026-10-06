'use strict';
// Shared painted surfaces and deformation rigs for the 2.0 release.
const RELEASE_ICONS={
 boost:'M14 2 4 14h7l-1 8 10-12h-7z',
 leap:'M10 14V8H6l6-6 6 6h-4v6z M2 18q3-3 6 0t6 0 8 0v3q-4 3-8 0t-6 0-6 0z',
 heart:'M12 21S1 14 3 7c2-5 7-3 9 0 2-3 7-5 9 0 2 7-9 14-9 14z',
 shield:'M12 2 3 6v6c0 6 9 10 9 10s9-4 9-10V6z M12 6v12c4-3 5-5 5-7V9z',
 warning:'M12 2 23 22H1z M11 8v7h2V8z M11 17v2h2v-2z',
 compass:'M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22z M17 6l-3 8-8 3 3-8z',
 portal:'M12 1C5 1 2 7 2 12s3 11 10 11 10-6 10-11S19 1 12 1z M12 4c4 0 7 4 7 8s-3 8-7 8-7-4-7-8 3-8 7-8z M8 10h5V7l5 5-5 5v-3H8z',
 flip:'M12 2a10 10 0 1 0 10 10h-3a7 7 0 1 1-4-6v4l8-5-8-5v3z',
 double:'M12 2a10 10 0 1 0 10 10h-3a7 7 0 1 1-4-6v4l8-5-8-5v3z M12 8a4 4 0 1 0 4 4h-2a2 2 0 1 1-2-2z',
 combo:'M12 2a10 10 0 1 0 10 10h-3a7 7 0 1 1-4-6v4l8-5-8-5v3z M12 17s-6-4-4-7c2-2 4 0 4 0s2-2 4 0c2 3-4 7-4 7z',
 dive:'M10 2h4v10h4l-6 6-6-6h4z M3 20h18v3H3z'
};
const releasePaths=new Map();
let assetsReady=true,assetsLoaded=0,assetsTotal=18,assetFailed=false;
function updateAssetLoading(){const status=$('asset-status'),play=$('play'),skip=$('skip-training');if(status){status.hidden=assetsReady;status.textContent=assetFailed?'Artwork could not load. Reload to try again.':'Opening the lagoon… '+Math.round(assetsLoaded/assetsTotal*100)+'%';}if(play)play.disabled=!assetsReady;if(skip)skip.disabled=!assetsReady;for(const id of ['mode-sarah','mode-trial','mode-story']){const button=$(id);if(button)button.disabled=!assetsReady;}}
function prepareReleaseArtwork(){const images=[scene,jungle,sprite,dancers,reefArt,rootArt,floraArt,carloArt,miguelArt,ranaArt,sarahArt,portraitArt,kingArt,queenArt,palaceArt,trainingArt,environmentArt,creatureArt,tutorialAtlasArt,...BOSS_V4_IMAGES];assetsReady=false;assetsTotal=images.length;assetsLoaded=0;assetFailed=false;const done=()=>{assetsLoaded++;assetsReady=assetsLoaded===assetsTotal&&!assetFailed;updateAssetLoading();};for(const art of images){if(art.complete&&art.naturalWidth)done();else{art.addEventListener('load',done,{once:true});art.addEventListener('error',()=>{assetFailed=true;updateAssetLoading();},{once:true});}}updateAssetLoading();}
function drawReleaseBadge(x,y,icon,lit,t){
 ctx.save();ctx.translate(x,y);const r=22,glow=lit?'#99ffd9':'#b2dbe9';
 ctx.shadowColor=glow;ctx.shadowBlur=lit&&!reducedMotion?13:3;
 let g=ctx.createLinearGradient(-16,-22,16,22);g.addColorStop(0,lit?'#b6ffe2':'#e0f5fa');g.addColorStop(.35,lit?'#4ea69d':'#648d9e');g.addColorStop(1,'#254a61');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 g=ctx.createLinearGradient(0,-19,0,19);g.addColorStop(0,lit?'#26716c':'#325b72');g.addColorStop(1,'#092b43');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r-2.5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#edfff54d';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,r-5,3.45,5.9);ctx.stroke();
 if(typeof Path2D!=='undefined'){let path=releasePaths.get(icon);if(!path){path=new Path2D(RELEASE_ICONS[icon]||RELEASE_ICONS.compass);releasePaths.set(icon,path);}ctx.translate(-12,-12);ctx.fillStyle=icon==='warning'?'#ffe5a0':icon==='heart'||icon==='combo'?'#ffd0e4':lit?'#d9ffe9':'#e6f8fd';ctx.shadowColor='#061c2c';ctx.shadowOffsetY=1;ctx.shadowBlur=2;ctx.fill(path,'evenodd');}
 ctx.restore();
}
function paintedBubble(x,y,r,alpha=1){if(drawPaintedBubbleArtwork(x,y,r,alpha))return;ctx.save();ctx.globalAlpha=alpha;const g=ctx.createRadialGradient(x-r*.28,y-r*.3,r*.05,x,y,r);g.addColorStop(0,'#ecffff03');g.addColorStop(.65,'#75ddec0a');g.addColorStop(.88,'#a1d7ff20');g.addColorStop(1,'#c5fff57d');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.lineWidth=Math.max(.7,r*.06);ctx.strokeStyle='#d6fff6b8';ctx.beginPath();ctx.arc(x,y,r*.86,3.7,4.95);ctx.stroke();ctx.strokeStyle='#e5c5ff66';ctx.beginPath();ctx.arc(x,y,r*.9,.35,1.3);ctx.stroke();ctx.restore();}
const ENV_CROPS=[[0.005208333333333333, 0.009765625, 0.3600260416666667, 0.478515625], [0.4166666666666667, 0.0, 0.19661458333333334, 0.5], [0.67578125, 0.0078125, 0.3216145833333333, 0.4853515625], [0.009114583333333334, 0.501953125, 0.3385416666666667, 0.48828125], [0.3515625, 0.505859375, 0.3528645833333333, 0.486328125], [0.7063802083333334, 0.4931640625, 0.2877604166666667, 0.4990234375]];
const CREATURE_CROPS=[[0.07747395833333333, 0.0, 0.18619791666666666, 0.48828125], [0.3411458333333333, 0.0927734375, 0.3170572916666667, 0.3759765625], [0.6966145833333334, 0.046875, 0.3001302083333333, 0.4189453125], [0.018229166666666668, 0.4970703125, 0.314453125, 0.5029296875], [0.34375, 0.4892578125, 0.3059895833333333, 0.5107421875], [0.6419270833333334, 0.4853515625, 0.3580729166666667, 0.486328125]];
function atlasDraw(art,crop,x,y,w,h){if(!art?.complete||!art.naturalWidth)return false;ctx.drawImage(art,crop[0]*art.naturalWidth,crop[1]*art.naturalHeight,crop[2]*art.naturalWidth,crop[3]*art.naturalHeight,x,y,w,h);return true;}
function envDraw(tile,x,y,w,h,t=0,animated=false){if(!environmentArt?.complete||!environmentArt.naturalWidth)return false;const crop=ENV_CROPS[tile];if(!animated||reducedMotion)return atlasDraw(environmentArt,crop,x,y,w,h);const rows=14;for(let j=0;j<rows;j++){const v=j/rows,bend=Math.sin(t*.9-v*3)*Math.sin(v*Math.PI)*w*.025;atlasDraw(environmentArt,[crop[0],crop[1]+crop[3]*v,crop[2],crop[3]/rows+.0005],x+bend,y+v*h,w,h/rows+.7);}return true;}
function releaseTrainingBackdrop(t){if(!trainingArt?.complete||!trainingArt.naturalWidth)return false;const w=Math.max(vw*1.14,1460),x=-(w-vw)*camera/(W-vw||1),line=waterSurface(),cut=trainingArt.naturalHeight*.272;ctx.drawImage(trainingArt,0,0,trainingArt.naturalWidth,cut,x,0,w,line);ctx.drawImage(trainingArt,0,cut,trainingArt.naturalWidth,trainingArt.naturalHeight-cut,x,line,w,H-line);ctx.fillStyle='#0b536f16';ctx.fillRect(0,line,vw,H-line);return true;}
function releasePalaceBackdrop(t){if(!palace)return false;ctx.save();const line=waterSurface(),depth=ctx.createLinearGradient(0,line,0,H);depth.addColorStop(0,'#164d6b08');depth.addColorStop(.5,'#164d6b55');depth.addColorStop(1,'#102f4540');ctx.fillStyle=depth;ctx.fillRect(0,line,vw,H-line);
 for(const c of palace.curtains){const x=c.x-camera*.8;ctx.save();ctx.globalAlpha=.22;envDraw(3,x-100,waterSurface()+15,200,300,t,true);ctx.restore();}ctx.restore();return true;}

function releaseFamilyBarrier(o,x,t){if(!environmentArt?.complete||!environmentArt.naturalWidth)return false;if(o.gate)return true;ctx.save();ctx.shadowColor='#043b4966';ctx.shadowBlur=13;ctx.shadowOffsetY=6;envDraw(o.trainingRock||o.trainingJump?0:1,x-12,o.y-12,o.w+24,o.h+24,t);ctx.shadowBlur=0;envDraw(4,x-38,o.y+o.h-60,o.w+76,95,t,true);if(o.trainingRock){ctx.font='800 12px Nunito,sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff2ba';ctx.fillText('ELITE',x+o.w*.5,o.y+o.h*.5);}ctx.restore();return true;}
function releaseFamilyForeground(t){if(!environmentArt?.complete||!environmentArt.naturalWidth)return false;ctx.save();const positions=isTraining()?[110,1110,2350,3540,4470,5660,6400,7340]:[100,820,1850,2680,3650];for(const [i,base]of positions.entries()){const x=base-camera*1.025;if(x<-260||x>vw+260)continue;ctx.globalAlpha=.62;envDraw(4,x-100,896+i%2*15,210,105,t+i,true);}ctx.restore();return true;}

// A continuous triangle mesh bends limbs without cutting gaps through the art.
function warpedSprite(art,crop,w,h,warp,cols=6,rows=10){
 if(!art?.complete||!art.naturalWidth)return;const layout=meshLayout(w,h,cols,rows),verts=layout.vertices,texture=meshTexture(art,crop,w,h);
 for(let i=0;i<verts.length;i++){const v=verts[i],p=warp(v.u,v.v);v.x=p.x;v.y=p.y;}
 for(let i=0;i<layout.triangles.length;i++){const q=layout.triangles[i],a=verts[q.ia],b=verts[q.ib],c=verts[q.ic],aa=a.x*q.ax+b.x*q.bx+c.x*q.cx,bb=a.y*q.ax+b.y*q.bx+c.y*q.cx,cc=a.x*q.ay+b.x*q.by+c.x*q.cy,dd=a.y*q.ay+b.y*q.by+c.y*q.cy,ee=a.x-aa*a.sx-cc*a.sy,ff=a.y-bb*a.sx-dd*a.sy,mx=(a.x+b.x+c.x)/3,my=(a.y+b.y+c.y)/3;ctx.save();ctx.beginPath();let d=Math.hypot(a.x-mx,a.y-my)||1;ctx.moveTo(a.x+(a.x-mx)/d*.4,a.y+(a.y-my)/d*.4);d=Math.hypot(b.x-mx,b.y-my)||1;ctx.lineTo(b.x+(b.x-mx)/d*.4,b.y+(b.y-my)/d*.4);d=Math.hypot(c.x-mx,c.y-my)||1;ctx.lineTo(c.x+(c.x-mx)/d*.4,c.y+(c.y-my)/d*.4);ctx.closePath();ctx.clip();ctx.transform(aa,bb,cc,dd,ee,ff);if(texture)ctx.drawImage(texture,0,0,w,h);else atlasDraw(art,crop,0,0,w,h);ctx.restore();}
}

function releaseRoyal(kind,x,y,height,t,pose){const art=kind==='daddy'?kingArt:queenArt;if(!art.complete||!art.naturalWidth)return false;const tick=reducedMotion?0:t,w=height*.75,hit=kind==='daddy'?training?.hit||0:queen?.hit||0,isQueen=kind==='queen',charging=/Charge/.test(pose),casting=/fan|wave|crown|bloom|whirl|bolt/.test(pose),cast=charging?Math.sin(clamp((isQueen?(queen?.time||0)/1.3:(boss?.clock||0)%10/2.6),0,1)*Math.PI*.5):casting?Math.exp(-(isQueen?(queen?.time||0):Math.max(0,(boss?.clock||0)%10-2.6))*3):0;ctx.save();ctx.translate(x,y);const swimming=pose==='swim';if(swimming){ctx.rotate(clamp(nessie.vx*.0004,-.2,.2)+(leap.active?jumpPose().angle:0));}else ctx.rotate(Math.sin(tick*.8)*.018+Math.sin(hit*11)*hit*.08);if(pose==='whirl')ctx.scale(.74+.26*Math.cos((queen?.time||0)*7),1);ctx.scale(1+hit*.035,1-hit*.025);
 const staffAngle=!isQueen?(Math.sin(tick*1.4)*.035-cast*.13):0;
 warpedSprite(art,[0,0,.5,1],w,height,(u,v)=>{const side=(u-.5)*2,cloth=clamp((v-.42)/.58,0,1),staff=!isQueen?Math.exp(-(((u-.29)/.07)**2)):0;
 let p={x:(u-.5)*w+Math.sin(tick*1.8-v*5)*cloth*height*.024*(1-staff),y:(v-.5)*height+Math.sin(tick*1.6+side*3)*cloth*height*.009*(1-staff)};
 if(!isQueen){const a=staffAngle*staff,dx=(u-.29)*w,dy=(v-.34)*height;p.x+=(Math.cos(a)-1)*dx-Math.sin(a)*dy;p.y+=Math.sin(a)*dx+(Math.cos(a)-1)*dy;}
 spriteJoint(p,u,v,.77,.37,.2,.18,(Math.sin(tick*1.5)*.055-cast*.24)*(isQueen?-1:1),w,height);
 spriteJoint(p,u,v,.36,.38,.12,.17,-cast*.1,w,height);
 spriteJoint(p,u,v,.63,.83,.13,.18,Math.sin(tick*2.1)*.055,w,height);
 spriteJoint(p,u,v,.38,.82,.12,.19,Math.sin(tick*2.1+2.6)*.045,w,height);
 spriteJoint(p,u,v,.65,.23,.24,.2,Math.sin(tick*1.2-v*4)*.035,w,height);
 if(pose==='whirl')p.x+=Math.sin(tick*3.4-v*5)*cloth*height*.02;return p;},12,14);
 if(casting||charging){if(isQueen){characterSpell(-height*.16,-height*.09-cast*height*.025,height*.075,tick,'#ffe4b7',cast);characterSpell(height*.17,-height*.10,height*.06,tick+1,'#ecc7ff',cast);}else{const dx=(.27-.29)*w,dy=(.12-.34)*height,hx=(.29-.5)*w+dx*Math.cos(staffAngle)-dy*Math.sin(staffAngle),hy=(.34-.5)*height+dx*Math.sin(staffAngle)+dy*Math.cos(staffAngle);characterSpell(hx,hy,height*.073,tick,'#a8f4ff',cast);}}

 ctx.restore();return true;}
const CREATURE_KINDS=['seahorse','pearl-crab','puffer','jelly','eel','swordfish'];
function releaseCreature(e,t,small=false){if(!creatureArt?.complete||!creatureArt.naturalWidth)return false;const x=e.x-camera,y=e.y;if(x<-150||x>vw+150)return true;const kind=e.kind||'pearl-crab',index=Math.max(0,CREATURE_KINDS.indexOf(kind)),crop=CREATURE_CROPS[index],tick=reducedMotion?0:(e.clock||t),w=small?e.size*3.3:kind==='swordfish'?157:kind==='eel'?144:kind==='jelly'?108:kind==='puffer'?105:118,h=small?w*.65:kind==='eel'?83:kind==='swordfish'?90:kind==='jelly'?148:kind==='seahorse'?145:101,face=small?(e.dir===1?-1:1):(e.facing||((nessie.x<e.x)?1:-1)),charge=e.windup>0?1-e.windup/.65:0,recoil=Math.max(0,e.recoil||0);
 if(e.windup>0&&!small){const tx=(e.aimX??nessie.x)-camera,ty=e.aimY??nessie.y,attackColor=kind==='puffer'?'#ffd39a':kind==='jelly'?'#d7b7ff':kind==='eel'||kind==='swordfish'?'#9eeeff':'#bfffe1';ctx.save();ctx.globalAlpha=.2+charge*.55;ctx.strokeStyle=attackColor;ctx.lineWidth=1.5+charge*1.6;ctx.setLineDash([5,9]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=.28+charge*.45;ctx.lineWidth=2;ctx.beginPath();ctx.arc(tx,ty,18+charge*14,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(tx-8,ty);ctx.lineTo(tx+8,ty);ctx.moveTo(tx,ty-8);ctx.lineTo(tx,ty+8);ctx.stroke();ctx.restore();}
 ctx.save();ctx.translate(x,y);ctx.scale(face,1);ctx.rotate(kind==='swordfish'?clamp((e.vy||0)*.001,-.18,.18):Math.sin(tick*1.8)*.025);ctx.scale(1-recoil*.09,1+recoil*.07);
 if(small){atlasDraw(creatureArt,crop,-w/2,-h/2,w,h);}else warpedSprite(creatureArt,crop,w,h,(u,v)=>{const tail=Math.pow(u,2),edge=Math.abs(u-.5)*2,low=Math.max(0,(v-.35)/.65),pulse=kind==='puffer'?Math.sin(tick*2)*.025+charge*.1:0;let dx=0,dy=0;if(kind==='jelly'){dx=Math.sin(tick*2.8-v*6+u*4)*low*9;dy=Math.sin(tick*2)*low*4;}else if(kind==='eel'||kind==='swordfish'){dy=Math.sin(tick*(e.charge?9:4)-u*7)*tail*(kind==='eel'?13:8);}else if(kind==='pearl-crab'){dy=Math.sin(tick*6+u*8)*edge*7-Math.sin(charge*Math.PI*.5)*edge*15;dx=Math.sin(tick*4+v*3)*low*edge*3;}else{dx=Math.sin(tick*3-v*5)*low*4;dy=Math.sin(tick*5+u*5)*edge*3;}return{x:(u-.5)*w*(1+pulse)+dx,y:(v-.5)*h*(1+pulse)+dy};},small?2:4,small?2:6);
 ctx.restore();
 if(e.windup>0&&!small){const r=18+charge*9;paintedBubble(x,y-h*.58,r,.85);drawReleaseBadge(x,y-h*.58,'warning',false,t);}
 if(recoil>0&&!small&&!reducedMotion){ctx.save();ctx.globalAlpha=recoil*.5;ctx.strokeStyle='#eafff5';ctx.lineWidth=2;for(let i=0;i<3;i++){const offset=(i-1)*12;ctx.beginPath();ctx.moveTo(x-face*(w*.35+8),y+offset);ctx.lineTo(x-face*(w*.55+22+recoil*20),y+offset);ctx.stroke();}ctx.restore();}
 return true;}
function updateReleaseEnemies(dt){if(isTraining()||isPalace()||isRana())return;for(const e of enemies){if(e.hp<=0||e.scuttle)continue;e.bx??=e.x;e.by??=e.y;e.clock=(e.clock||0)+dt;e.recoil=Math.max(0,(e.recoil||0)-dt*3);e.facing=nessie.x<e.x?1:-1;const distance=Math.hypot(nessie.x-e.x,nessie.y-e.y),engage=distance<530&&!leap.breached,tx=e.bx+(engage?clamp(nessie.x-e.bx,-95,95):Math.sin(e.clock*.65+e.phase)*70),ty=e.by+Math.sin(e.clock*.95+e.phase)*25;const oldX=e.x,oldY=e.y;if(!e.windup){e.x+=(tx-e.x)*(1-Math.exp(-dt*1.5));e.y+=(ty-e.y)*(1-Math.exp(-dt*1.7));}for(const o of obstacles){if(e.x+45>o.x&&e.x-45<o.x+o.w&&e.y+35>o.y&&e.y-35<o.y+o.h){e.x=oldX;e.y=oldY;break;}}if(e.windup>0){e.windup=Math.max(0,e.windup-dt);if(!e.windup){fireEnemyVolley(e);e.recoil=1;e.cooldown=stage===0?2.8:2.5;}}}}
function releaseBossActor(art,x,y,width,mirror=false){if(!art.complete||!art.naturalWidth)return;const tick=reducedMotion?0:elapsed,major=width>200,carlo=art===carloArt,phase=major?(boss.clock%(carlo?7.4:6.8)):tick%5,charge=major&&phase<.9?phase/.9:0,fire=major&&phase>.9&&phase<(carlo?3.6:2.8),recoil=fire?Math.max(0,1-(.8-(boss.shot||0))/.18):0,hit=major?boss.hitCooldown||0:0,h=width*2/3;
 ctx.save();ctx.translate(x-camera,y);if(mirror)ctx.scale(-1,1);ctx.rotate((carlo?.025:.055)*Math.sin(tick*(carlo?2:1.5))+Math.sin(hit*16)*hit*.04);
 warpedSprite(art,[0,0,1,1],width,h,(u,v)=>{let p={x:(u-.5)*width,y:(v-.5)*h};if(carlo){
 for(const side of [-1,1]){const cx=side<0?.2:.82,cycle=tick*2.3+(side<0?0:1.8),lift=Math.sin(cycle)*.06+charge*.18-recoil*.1;
 spriteJoint(p,u,v,cx,.43,.24,.37,side*lift,width,h);
 spriteJoint(p,u,v,side<0?.27:.76,.25,.13,.19,side*(.11+.12*Math.sin(cycle*1.3)+charge*.12),width,h);
 for(let leg=0;leg<3;leg++){const lx=side<0?.12+leg*.11:.88-leg*.1; spriteJoint(p,u,v,lx,.76+leg*.035,.085,.21,side*Math.sin(tick*5+leg*1.3+(side>0?Math.PI:0))*.13,width,h);}}
 spriteJoint(p,u,v,.53,.25,.2,.25,Math.sin(tick*1.1)*.035+recoil*.05,width,h);
 }else{const edge=Math.abs(u-.5)*2,flap=Math.sin(tick*(phase>2.8&&phase<3.8?5.5:2.8)-edge*2.4);p.y+=flap*edge*edge*width*.12;p.x+=Math.sin(tick*2-v*4)*edge*5;spriteJoint(p,u,v,.54,.78,.17,.27,Math.sin(tick*3.3-v*4)*.12,width,h);}
 return p;},12,12);

 if(charge>0||fire){const px=-width*.22,py=carlo?-h*.08:h*.08;paintedBubble(px,py,9+charge*11,.6);}
 ctx.restore();if(major&&boss?.vulnerable&&boss.hp>0){const sx=x-camera,sy=y,pulse=reducedMotion?.5:(Math.sin(tick*6)+1)/2;ctx.save();ctx.globalAlpha=.48+pulse*.3;ctx.strokeStyle='#9dffd0';ctx.shadowColor='#65f0af';ctx.shadowBlur=reducedMotion?0:16;ctx.lineWidth=3;ctx.beginPath();ctx.arc(sx,sy,width*.43+pulse*8,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.8;ctx.shadowBlur=0;ctx.fillStyle='#d9ffe9';ctx.font='900 14px Nunito,sans-serif';ctx.textAlign='center';ctx.fillText('BOOST NOW',sx,sy-height*.56);ctx.restore();}}

function releasePalaceWorld(t){if(!palace||!environmentArt.complete||!environmentArt.naturalWidth)return false;const tick=reducedMotion?0:t;
 for(const g of palace.gates){const x=g.x-camera;if(x<-170||x>vw+170)continue;envDraw(2,x-50,g.y-65,g.w+100,g.h+95,t);const extent=g.closed?(1-g.open)*g.h:0;if(extent>2){ctx.save();const grad=ctx.createLinearGradient(x,g.y,x+g.w,g.y+extent);grad.addColorStop(0,'#d5f4ffdd');grad.addColorStop(.4,'#92d9e69c');grad.addColorStop(1,'#e9ddbbd9');ctx.fillStyle=grad;ctx.strokeStyle='#fff1cd';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x,g.y,g.w,extent,8);ctx.fill();ctx.stroke();for(let j=1;j<4;j++){ctx.fillStyle='#fff9d8cc';ctx.fillRect(x+j*g.w/4-1,g.y+5,2,Math.max(0,extent-10));}ctx.restore();}paintedBubble(x+g.w/2,g.y-45,7,g.closed?.4:.8);}
 for(const e of palace.elevators){const x=e.x-camera;if(x<-150||x>vw+150)continue;ctx.save();ctx.globalAlpha=.65;envDraw(5,x-65,805,130,125,t,true);ctx.restore();for(let j=0;j<11;j++){const py=e.y+e.h-((tick*112+j*33)%e.h);paintedBubble(x+Math.sin(j*2.3+tick*.8)*30,py,4+j%3*3,.45);}const wash=ctx.createLinearGradient(x,e.y,x,e.y+e.h);wash.addColorStop(0,'#affff200');wash.addColorStop(1,'#9bfff018');ctx.fillStyle=wash;ctx.fillRect(x-48,e.y,96,e.h);}
 for(const f of palace.fountains){const x=f.x-camera;if(x<-120||x>vw+120)continue;envDraw(5,x-65,795,130,130,t,true);for(let j=0;j<7;j++)paintedBubble(x+Math.sin(j+tick)*24,860-((tick*80+j*30)%180),3+j%3,.4);}
 if(palace.projection?.life>0){ctx.save();ctx.globalAlpha=Math.min(.42,palace.projection.life*.4);releaseRoyal('queen',palace.projection.x-camera,palace.projection.y,170,t,'idle');ctx.restore();}
 for(const e of enemies)if(e.hp>0)drawPalaceCreature(e,t);
 const x=3280-camera,opening=boss?.active?clamp((queen?.entry||0)/3.1,0,1):0;ctx.save();ctx.globalAlpha=.68;envDraw(2,x-195,460,390,440,t);ctx.restore();
 for(let i=0;i<7;i++){const lx=2920+i*115-camera,lit=!boss?.active||(queen?.entry||0)>i*.35;if(lit)paintedBubble(lx,355,6,.85);}
 drawQueenAttacks(t);if(queen?.victoryReady)for(let i=0;i<9;i++)paintedBubble(3280+i*42-camera,630-Math.sin(i/8*Math.PI)*75,5,.8);return true;}

function resolveEnemyScenery(e){const rx=38,ry=30;for(const o of obstacles){if(e.x+rx<=o.x||e.x-rx>=o.x+o.w||e.y+ry<=o.y||e.y-ry>=o.y+o.h)continue;const edges=[{d:Math.abs(e.x-o.x+rx),x:o.x-rx,y:e.y},{d:Math.abs(e.x-o.x-o.w-rx),x:o.x+o.w+rx,y:e.y},{d:Math.abs(e.y-o.y+ry),x:e.x,y:o.y-ry},{d:Math.abs(e.y-o.y-o.h-ry),x:e.x,y:o.y+o.h+ry}].sort((a,b)=>a.d-b.d);e.x=clamp(edges[0].x,120,2700);e.y=clamp(edges[0].y,waterSurface()+65,865);}}

function releaseLaunchPads(t){
 const line=waterSurface(),near=nearLaunchPad(),tick=reducedMotion?0:t;ctx.save();
 for(const pad of launchPads){if(isTraining()&&training?.step<3)continue;const x=pad.x-camera;if(x<-180||x>vw+180)continue;
  const ready=leap.cooldown<=0&&dashCooldown<=0&&(energy>=.4||boostUnlimited>0||bossLeapReady),active=near===pad,profile=active?jumpProfile(pad):null,cy=line+75;
  const glow=ctx.createRadialGradient(x,cy,5,x,cy,115);glow.addColorStop(0,active?'#a6ffe73d':'#a6ffe71c');glow.addColorStop(1,'#a6ffe700');ctx.fillStyle=glow;ctx.fillRect(x-115,cy-115,230,230);
  const column=ctx.createLinearGradient(x,line,x,875);column.addColorStop(0,active?'#b4fff62a':'#b4fff60a');column.addColorStop(1,'#b4fff500');ctx.fillStyle=column;ctx.fillRect(x-56,line,112,875-line);
  for(let j=0;j<10;j++){const yy=870-((tick*75+j*61)%(870-line));paintedBubble(x+Math.sin(j*2+tick*.8)*34,yy,3+j%3,active?.5:.25);}
  ctx.save();ctx.translate(x,cy);const pulse=1+(active?Math.sin(tick*3)*.025:0);ctx.scale(pulse,pulse);ctx.save();ctx.scale(1,.73);drawPaintedBubbleArtwork(0,0,76,active?.85:.55);ctx.restore();ctx.lineWidth=active?5:3;ctx.strokeStyle=active&&ready?'#c7ffe9':'#91dacaad';ctx.shadowColor='#84ffdc';ctx.shadowBlur=active?19:8;ctx.beginPath();ctx.ellipse(0,0,67,48,-.12,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.strokeStyle='#fff6c77a';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,0,74,54,-.12,Math.PI*1.08,Math.PI*1.87);ctx.stroke();
  for(let j=0;j<3;j++){const a=tick*1.4+j*Math.PI*2/3;paintedBubble(Math.cos(a)*67,Math.sin(a)*48,3,active?.85:.5);}ctx.restore();
  drawReleaseBadge(x,cy,'leap',active&&ready,t);
  if(active){drawReleaseBadge(x,line-30,profile.variant==='boss'?'double':profile.variant==='combo'?'combo':profile.variant==='boost'?'flip':profile.variant==='heart'?'heart':'leap',ready,t);if(ready){drawLaunchKey(x+49,line-30);for(let j=1;j<=16;j++){const u=j/16*profile.airDuration,ax=nessie.x-camera+profile.dir*profile.speed*u,ay=line-Math.sqrt(2*profile.gravity*profile.height)*u+profile.gravity*u*u*.5;paintedBubble(ax,ay,2.2,.6);}}}
 }ctx.restore();
}

// Title and entrances share Sarah's actual articulated in-game sprite.
let titleSceneTime=0;
function smoothUnit(value){const u=clamp(value,0,1);return u*u*(3-2*u);}
function launchTitleMode(next){if(!assetsReady)return;chooseMode(next);selectStage(next==='sarah'?-1:0);start();}
function drawLivingHero(art,w,h,wave,speed=0,air=0){warpedSprite(art,[0,0,1,1],w,h,(u,v)=>{
 const tail=Math.pow(1-u,2),sway=Math.sin(wave-u*5+air*5),fin=Math.sin(wave*1.3-u*7+v*3);let p={x:(u-.5)*w+fin*tail*2,y:(v-.5)*h+sway*tail*(4+speed*5+(air?8:0))};
 spriteJoint(p,u,v,.17,.52,.21,.45,Math.sin(wave*1.1-1.4+air*3)*(.075+speed*.025),w,h);
 spriteJoint(p,u,v,.09,.28,.15,.24,Math.sin(wave*1.5-2)*.12,w,h);
 spriteJoint(p,u,v,.5,.25,.24,.22,Math.sin(wave*.72-u*5)*.035,w,h);
 spriteJoint(p,u,v,.84,.58,.17,.2,Math.sin(wave*.75+.8)*.04,w,h);return p;},8,8);}

function drawTitleScene(t){
 const compact=vw<850,p=reducedMotion?1:smoothUnit(titleSceneTime/1.7),x=compact?vw*.5:vw*.27,y=compact?H*.20:H*.51,w=compact?Math.min(vw*.68,360):Math.min(vw*.43,680),tick=reducedMotion?0:titleSceneTime;
 ctx.save();const light=ctx.createRadialGradient(x,y,5,x,y,w*.7);light.addColorStop(0,'#b2fff51c');light.addColorStop(1,'#b2fff500');ctx.fillStyle=light;ctx.fillRect(0,0,vw,H);
 for(let i=0;i<14;i++){const bx=x+Math.sin(i*2.4)*w*.48,by=y+w*.32-((tick*27+i*37)%(w*.7));paintedBubble(bx,by,3+i%5,.24);}
 // Opening-screen friends only: reuse the painted cast without changing gameplay rigs.
 ctx.save();const greeting=reducedMotion?1:smoothUnit((titleSceneTime-.35)/1.5);ctx.globalAlpha=greeting;
 const friendSize=w*.36,friendY=y+w*.40+Math.sin(tick*1.5+.8)*7;
 if(sprite.complete&&sprite.naturalWidth){ctx.save();ctx.translate(x+w*.06-(1-greeting)*70,friendY);ctx.rotate(Math.sin(tick*.8)*.04);ctx.drawImage(sprite,-friendSize/2,-friendSize/3,friendSize,friendSize*2/3);ctx.restore();}
 ctx.save();ctx.translate(x+w*.48+(1-greeting)*55,y-w*.02+Math.sin(tick*1.7)*8);ctx.rotate(Math.sin(tick)*.055);ctx.scale(-1,1);atlasDraw(creatureArt,CREATURE_CROPS[0],-w*.06,-w*.12,w*.12,w*.24);ctx.restore();ctx.restore();
 ctx.translate(-w+(x+w)*p,y+Math.sin(tick*1.35)*10);ctx.rotate((1-p)*-.24+(reducedMotion?0:Math.sin(tick*.8)*.035));ctx.shadowColor='#94f8ed44';ctx.shadowBlur=26;drawLivingHero(sarahArt,w,w*154/230,tick*2.3,1-p,0);ctx.restore();
}
function entranceDuration(){return reducedMotion?.45:2.4;}
function entrancePose(t){const p=smoothUnit(introTime/entranceDuration()),travel=1-p;return {x:nessie.x-camera-(nessie.x+170)*travel,y:nessie.y+(reducedMotion?0:Math.sin(t*3)*3)-Math.sin(p*Math.PI)*58,angle:-.17*Math.sin(p*Math.PI),p};}
function drawSeamlessEntrance(t){
 const q=entrancePose(t);ctx.save(); if(!reducedMotion)for(let i=0;i<9;i++){const fade=Math.sin(q.p*Math.PI)*.5;paintedBubble(q.x-55-i*17,q.y+Math.sin(i+t*2)*18,3+i%4,fade);}
 drawNessie(q.x,q.y,1,t,q.angle);ctx.restore();
}

function updateTrainingGuide(dt){if(!training)return;if(training.step<0||boss?.active)return;const anchor=[2850,3480,3940,4320,4620,5500,6800][training.step],target=clamp(anchor,nessie.x-120,nessie.x+370);training.guideX+=(target-training.guideX)*(1-Math.exp(-dt*1.9));training.guideY+=(waterSurface()+100-training.guideY)*(1-Math.exp(-dt*2));}

// Light travels along the same centreline used by laser collision checks.
function drawPrismaticBeam(b,t,live){bossSpell(7,b.x1-camera,b.y1,live?70:42,t,live?.9:.5);const x1=b.x1-camera,x2=b.x2-camera,dx=x2-x1,dy=b.y2-b.y1,length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length,tick=reducedMotion?0:t,color=['#ff789f','#bd9fff','#78f3e5'][Math.max(0,(rana?.phase||1)-1)];ctx.save();ctx.lineCap='round';
 const line=()=>{ctx.beginPath();ctx.moveTo(x1,b.y1);ctx.lineTo(x2,b.y2);};
 if(!live){const charge=clamp(rana.time/(RANA_TIMES[rana.state]||1),0,1);line();ctx.strokeStyle='#ffe1a31c';ctx.lineWidth=b.width+12;ctx.stroke();ctx.setLineDash([5,13]);ctx.lineDashOffset=-tick*24;ctx.strokeStyle='#ffe9b3';ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#ffedc7';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x2,b.y2,20-charge*9,-Math.PI/2,-Math.PI/2+Math.PI*2*charge);ctx.stroke();for(const side of [-1,1])paintedBubble(x1+nx*side*(24-charge*16),b.y1+ny*side*(24-charge*16),3+charge*3,.65);}
 else{line();ctx.strokeStyle=color+'25';ctx.lineWidth=b.width+20;ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=b.width;ctx.shadowColor=color;ctx.shadowBlur=reducedMotion?0:12;ctx.stroke();ctx.shadowBlur=0;ctx.strokeStyle='#fffcef';ctx.lineWidth=3;ctx.stroke();
  for(let i=0;i<7;i++){const u=((tick*1.25+i/7)%1),px=x1+dx*u,py=b.y1+dy*u;ctx.strokeStyle='#ffffffb3';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(px-nx*4,py-ny*4);ctx.lineTo(px+nx*4,py+ny*4);ctx.stroke();}
  for(let i=0;i<2;i++){const r=9+((tick*23+i*12)%24);ctx.strokeStyle=color+Math.round((1-(r-9)/24)*170).toString(16).padStart(2,'0');ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x2,b.y2,r,r*.7,Math.atan2(dy,dx),0,Math.PI*2);ctx.stroke();}paintedBubble(x1,b.y1,13,.85);
 }ctx.restore();}

function spriteJoint(p,u,v,cx,cy,rx,ry,angle,w,h){const weight=Math.exp(-2*(((u-cx)/rx)**2+((v-cy)/ry)**2)),a=angle*weight,x=p.x-(cx-.5)*w,y=p.y-(cy-.5)*h,c=Math.cos(a),s=Math.sin(a);p.x=(cx-.5)*w+x*c-y*s;p.y=(cy-.5)*h+x*s+y*c;return p;}
function characterSpell(x,y,r,t,color,charge=1){ctx.save();ctx.translate(x,y);const glow=ctx.createRadialGradient(0,0,1,0,0,r*1.8);glow.addColorStop(0,color+'88');glow.addColorStop(1,color+'00');ctx.fillStyle=glow;ctx.fillRect(-r*1.8,-r*1.8,r*3.6,r*3.6);ctx.strokeStyle=color;ctx.lineWidth=1.5;for(let i=0;i<2;i++){const a=(reducedMotion?0:t*(i?-1:1))+i*Math.PI;ctx.beginPath();ctx.ellipse(0,0,r*(.65+charge*.35),r*.4,a,0,Math.PI*2);ctx.stroke();}for(let i=0;i<5;i++){const a=(reducedMotion?0:t*1.7)+i*Math.PI*2/5;paintedBubble(Math.cos(a)*r,Math.sin(a)*r*.55,2+charge*1.5,.7);}ctx.restore();}

function drawSpellWake(p,t){const x=p.x-camera,y=p.y,bolt=p.type==='training-bolt',color=bolt?'#a9efff':'#ffdfc1',speed=Math.hypot(p.vx,p.vy)||1,dx=p.vx/speed,dy=p.vy/speed;ctx.save();ctx.lineCap='round';for(let k=2;k>=0;k--){ctx.strokeStyle=color+['aa','44','18'][k];ctx.lineWidth=[2,7,16][k];ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-dx*28-dy*7,y-dy*28+dx*7,x-dx*65,y-dy*65);ctx.stroke();}characterSpell(x,y,bolt?15:12,reducedMotion?0:t, color,.35);ctx.restore();}
