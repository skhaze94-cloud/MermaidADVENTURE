'use strict';
// 7.5: painted scenery, deterministic parallax and collision-aligned materials.
const reefGarden75=new Image();reefGarden75.src='assets/reef-garden-v75.webp';
const pearlGarden75=new Image();pearlGarden75.src='assets/pearl-garden-v75.webp';
const WORLD75_IMAGES=[reefGarden75,pearlGarden75];
const WORLD75_THEMES={tutorial:{royal:true,flora:[0,2,3,7,11],tint:'#a5e9db'},palace:{royal:true,flora:[0,1,2,3,7,11],tint:'#eedafb'},highland:{royal:false,flora:[3,4,6,7,9,11],tint:'#91d5bd'},jungle:{royal:false,flora:[4,5,6,8,10,11],tint:'#89cdb9'},rana:{royal:true,flora:[4,5,6,10,11],tint:'#bbabed'},shadow:{royal:true,flora:[3,4,5,9,10],tint:'#817bad'},tunnel:{royal:false,flora:[1,3,5,6,11],tint:'#5a9bba'}};
function worldTheme75(){return isTraining()?'tutorial':isPalace()?'palace':isDarkTunnel()?'tunnel':isShadowCrabKingdom()?'shadow':stage===0?'highland':stage===1?'jungle':'rana';}
function sceneryReady75(){return WORLD75_IMAGES.every(a=>a.complete&&a.naturalWidth);}
function sceneryPiece75(royal,index,x,y,w,h,alpha=1,flip=false,sway=0){const art=royal?pearlGarden75:reefGarden75;if(!art.complete||!art.naturalWidth||x+w<-80||x>vw+80)return false;const cw=art.naturalWidth/4,ch=art.naturalHeight/3;ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x+w/2,y+h);ctx.transform(flip?-1:1,0,sway,1,0,0);ctx.drawImage(art,index%4*cw,Math.floor(index/4)*ch,cw,ch,-w/2,-h,w,h);ctx.restore();return true;}
function drawWorldScenery75(t){if(!sceneryReady75())return;const theme=WORLD75_THEMES[worldTheme75()],surface=waterSurface();ctx.save();ctx.beginPath();ctx.rect(0,surface+8,vw,H-surface);ctx.clip();
 // Traverse only visible cells, regardless of level length. Distant ruins stay behind routes.
 for(const layer of [0,1]){const rate=layer?.43:.18,spacing=layer?610:920,scroll=camera*rate,start=Math.floor(scroll/spacing)-1,end=Math.ceil((scroll+vw)/spacing)+1;for(let i=start;i<=end;i++){const seed=((i%97)+97)%97,idx=theme.flora[(seed*7+layer*3)%theme.flora.length],w=layer?250+seed%3*55:370+seed%3*75,h=layer?240+seed%4*30:420+seed%3*65,x=i*spacing-scroll+seed%4*27,y=H-h+(layer?35:5);sceneryPiece75(theme.royal,idx,x,y,w,h,layer?.42:.16,seed%2===1,reducedMotion?0:Math.sin(t*.55+seed)*.012);}}
 // Deliberate tutorial landmarks: relic garden, royal learning court, departure arch.
 if(isTraining()){for(const p of [[620,2,200,320],[1560,3,260,180],[2750,7,190,240],[5750,0,170,330],[6660,0,170,340],[7110,0,170,340],[W-190,1,300,400]])sceneryPiece75(true,p[1],p[0]-camera-p[2]/2,H-p[3]+35,p[2],p[3],.68);}
 if(isPalace()){const step=1100,start=Math.floor(camera/step)-1;for(let i=start;i<=start+Math.ceil(vw/step)+2;i++)sceneryPiece75(true,i%3===0?1:0,i*step-camera,H-390,230,420,.52);}
 ctx.restore();}
function drawTextureBarrier75(o,x,t,index=0){if(!sceneryReady75()||x+o.w<-100||x>vw+100)return false;const theme=WORLD75_THEMES[worldTheme75()],royal=theme.royal,art=royal?pearlGarden75:reefGarden75,cw=art.naturalWidth/4,ch=art.naturalHeight/3,idx=royal?(worldTheme75()==='palace'||isTraining()?8:9):0;
 ctx.save();ctx.beginPath();ctx.roundRect(x,o.y,o.w,o.h,Math.min(24,o.w*.2,o.h*.2));ctx.clip();ctx.fillStyle=royal?'#385e76':'#244f63';ctx.fillRect(x,o.y,o.w,o.h);
 // Use a complete painted face rather than repeating a thin horizontal strip.
 const vertical=o.h>o.w,face=royal?(vertical?0:8):(vertical?1:0);
 const crop=royal?(vertical?[.25,.03,.5,.94]:[.05,.49,.9,.47]):(vertical?[.23,.06,.54,.89]:[.05,.38,.9,.56]);
 ctx.drawImage(art,(face%4+crop[0])*cw,(Math.floor(face/4)+crop[1])*ch,crop[2]*cw,crop[3]*ch,x-3,o.y-3,o.w+6,o.h+6);
 const g=ctx.createLinearGradient(x,o.y,x+o.w,o.y+o.h);g.addColorStop(0,royal?'#c6edee24':'#a4ded928');g.addColorStop(1,'#071f4d60');ctx.fillStyle=g;ctx.fillRect(x,o.y,o.w,o.h);ctx.restore();
 ctx.save();ctx.strokeStyle=royal?'#bbe9eb80':'#88c6c980';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x+1,o.y+1,o.w-2,o.h-2,Math.min(24,o.w*.2,o.h*.2));ctx.stroke();ctx.restore();
 return true;}
function drawWaterfallScenery75(t,f,cx,half){if(!sceneryReady75())return;for(let i=-1;i<Math.ceil(H/320)+2;i++){const y=i*320-((f.depth*.65)%320);sceneryPiece75(false,i%2?1:11,cx-half-230,y,290,400,.65);sceneryPiece75(false,i%2?3:1,cx+half-50,y+90,290,400,.65,true);} }
