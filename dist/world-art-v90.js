'use strict';
// 9.0: one painted world, one decoration pass, solid collision art, actors above scenery.
const WORLD90_PALETTES={tutorial:['#b8fff1','#123c58'],highland:['#b9ffe7','#143b51'],jungle:['#c5fff0','#164653'],palace:['#fff2cf','#444271'],rana:['#ffdba9','#273e62'],shadow:['#dbbaff','#243457'],tunnel:['#91eaff','#081b32']};
function drawPaintedWorld90(t){const theme=worldTheme75(),line=waterSurface(),grotto=isExpandedHighland()&&highland?.fallen;
 const art=isTraining()?trainingArt:worldBackdrop751()||(isPalace()?palaceArt:stage>0?jungle:scene);
 ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 const base=ctx.createLinearGradient(0,0,0,H);base.addColorStop(0,'#81d9e6');base.addColorStop(.3,'#218eae');base.addColorStop(1,WORLD90_PALETTES[theme][1]);ctx.fillStyle=base;ctx.fillRect(0,0,vw,H);
 if(art.complete&&art.naturalWidth){const width=Math.max(vw*1.06,H*art.naturalWidth/art.naturalHeight),x=-(width-vw)*clamp(camera/Math.max(1,W-vw),0,1);
  if(grotto){const sy=art.naturalHeight*.36;ctx.drawImage(art,0,sy,art.naturalWidth,art.naturalHeight-sy,x,0,width,H);const cave=ctx.createLinearGradient(0,0,0,H);cave.addColorStop(0,'#09253eaa');cave.addColorStop(.22,'#10334828');cave.addColorStop(.7,'#10334800');cave.addColorStop(1,'#081e3e38');ctx.fillStyle=cave;ctx.fillRect(0,0,vw,H);}
  else if(['tutorial','highland','jungle','palace','rana'].includes(theme)){
   // Align each painting's actual water horizon with the physical swim/jump surface.
   const horizon={tutorial:.272,highland:.285,jungle:.29,palace:.285,rana:.29}[theme],cut=art.naturalHeight*horizon;
   ctx.drawImage(art,0,0,art.naturalWidth,cut,x,0,width,line);ctx.drawImage(art,0,cut,art.naturalWidth,art.naturalHeight-cut,x,line,width,H-line);
  }else ctx.drawImage(art,x,0,width,H);
 }
 // Grade the distant world only: never wash out actors, solid reefs or rewards.
 const depth=ctx.createLinearGradient(0,line,0,H);depth.addColorStop(0,'#10354a00');depth.addColorStop(.6,'#10354a00');depth.addColorStop(1,WORLD90_PALETTES[theme][1]+'34');ctx.fillStyle=depth;ctx.fillRect(0,line,vw,H-line);ctx.restore();
}
function sceneryPiece90(royal,index,x,y,w,h,alpha=1,flip=false,sway=0){const art=royal?pearlGarden75:reefGarden75,crop=(royal?WORLD86_PEARL_CROPS:WORLD86_REEF_CROPS)[index];if(!crop||!art.complete||!art.naturalWidth||x+w<-40||x>vw+40)return false;
 // Trim atlas padding and preserve the drawing's proportions, anchored to its seabed.
 const scale=Math.min(w/crop[2],h/crop[3]),dw=crop[2]*scale,dh=crop[3]*scale;ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x+w/2,y+h);ctx.transform(flip?-1:1,0,sway,1,0,0);ctx.drawImage(art,...crop,-dw/2,-dh,dw,dh);ctx.restore();return true;
}
function drawScenery90(t){const theme=worldTheme75(),spec=WORLD75_THEMES[theme],tick=reducedMotion?0:t;ctx.save();
 // The painting already contains distant ruins. A sparse, opaque garden supplies nearby depth.
 const spacing=900,first=Math.floor(camera/spacing)-1,last=Math.ceil((camera+vw)/spacing)+1;
 for(let cell=first;cell<=last;cell++){if(cell<0)continue;const seed=cell%97,index=spec.flora[(seed*7)%spec.flora.length],w=180+seed%3*30,h=145+seed%4*18,x=cell*spacing-camera+110;
  sceneryPiece90(spec.royal,index,x,H-h+16,w,h,.92,seed%2===1,Math.sin(tick*.7+seed)*.009);
 }
 // Single intentional landmarks replace stacked faded duplicates.
 for(const p of LEVEL_LANDMARKS751[theme]){const x=W*p[0]-camera-p[3]*.5;sceneryPiece90(p[1],p[2],x,H-Math.min(p[4],220)+25,p[3],Math.min(p[4],220),.92,false,0);}
 ctx.restore();
}
function drawWaterLight90(t,line){const tick=reducedMotion?0:t,theme=worldTheme75(),accent=WORLD90_PALETTES[theme][0];ctx.save();ctx.beginPath();ctx.rect(0,line,vw,H-line);ctx.clip();
 // Fine caustics, rather than several translucent sheets of oversized flora.
 ctx.globalCompositeOperation='screen';ctx.strokeStyle=accent+'12';ctx.lineWidth=1.2;for(let row=0;row<3;row++){ctx.beginPath();for(let x=-20;x<=vw+20;x+=25){const y=H-55-row*27+Math.sin(x*.014+tick*.55+row*1.8)*8;x===-20?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();}
 ctx.globalCompositeOperation='source-over';ctx.fillStyle=accent;ctx.globalAlpha=.32;for(let i=0;i<10;i++){const x=((i*197-camera*.12+tick*7)%(vw+50)+vw+50)%(vw+50)-25,y=line+90+(i*97)%(H-line-120);ctx.beginPath();ctx.arc(x,y,1+i%2*.7,0,Math.PI*2);ctx.fill();}ctx.restore();
}
function drawSeabedEdge90(t){ctx.save();ctx.beginPath();ctx.rect(0,H-52,vw,52);ctx.clip();const spec=WORLD75_THEMES[worldTheme75()],step=680,first=Math.floor(camera*1.035/step)-1;
 for(let i=first;i<first+Math.ceil(vw/step)+3;i++){const x=i*step-camera*1.035;sceneryPiece90(spec.royal,spec.flora[((i%spec.flora.length)+spec.flora.length)%spec.flora.length],x,H-88,160,118,1,i%2===0,0);}ctx.restore();}
function drawHighlandDecoration90(t){drawHighlandWorld(t);}
function envDraw90(tile,x,y,w,h,t=0,animated=false){if(!environmentArt?.complete||!environmentArt.naturalWidth||x+w<-50||x>vw+50)return false;
 const crop=ENV_CROPS[tile],sw=crop[2]*environmentArt.naturalWidth,sh=crop[3]*environmentArt.naturalHeight,scale=Math.min(w/sw,h/sh),dw=sw*scale,dh=sh*scale;
 ctx.save();ctx.translate(x+w/2,y+h);if(animated&&!reducedMotion)ctx.transform(1,0,Math.sin(t*.9+tile)*.012,1,0,0);atlasDraw(environmentArt,crop,-dw/2,-dh,dw,dh);ctx.restore();return true;
}
function installWorld90(){envDraw=envDraw90;
 drawTutorialReefVistas=function(){for(const [wx,width] of [[450,400],[6900,520]]){const x=wx-camera;if(x+width<-30||x-width>vw+30)continue;ctx.save();ctx.globalAlpha=1;tutorialReefPiece(0,x-width/2,890,width,70);ctx.restore();}};sceneryPiece75=sceneryPiece90;drawWorldScenery75=drawScenery90;drawWaterAtmosphere=drawWaterLight90;
 // Historical foreground sprites are already represented in the painting and garden.
 drawDepthLayers=()=>{};drawForeground=()=>{};drawFamilyForeground=()=>{};releasePalaceBackdrop=()=>true;
 drawHighlandRouteRichness=function(t){if(!highland?.fallen)return;const zone=HIGHLAND_ROUTE_ZONES.find(z=>nessie.x>=z.start&&nessie.x<z.end);if(!zone)return;const x=zone.start+500-camera;if(x<-300||x>vw+300)return;const index=HIGHLAND_ROUTE_ZONES.indexOf(zone);sceneryPiece90(index===2,[11,6,1,3,9][index],x,H-250,250,270,1);};
}
