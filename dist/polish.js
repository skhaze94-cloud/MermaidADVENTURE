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
// Loading gate: Play stays disabled until every artwork image has loaded.
// Each image settles exactly once; already-broken images count as failures
// instead of hanging the counter; failed images are retried automatically.
let assetsReady=false,assetsLoaded=0,assetsTotal=0,assetFailed=false,assetSlow=false,assetRetries=0,assetWatchdog=0,assetRetryTimer=0;
const ASSET_MAX_RETRIES=2,ASSET_RETRY_DELAY=1500,ASSET_SLOW_AFTER=20000;
function updateAssetLoading(){const status=$('asset-status'),play=$('play'),skip=$('skip-training');if(status){status.hidden=assetsReady;const pct=assetsTotal?Math.min(100,Math.round(assetsLoaded/assetsTotal*100)):0;status.textContent=assetFailed?'Some artwork could not load. Check your connection and reload the page.':assetSlow?'Still opening the lagoon… '+pct+'% (slow connection)':'Opening the lagoon… '+pct+'%';}if(play)play.disabled=!assetsReady;if(skip)skip.disabled=!assetsReady;for(const id of ['mode-sarah','mode-trial','mode-story']){const button=$(id);if(button)button.disabled=!assetsReady;}}
function clearAssetTimer(id){if(id&&typeof clearTimeout==='function')clearTimeout(id);return 0;}
function assetTimer(fn,ms){if(typeof setTimeout!=='function')return 0;const id=setTimeout(fn,ms);id?.unref?.();return id;}
function prepareReleaseArtwork(){const images=[scene,jungle,sprite,dancers,reefArt,rootArt,floraArt,carloArt,miguelArt,ranaArt,sarahArt,portraitArt,kingArt,queenArt,palaceArt,trainingArt,environmentArt,creatureArt,tutorialAtlasArt,...BOSS_V4_IMAGES,sharkPaintedArt,tutorialReefArt,tutorialFaceArt].filter(Boolean);assetsReady=false;assetsTotal=images.length;assetsLoaded=0;assetFailed=false;assetSlow=false;assetRetries=0;assetWatchdog=clearAssetTimer(assetWatchdog);assetRetryTimer=clearAssetTimer(assetRetryTimer);let pending=new Set();
 const finish=()=>{assetWatchdog=clearAssetTimer(assetWatchdog);assetRetryTimer=clearAssetTimer(assetRetryTimer);updateAssetLoading();};
 const check=()=>{if(pending.size)return updateAssetLoading();const failed=images.filter(a=>a._assetState==='failed');if(!failed.length){assetsReady=true;assetSlow=false;return finish();}if(assetRetries<ASSET_MAX_RETRIES){assetRetries++;updateAssetLoading();assetRetryTimer=assetTimer(()=>{for(const a of failed)watch(a,true);},ASSET_RETRY_DELAY*assetRetries);return;}assetFailed=true;finish();};
 const settle=(art,ok)=>{if(!pending.has(art))return;pending.delete(art);art._assetState=ok?'loaded':'failed';if(ok)assetsLoaded++;check();};
 const watch=(art,retry=false)=>{pending.add(art);art._assetState='pending';art.addEventListener('load',()=>settle(art,true),{once:true});art.addEventListener('error',()=>settle(art,false),{once:true});if(retry&&art.src){const base=art.src.replace(/[?&]retry=\d+$/,'');art.src=base+(base.includes('?')?'&':'?')+'retry='+assetRetries;}else if(art.complete)settle(art,!!art.naturalWidth);};
 for(const art of images)watch(art);
 if(images.some(a=>a._assetState==='pending'))assetWatchdog=assetTimer(()=>{if(!assetsReady&&!assetFailed){assetSlow=true;updateAssetLoading();}},ASSET_SLOW_AFTER);
 check();}
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
 for(const c of palace.curtains){const x=c.x-camera*.8;ctx.save();ctx.globalAlpha=.12;envDraw(3,x-100,waterSurface()+15,200,300,t,true);ctx.restore();}ctx.restore();return true;}

function releaseFamilyBarrier(o,x,t){if(drawTutorialReefBarrier(o,x,t))return true;if(!environmentArt?.complete||!environmentArt.naturalWidth)return false;if(o.gate)return true;ctx.save();ctx.shadowColor='#043b4966';ctx.shadowBlur=8;ctx.shadowOffsetY=4;envDraw(o.trainingRock||o.trainingJump?0:1,x-12,o.y-12,o.w+24,o.h+24,t);ctx.shadowBlur=0;ctx.globalAlpha=.38;envDraw(4,x-28,o.y+o.h-48,o.w+56,76,t,true);ctx.globalAlpha=1;if(o.trainingRock){ctx.font='800 12px Nunito,sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff2ba';ctx.fillText('ELITE',x+o.w*.5,o.y+o.h*.5);}ctx.restore();return true;}
function releaseFamilyForeground(t){if(!environmentArt?.complete||!environmentArt.naturalWidth)return false;ctx.save();let positions;if(isTraining())positions=[160,2350,4470,6400];else if(isExtendedStoryStage()){const spacing=4200,first=Math.floor((camera-1200)/spacing)-1;positions=Array.from({length:6},(_,i)=>700+(first+i)*spacing+stage*260).filter(x=>x>0&&x<W-250);}else positions=[180,1900,3700,5600];for(const [i,base]of positions.entries()){const x=base-camera*1.018;if(x<-260||x>vw+260)continue;ctx.globalAlpha=.26;envDraw(4,x-88,904+i%2*11,176,82,t+i,true);}ctx.restore();return true;}

// A continuous triangle mesh bends limbs without cutting gaps through the art.
function warpedSprite(art,crop,w,h,warp,cols=6,rows=10){
 if(!art?.complete||!art.naturalWidth)return;const layout=meshLayout(w,h,cols,rows),verts=layout.vertices,texture=meshTexture(art,crop,w,h);
 for(let i=0;i<verts.length;i++){const v=verts[i],p=warp(v.u,v.v);v.x=p.x;v.y=p.y;}
 for(let i=0;i<layout.triangles.length;i++){const q=layout.triangles[i],a=verts[q.ia],b=verts[q.ib],c=verts[q.ic],aa=a.x*q.ax+b.x*q.bx+c.x*q.cx,bb=a.y*q.ax+b.y*q.bx+c.y*q.cx,cc=a.x*q.ay+b.x*q.by+c.y*q.cy,dd=a.y*q.ay+b.y*q.by+c.y*q.cy,ee=a.x-aa*a.sx-cc*a.sy,ff=a.y-bb*a.sx-dd*a.sy,mx=(a.x+b.x+c.x)/3,my=(a.y+b.y+c.y)/3;ctx.save();ctx.beginPath();let d=Math.hypot(a.x-mx,a.y-my)||1;ctx.moveTo(a.x+(a.x-mx)/d*.4,a.y+(a.y-my)/d*.4);d=Math.hypot(b.x-mx,b.y-my)||1;ctx.lineTo(b.x+(b.x-mx)/d*.4,b.y+(b.y-my)/d*.4);d=Math.hypot(c.x-mx,c.y-my)||1;ctx.lineTo(c.x+(c.x-mx)/d*.4,c.y+(c.y-my)/d*.4);ctx.closePath();ctx.clip();ctx.transform(aa,bb,cc,dd,ee,ff);if(texture)ctx.drawImage(texture,0,0,w,h);else atlasDraw(art,crop,0,0,w,h);ctx.restore();}
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
function releaseCreature(e,t,small=false){if(isReefShark(e))return drawReefShark(e,t);if(isSparkEel(e))return drawSparkEel(e,t,small);if(!creatureArt?.complete||!creatureArt.naturalWidth)return false;const x=e.x-camera,y=e.y;if(x<-150||x>vw+150)return true;const kind=e.kind||'pearl-crab',index=Math.max(0,CREATURE_KINDS.indexOf(kind)),crop=CREATURE_CROPS[index],tick=reducedMotion?0:(e.clock||t),w=small?e.size*3.3:kind==='swordfish'?157:kind==='eel'?144:kind==='jelly'?108:kind==='puffer'?105:118,h=small?w*.65:kind==='eel'?83:kind==='swordfish'?90:kind==='jelly'?148:kind==='seahorse'?145:101,face=small?(e.dir===1?-1:1):(e.facing||((nessie.x<e.x)?1:-1)),charge=e.windup>0?1-e.windup/.65:0,recoil=Math.max(0,e.recoil||0);
 if(!small){ctx.save();ctx.globalAlpha=.16;ctx.fillStyle='#001d35';ctx.beginPath();ctx.ellipse(x,y+h*.34,w*.34,h*.12,0,0,Math.PI*2);ctx.fill();ctx.restore();}
 if(e.windup>0&&!small){const tx=(e.aimX??nessie.x)-camera,ty=e.aimY??nessie.y,attackColor=kind==='puffer'?'#ffd39a':kind==='jelly'?'#d7b7ff':kind==='eel'||kind==='swordfish'?'#9eeeff':'#bfffe1';ctx.save();ctx.globalAlpha=.2+charge*.55;ctx.strokeStyle=attackColor;ctx.lineWidth=1.5+charge*1.6;ctx.setLineDash([5,9]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(tx,ty);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=.28+charge*.45;ctx.lineWidth=2;ctx.beginPath();ctx.arc(tx,ty,18+charge*14,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(tx-8,ty);ctx.lineTo(tx+8,ty);ctx.moveTo(tx,ty-8);ctx.lineTo(tx,ty+8);ctx.stroke();ctx.restore();}
 ctx.save();ctx.translate(x,y);ctx.scale(face,1);const playerTilt=!small?clamp(Math.atan2(nessie.y-e.y,Math.max(90,-(nessie.x-e.x)*face)),-.3,.3):0;ctx.rotate((e.renderTilt||0)+playerTilt*.55+(kind==='swordfish'?clamp((e.vy||0)*.0008,-.16,.16):Math.sin(tick*1.8)*.018));ctx.scale(1-recoil*.09,1+recoil*.07);
 if(small){warpedSprite(creatureArt,crop,w,h,(u,v)=>{const tail=Math.pow(u,2),edge=Math.abs(u-.5)*2,low=Math.max(0,(v-.35)/.65);let dx=0,dy=0;if(kind==='jelly'){dx=Math.sin(tick*2.2-v*5+u*3)*low*3.5;dy=Math.sin(tick*1.7+u*2)*low*3;}else if(kind==='eel'||kind==='swordfish'){dy=Math.sin(tick*(kind==='eel'?4.8:3.7)-u*6)*tail*(kind==='eel'?5.5:4);}else if(kind==='seahorse'){dx=Math.sin(tick*2-v*4)*low*2.8;dy=Math.sin(tick*3+u*4)*edge*2.2;}else if(kind==='puffer'){const puff=.03+Math.sin(tick*2.4)*.018;dx=(u-.5)*w*puff;dy=(v-.5)*h*puff;}else{dy=Math.sin(tick*5+u*5)*edge*2.8;}return{x:(u-.5)*w+dx,y:(v-.5)*h+dy};},2,3);}else warpedSprite(creatureArt,crop,w,h,(u,v)=>{const tail=Math.pow(u,2),edge=Math.abs(u-.5)*2,low=Math.max(0,(v-.35)/.65),pulse=kind==='puffer'?Math.sin(tick*2)*.025+charge*.1:0;let dx=0,dy=0;if(kind==='jelly'){dx=Math.sin(tick*2.8-v*6+u*4)*low*9;dy=Math.sin(tick*2)*low*4;}else if(kind==='eel'||kind==='swordfish'){dy=Math.sin(tick*(e.charge?9:4)-u*7)*tail*(kind==='eel'?13:8);}else if(kind==='pearl-crab'){dy=Math.sin(tick*6+u*8)*edge*7-Math.sin(charge*Math.PI*.5)*edge*15;dx=Math.sin(tick*4+v*3)*low*edge*3;}else{dx=Math.sin(tick*3-v*5)*low*4;dy=Math.sin(tick*5+u*5)*edge*3;}return{x:(u-.5)*w*(1+pulse)+dx,y:(v-.5)*h*(1+pulse)+dy};},4,6);
 if(!small){ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=.35+charge*.35;ctx.strokeStyle=kind==='puffer'?'#ffe3a8':kind==='jelly'?'#edc8ff':kind==='eel'||kind==='swordfish'?'#b8fbff':'#d6ffe9';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-w*.28,-h*.22);ctx.quadraticCurveTo(0,-h*.38,w*.23,-h*.18);ctx.stroke();ctx.globalCompositeOperation='source-over';ctx.fillStyle='#fff';ctx.globalAlpha=.72;ctx.beginPath();ctx.arc(-w*.29,-h*.12,kind==='puffer'?3.5:2.8,0,Math.PI*2);ctx.fill();if(kind==='puffer'&&charge>.08){ctx.strokeStyle='#ffd39a';ctx.globalAlpha=.42+.4*charge;for(let i=0;i<9;i++){const a=i/9*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(a)*w*.28,Math.sin(a)*h*.3);ctx.lineTo(Math.cos(a)*(w*.34+charge*8),Math.sin(a)*(h*.38+charge*7));ctx.stroke();}}ctx.restore();}
 ctx.restore();
 if(e.windup>0&&!small){const r=18+charge*9;paintedBubble(x,y-h*.58,r,.85);drawReleaseBadge(x,y-h*.58,'warning',false,t);}
 if(!small&&!reducedMotion&&Math.hypot(e.vx||0,e.vy||0)>120&&(kind==='swordfish'||kind==='eel')){ctx.save();ctx.globalAlpha=.2;ctx.strokeStyle=kind==='eel'?'#9ef7ff':'#d6fff3';ctx.lineWidth=2;for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(x+face*w*.34,y+(i-.5)*12);ctx.lineTo(x+face*w*.58,y+(i-.5)*17);ctx.stroke();}ctx.restore();}
 if(recoil>0&&!small&&!reducedMotion){ctx.save();ctx.globalAlpha=recoil*.5;ctx.strokeStyle='#eafff5';ctx.lineWidth=2;for(let i=0;i<3;i++){const offset=(i-1)*12;ctx.beginPath();ctx.moveTo(x-face*(w*.35+8),y+offset);ctx.lineTo(x-face*(w*.55+22+recoil*20),y+offset);ctx.stroke();}ctx.restore();}
 return true;}
const RELEASE_ENEMY_PROFILE={
 seahorse:{range:500,follow:110,speedX:1.8,speedY:2.1,fire:2.7},
 puffer:{range:470,follow:70,speedX:1.25,speedY:1.45,fire:3.0},
 jelly:{range:540,follow:85,speedX:1.05,speedY:2.4,fire:2.8},
 eel:{range:590,follow:135,speedX:2.05,speedY:2.3,fire:2.45},
 swordfish:{range:640,follow:150,speedX:2.3,speedY:2.55,fire:2.3},
 'pearl-crab':{range:430,follow:60,speedX:1.1,speedY:1.3,fire:3.2}
};
