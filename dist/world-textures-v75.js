'use strict';
// 7.5: painted scenery, deterministic parallax and collision-aligned materials.
const reefGarden75=new Image();reefGarden75.src='assets/reef-garden-v75.webp';
const pearlGarden75=new Image();pearlGarden75.src='assets/pearl-garden-v75.webp';
const shadowScene751=new Image();shadowScene751.src='assets/shadow-kingdom-v751.webp';
const tunnelScene751=new Image();tunnelScene751.src='assets/pearl-grotto-v751.webp';
const ranaScene751=new Image();ranaScene751.src='assets/rainbow-temple-v751.webp';
const WORLD75_IMAGES=[reefGarden75,pearlGarden75,shadowScene751,tunnelScene751,ranaScene751];
const WORLD75_THEMES={tutorial:{royal:true,flora:[0,2,3,7,11],tint:'#a5e9db'},palace:{royal:true,flora:[0,1,2,3,7,11],tint:'#eedafb'},highland:{royal:false,flora:[3,4,6,7,9,11],tint:'#91d5bd'},jungle:{royal:false,flora:[4,5,6,8,10,11],tint:'#89cdb9'},rana:{royal:true,flora:[4,5,6,10,11],tint:'#bbabed'},shadow:{royal:true,flora:[3,4,5,9,10],tint:'#817bad'},tunnel:{royal:false,flora:[1,3,5,6,11],tint:'#5a9bba'}};
function worldTheme75(){return isTraining()?'tutorial':isPalace()?'palace':isDarkTunnel()?'tunnel':isShadowCrabKingdom()?'shadow':stage===0?'highland':stage===1?'jungle':'rana';}
function sceneryReady75(){return WORLD75_IMAGES.every(a=>a.complete&&a.naturalWidth);}
function sceneryPiece75(royal,index,x,y,w,h,alpha=1,flip=false,sway=0){const art=royal?pearlGarden75:reefGarden75;if(!art.complete||!art.naturalWidth||x+w<-80||x>vw+80)return false;const cw=art.naturalWidth/4,ch=art.naturalHeight/3;ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x+w/2,y+h);ctx.transform(flip?-1:1,0,sway,1,0,0);ctx.drawImage(art,index%4*cw,Math.floor(index/4)*ch,cw,ch,-w/2,-h,w,h);ctx.restore();return true;}
function drawWorldScenery75(t){if(!sceneryReady75())return;const theme=WORLD75_THEMES[worldTheme75()],surface=waterSurface();ctx.save();ctx.beginPath();ctx.rect(0,surface+8,vw,H-surface);ctx.clip();
 // Traverse only visible cells, regardless of level length. Distant ruins stay behind routes.
 for(const layer of [0,1]){const rate=layer?.43:.18,spacing=layer?760:1080,scroll=camera*rate,start=Math.floor(scroll/spacing)-1,end=Math.ceil((scroll+vw)/spacing)+1;for(let i=start;i<=end;i++){const seed=((i%97)+97)%97,idx=theme.flora[(seed*7+layer*3)%theme.flora.length],w=layer?250+seed%3*55:370+seed%3*75,h=layer?240+seed%4*30:420+seed%3*65,x=i*spacing-scroll+seed%4*27,y=H-h+(layer?35:5);sceneryPiece75(theme.royal,idx,x,y,w,h,layer?.55:.23,seed%2===1,reducedMotion?0:Math.sin(t*.55+seed)*.012);}}
 // Deliberate tutorial landmarks: relic garden, royal learning court, departure arch.
 if(isTraining()){for(const p of [[620,2,200,320],[1560,3,260,180],[2750,7,190,240],[5750,0,170,330],[6660,0,170,340],[7110,0,170,340],[W-190,1,300,400]])sceneryPiece75(true,p[1],p[0]-camera-p[2]/2,H-p[3]+35,p[2],p[3],.68);}
 if(isPalace()){const step=1100,start=Math.floor(camera/step)-1;for(let i=start;i<=start+Math.ceil(vw/step)+2;i++)sceneryPiece75(true,i%3===0?1:0,i*step-camera,H-390,230,420,.52);}
 drawLevelLandmarks751(t);drawReefAtmosphere751(t,theme,surface);ctx.restore();}
function drawTextureBarrier75(o,x,t,index=0){if(typeof drawWorldSolid86==='function'&&drawWorldSolid86(o,x,t,index))return true;if(!sceneryReady75()||x+o.w<-100||x>vw+100)return false;const theme=WORLD75_THEMES[worldTheme75()],royal=theme.royal,art=royal?pearlGarden75:reefGarden75,cw=art.naturalWidth/4,ch=art.naturalHeight/3,idx=royal?(worldTheme75()==='palace'||isTraining()?8:9):0;
 ctx.save();reefContour751(x,o.y,o.w,o.h,index);ctx.clip();
 const vertical=o.h>o.w,face=royal?(vertical?0:8):(vertical?1:0);
 const crop=royal?(vertical?[.25,.03,.5,.94]:[.05,.49,.9,.47]):(vertical?[.23,.06,.54,.89]:[.05,.38,.9,.56]);
 ctx.drawImage(art,(face%4+crop[0])*cw,(Math.floor(face/4)+crop[1])*ch,crop[2]*cw,crop[3]*ch,x-3,o.y-3,o.w+6,o.h+6);
 ctx.restore();
 return true;}
function drawWaterfallScenery75(t,f,cx,half){if(!sceneryReady75())return;for(let i=-1;i<Math.ceil(H/320)+2;i++){const y=i*320-((f.depth*.65)%320);sceneryPiece75(false,i%2?1:11,cx-half-230,y,290,400,.65);sceneryPiece75(false,i%2?3:1,cx+half-50,y+90,290,400,.65,true);} }

// Edges stay inside the same collider while small mineral contours break up uniform panels.
function reefContour751(x,y,w,h,i){const r=Math.min(17,w*.12,h*.12),n=Math.sin(i*1.73)*r*.2;ctx.beginPath();ctx.moveTo(x+r,y+2);ctx.quadraticCurveTo(x+w*.32,y+n,x+w*.62,y+2);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w-2,y+h*.62);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+w*.45,y+h-2);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x+2,y+h*.34);ctx.quadraticCurveTo(x,y,x+r,y+2);ctx.closePath();}
function worldBackdrop751(){return isDarkTunnel()?tunnelScene751:isShadowCrabKingdom()?shadowScene751:stage===3?ranaScene751:null;}
function drawReefAtmosphere751(t,theme,surface){const dark=isDarkTunnel()||isShadowCrabKingdom(),tick=reducedMotion?0:t;
 // Seabed shimmer is confined below swimming space. No new per-frame objects or particle arrays.
 ctx.save();ctx.strokeStyle=theme.tint;ctx.globalAlpha=dark?.035:.055;ctx.lineWidth=1.3;for(let row=0;row<4;row++){ctx.beginPath();for(let x=-30;x<vw+40;x+=35){const y=H-16-row*13+Math.sin(x*.017+tick*.4+row*2)*7;x===-30?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();}
 ctx.globalAlpha=1;const haze=ctx.createLinearGradient(0,H-140,0,H);haze.addColorStop(0,'#071b3400');haze.addColorStop(1,dark?'#06112670':'#083d4945');ctx.fillStyle=haze;ctx.fillRect(0,H-140,vw,140);
 // Pearl motes are small and slow; their colour is distinct from pickups and attack cues.
 ctx.globalAlpha=dark?.24:.32;ctx.fillStyle=theme.tint;for(let i=0;i<9;i++){const x=((i*241-camera*.26+Math.sin(tick*.28+i)*13)%(vw+90)+vw+90)%(vw+90)-45,y=surface+80+((i*89-tick*6)%(H-surface-140)+(H-surface-140))%(H-surface-140);ctx.beginPath();ctx.arc(x,y,i%3===0?1.8:1.1,0,Math.PI*2);ctx.fill();}ctx.restore();}

const LEVEL_LANDMARKS751={
 tutorial:[[.04,true,2,210,330],[.32,true,7,220,270],[.62,false,6,230,300]],
 highland:[[.09,false,3,270,285],[.26,false,11,300,370],[.48,false,9,230,200],[.74,false,6,270,330],[.94,false,4,240,245]],
 jungle:[[.06,false,6,270,320],[.3,false,11,300,340],[.52,false,5,260,280],[.73,false,8,240,180],[.93,false,6,310,350]],
 palace:[[.08,true,2,210,340],[.29,true,7,230,280],[.53,true,3,280,220],[.76,true,2,230,350],[.95,true,7,240,290]],
 rana:[[.09,true,4,250,290],[.35,true,3,280,230],[.61,true,6,250,310],[.88,true,5,280,340]],
 shadow:[[.06,true,3,270,240],[.3,true,0,160,330],[.52,true,10,220,220],[.77,true,3,280,230],[.95,true,5,240,300]],
 tunnel:[[.07,false,3,280,300],[.27,true,4,220,210],[.5,false,11,320,360],[.73,true,5,200,280],[.95,true,6,230,310]]
};
function drawLevelLandmarks751(t){for(const p of LEVEL_LANDMARKS751[worldTheme75()]){const x=W*p[0]-camera-p[3]*.5;sceneryPiece75(p[1],p[2],x,H-p[4]+35,p[3],p[4],isDarkTunnel()?.38:.62,false,reducedMotion?0:Math.sin(t*.45+p[0]*20)*.008);}}
