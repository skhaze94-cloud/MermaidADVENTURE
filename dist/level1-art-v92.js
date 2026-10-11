'use strict';
// 9.2: supplied paintings become cached, transparent scenery for chapter one only.
const LEVEL92_IMAGES=[
 "assets/level1-sandbanks-v92.webp","assets/level1-bubble-vents-v92.webp","assets/level1-sand-currents-v92.webp",
 "assets/level1-reef-stone-v92.webp","assets/level1-crystal-coral-v92.webp","assets/level1-glow-gardens-v92.webp",
 "assets/level1-current-tubes-v92.webp","assets/level1-shell-ruins-v92.webp","assets/level1-reef-fish-v92.webp"
].map(src=>{const art=new Image();art.src=src;return art;});
const LEVEL92_CROPS={
 sand:[0,[.005,.015,.40,.25]],sandSmall:[0,[.42,.055,.235,.21]],
 bubbles:[1,[.31,.046,.207,.35]],eddy:[2,[.005,.008,.395,.23]],sandShelf:[2,[.006,.563,.448,.101]],
 stone:[3,[.277,.012,.23,.239]],shellRock:[3,[.005,.005,.267,.248]],ledge:[3,[.005,.516,.182,.133]],material:[3,[.355,.067,.065,.13]],
 crystal:[4,[.66,.295,.145,.16]],fan:[5,[.008,.008,.25,.242]],
 tube:[6,[.005,.005,.32,.17]],tubeUp:[6,[.005,.185,.19,.24]],
 arch:[7,[.338,.002,.36,.286]],column:[7,[.004,.003,.105,.287]],statue:[7,[.699,.002,.19,.313]],ruinShelf:[7,[.005,.293,.35,.12]],
 fish:[8,[.002,.002,.08,.108]]
};
const LEVEL92_SPRITES=new Map();
function level192(){return isExpandedHighland()&&!isShadowCrabKingdom()&&!isDarkTunnel();}
// Connected navy is the atlas matte. Bright blue coral and enclosed rock shading survive.
function cutoutPixels92(p,w,h,hasAlpha=false){
 const n=w*h,mask=new Uint8Array(n),queue=new Int32Array(n);let head=0,tail=0;
 const navy=i=>{const k=i*4,r=p[k],g=p[k+1],b=p[k+2];return p[k+3]<12||(!hasAlpha&&r<16&&g<95&&b<155&&b>g*1.28);};
 const add=i=>{if(!mask[i]&&navy(i)){mask[i]=1;queue[tail++]=i;}};
 for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=1;y<h-1;y++){add(y*w);add(y*w+w-1);}
 while(head<tail){const i=queue[head++],x=i%w;if(x)add(i-1);if(x<w-1)add(i+1);if(i>=w)add(i-w);if(i<n-w)add(i+w);}
 for(let i=0;i<n;i++){const k=i*4;if(mask[i]||p[k+3]<12)p[k+3]=0;else if(!hasAlpha){const x=i%w,edge=(x&&mask[i-1])||(x<w-1&&mask[i+1])||(i>=w&&mask[i-w])||(i<n-w&&mask[i+w]);if(edge&&p[k]<50&&p[k+1]<95&&p[k+2]<145)p[k+3]=Math.min(p[k+3],150);}}
 return p;
}
function sprite92(name){if(LEVEL92_SPRITES.has(name))return LEVEL92_SPRITES.get(name);const spec=LEVEL92_CROPS[name];if(!spec||typeof OffscreenCanvas==='undefined')return null;
 const [atlas,crop]=spec,art=LEVEL92_IMAGES[atlas];if(!art?.complete||!art.naturalWidth)return null;
 const w=Math.round(crop[2]*art.naturalWidth),h=Math.round(crop[3]*art.naturalHeight),raw=new OffscreenCanvas(w,h),c=raw.getContext('2d',{willReadFrequently:true});
 c.drawImage(art,crop[0]*art.naturalWidth,crop[1]*art.naturalHeight,w,h,0,0,w,h);
 const pixels=c.getImageData(0,0,w,h),original=new Uint8ClampedArray(pixels.data);if(name!=='material')cutoutPixels92(pixels.data,w,h,atlas===8);
 // The arch has an enclosed opening: its navy backdrop must also be transparent.
 if(name==='arch')for(let y=Math.floor(h*.32);y<h*.92;y++)for(let x=Math.floor(w*.24);x<w*.75;x++){const k=(y*w+x)*4,p=pixels.data;if(p[k]<22&&p[k+1]<95&&p[k+2]<155&&p[k+2]>p[k+1]*1.2)p[k+3]=0;}
 // Keep the shaded interior of rounded rocks; it is painted blue, like the matte.
 if(name==='stone'||name==='shellRock')for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(((x/w-.50)/.40)**2+((y/h-.51)/.42)**2<1){const k=(y*w+x)*4;pixels.data.set(original.subarray(k,k+4),k);}
 // Isolate the main painted object; stray slivers from adjacent atlas cells disappear.
 if(!['bubbles','tube','tubeUp','material'].includes(name)){
 const seen=new Uint8Array(w*h),groups=[];let largest=0;
 for(let i=0;i<w*h;i++){if(seen[i]||pixels.data[i*4+3]<32)continue;const group=[i];seen[i]=1;for(let j=0;j<group.length;j++){const k=group[j],x=k%w;for(const next of [x?k-1:-1,x<w-1?k+1:-1,k>=w?k-w:-1,k<w*(h-1)?k+w:-1])if(next>=0&&!seen[next]&&pixels.data[next*4+3]>=32){seen[next]=1;group.push(next);}}groups.push(group);largest=Math.max(largest,group.length);}
 for(const group of groups)if(group.length<largest)for(const i of group)pixels.data[i*4+3]=0;
 }
 c.putImageData(pixels,0,0);
 let left=w,top=h,right=-1,bottom=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pixels.data[(y*w+x)*4+3]>12){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 if(right<left)return null;const surface=new OffscreenCanvas(right-left+1,bottom-top+1);surface.getContext('2d').drawImage(raw,left,top,surface.width,surface.height,0,0,surface.width,surface.height);LEVEL92_SPRITES.set(name,surface);return surface;
}
function piece92(name,x,bottom,w,h,flip=false,t=0,sway=false){if(x+w<-50||x>vw+50)return false;const art=sprite92(name);if(!art)return false;
 const scale=Math.min(w/art.width,h/art.height),dw=art.width*scale,dh=art.height*scale;ctx.save();ctx.translate(x+w/2,bottom);if(flip)ctx.scale(-1,1);if(sway&&!reducedMotion)ctx.transform(1,0,Math.sin(t*.65+x*.001)*.009,1,0,0);ctx.drawImage(art,-dw/2,-dh,dw,dh);ctx.restore();return true;
}
function biome92(x){if(x<4060)return 0;return 1+Math.max(0,HIGHLAND_ROUTE_ZONES.findIndex(z=>x>=z.start&&x<z.end));}
function scenery92(t){const tick=reducedMotion?0:t;ctx.save();ctx.beginPath();ctx.rect(0,waterSurface()+12,vw,H-waterSurface());ctx.clip();
 // Each route has its own material palette; the central swim lane stays clear.
 const step=1050,first=Math.max(0,Math.floor(camera/step)-1),last=Math.ceil((camera+vw)/step)+1;
 for(let cell=first;cell<=last;cell++){
  const wx=cell*step+290;if(wx>W-150)continue;const x=wx-camera,zone=biome92(wx),names=[['sandSmall','shellRock'],['fan','shellRock'],['tubeUp','fan'],['column','ruinShelf'],['sand','tubeUp'],['sandShelf','statue']][Math.min(5,zone)];
  const name=names[cell%2],tall=name==='column'||name==='statue',w=tall?145:250,h=tall?235:150;piece92(name,x-w/2,H+8,w,h,cell%2===1,tick,true);
 }
 const landmarks=[['sand',470,360,165],['bubbles',2190,190,255],['fan',5080,330,200],['tube',6890,280,150],['arch',highlandRouteX(9900),390,320],['column',highlandRouteX(10780),150,275],['sandShelf',highlandRouteX(12600),380,160],['arch',HIGHLAND_BOSS_X+200,430,335]];
 for(const [name,wx,w,h]of landmarks)piece92(name,wx-camera-w/2,H+15,w,h,false,tick,['fan','bubbles'].includes(name));
 // Warm crystals stay on the seabed margin, away from navigable water and hazards.
 for(let wx=5500;wx<W-300;wx+=3300)piece92('crystal',wx-camera-75,H+55,150,125,false,tick);
 // Tiny ornamental fish belong to the distant world, never the enemy roster.
 for(const wx of [6200,highlandRouteX(11200),highlandRouteX(13200)]){const dx=reducedMotion?0:Math.sin(tick*.35+wx)*45;piece92('fish',wx-camera+dx,waterSurface()+260,52,28,true,tick);}
 ctx.restore();
}
function barrier92(o,x,t,index){if(o.worldSky86||o.tutorialSky||o.y<waterSurface()-45)return false;const art=sprite92(o.y===280?'ledge':index%3===0?'shellRock':'stone');if(!art)return false;
 ctx.save();ctx.beginPath();ctx.roundRect(x,o.y,o.w,o.h,Math.min(18,o.w*.15,o.h*.15));ctx.clip();
 // Fill collision faces with painted stone, then blend the atlas silhouette on top.
 const material=sprite92('material');if(material)ctx.drawImage(material,x,o.y,o.w,o.h);
 ctx.drawImage(art,x,o.y,o.w,o.h);
 ctx.strokeStyle='#c4e7c252';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+3,o.y+2);ctx.lineTo(x+o.w-3,o.y+2);ctx.stroke();ctx.restore();return true;
}
function drawCurrent92(w,x,y,t){if(!level192())return false;const art=sprite92('eddy');if(!art)return false;ctx.save();ctx.translate(x,y);if(!reducedMotion)ctx.rotate(Math.sin(t*.5+w.at)*.08);ctx.drawImage(art,-135,-70,270,140);
 // Direction matches the existing current force; artwork has no gameplay side effects.
 ctx.strokeStyle='#eafff6';ctx.lineWidth=3;ctx.beginPath();const dir=w.dir;ctx.moveTo(-dir*45,0);ctx.lineTo(dir*45,0);ctx.lineTo(dir*28,-10);ctx.moveTo(dir*45,0);ctx.lineTo(dir*28,10);ctx.stroke();ctx.restore();return true;
}
function installLevel92(){if(installLevel92.installed)return;installLevel92.installed=true;
 const baseScenery=drawWorldScenery75;drawWorldScenery75=function(t){if(level192())scenery92(t);else baseScenery(t);};
 const baseBarrier=drawBarrier;drawBarrier=function(o,x,t,index){if(level192()&&barrier92(o,x,t,index))return;baseBarrier(o,x,t,index);};
 const baseEdge=drawSeabedEdge90;drawSeabedEdge90=function(t){if(!level192()){baseEdge(t);return;}ctx.save();ctx.beginPath();ctx.rect(0,H-44,vw,44);ctx.clip();const start=Math.floor(camera/720);for(let i=start;i<start+Math.ceil(vw/720)+2;i++)piece92(i%2?'sandSmall':'shellRock',i*720-camera,H+35,190,110,i%2===1,t);ctx.restore();};
 const baseWalls=drawWaterfallWalls87;drawWaterfallWalls87=function(f){baseWalls(f);if(!level192())return;const half=waterfallHalf87(),left=vw/2-half,right=vw/2+half;ctx.save();ctx.beginPath();ctx.rect(0,0,left,H);ctx.rect(right,0,vw-right,H);ctx.clip();const offset=(f.depth*.72)%290;for(let i=-1;i<5;i++){const y=i*290-offset;piece92(i%2?'fan':'stone',left-160,y+240,175,240,false,f.time);piece92(i%2?'stone':'fan',right-15,y+240,175,240,true,f.time);}ctx.restore();};
 const baseEnv=envDraw;envDraw=function(tile,x,y,w,h,t=0,animated=false){if(level192()&&highland?.fall&&tile===0&&piece92('stone',x,y+h,w,h,false,t))return true;return baseEnv(tile,x,y,w,h,t,animated);};
 // Prewarm a few sprites when idle; the cache is bounded by the fixed crop catalogue.
 if(typeof requestIdleCallback==='function')requestIdleCallback(()=>{for(const name of ['stone','ledge','sand','fan'])sprite92(name);});
}
