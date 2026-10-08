'use strict';
// 8.6: opaque material faces, bounded texture cache, optional themed sky routes.
const SKY86_ART=new Image();SKY86_ART.src='assets/sky-reefs-v86.webp';
const SKY86_CROPS=[[12, 176, 494, 308], [532, 171, 467, 313], [1028, 172, 494, 312], [13, 591, 490, 322], [531, 587, 471, 329], [1027, 599, 496, 318]]; // Filled with the alpha-trimmed bounds of the six atlas cells.
const WORLD86_REEF_CROPS=[[25, 129, 337, 222], [480, 38, 194, 319], [795, 134, 327, 225], [1208, 68, 270, 291], [21, 469, 313, 260], [405, 445, 310, 284], [809, 423, 284, 323], [1170, 499, 349, 242], [22, 848, 341, 260], [401, 859, 340, 241], [807, 860, 308, 239], [1174, 868, 340, 246]];
const WORLD86_PEARL_CROPS=[[111, 27, 195, 342], [407, 59, 344, 308], [851, 28, 222, 346], [1208, 121, 262, 250], [30, 427, 320, 322], [418, 402, 315, 358], [816, 408, 288, 352], [1183, 412, 310, 339], [27, 970, 344, 163], [413, 942, 343, 193], [835, 908, 232, 222], [1167, 924, 338, 205]];
const WORLD86_MATERIALS={
 highland:['#b4e3b6','#568b82','#164153',0],jungle:['#b1dca3','#437f74','#153e50',1],
 palace:['#fff0ce','#b0a3cf','#4c527e',2],rana:['#ffe5b0','#9d78b8','#3d3c70',5],
 shadow:['#c0ace5','#645e89','#242c4a',3],tunnel:['#89c4d5','#3a6478','#112a40',4]
};
let world86Cache=new Map(),world86Bytes=0;
const WORLD86_CACHE_LIMIT=8*1024*1024;
function clearWorld86Cache(){world86Cache.clear();world86Bytes=0;}
// All visible stone lies inside its collider. Tiny bevels soften otherwise exact edges.
function world86Contour(c,w,h,i){const r=Math.min(24,w*.12,h*.12),n=Math.sin(i*2.3)*r*.18;c.beginPath();c.moveTo(r,1);c.lineTo(w*.36,2+n);c.lineTo(w-r,1);c.quadraticCurveTo(w,1,w,r);c.lineTo(w-1,h-r);c.quadraticCurveTo(w,h,w-r,h);c.lineTo(w*.53,h-2);c.lineTo(r,h);c.quadraticCurveTo(0,h,0,h-r);c.lineTo(1,r);c.quadraticCurveTo(0,0,r,1);c.closePath();}
function world86Face86(o,theme,index){const royal=WORLD75_THEMES[theme].royal,vertical=o.h>o.w*1.12,face=royal?(vertical?0:theme==='palace'?8:9):(vertical?1:index%3===2?2:0);return {royal,vertical,face};}
function paintWorld86(c,o,theme,index){const [light,mid,dark,tile]=WORLD86_MATERIALS[theme],w=o.w,h=o.h,sky=!!o.worldSky86,{royal,face}=world86Face86(o,theme,index),art=sky?SKY86_ART:royal?pearlGarden75:reefGarden75;
 c.save();if(art.complete&&art.naturalWidth){const crop=sky?SKY86_CROPS[tile]:(royal?WORLD86_PEARL_CROPS:WORLD86_REEF_CROPS)[face];c.drawImage(art,...crop,0,0,w,h);
 // Shade ONLY the existing painted silhouette, never the transparent surrounding cell.
 c.globalCompositeOperation='source-atop';const shade=c.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#ffffff00');shade.addColorStop(.6,'#10283a00');shade.addColorStop(1,dark+'40');c.fillStyle=shade;c.fillRect(0,0,w,h);c.globalCompositeOperation='source-over';
 }else{world86Contour(c,w,h,index);const stone=c.createLinearGradient(0,0,w,h);stone.addColorStop(0,light);stone.addColorStop(.3,mid);stone.addColorStop(1,dark);c.fillStyle=stone;c.fill();}c.restore();
}
const WORLD86_COLLISION_CACHE=new WeakMap(),WORLD86_COLLISION_LISTS=new WeakMap();
function world86CollisionRects(o){if(isTraining())return [o];let hit=WORLD86_COLLISION_CACHE.get(o);if(hit)return hit;const sky=!!o.worldSky86,vertical=o.h>o.w*1.12,royal=WORLD75_THEMES[worldTheme75()].royal;
 // Three contiguous bands follow the rock's mass; coral fronds remain decorative.
 const bands=sky?[[.06,.30,.04],[.36,.32,.14],[.68,.25,.27]]:vertical?(royal?[[.04,.18,.32],[.22,.56,.34],[.78,.22,.08]]:[[.04,.18,.22],[.22,.56,.20],[.78,.22,.04]]):royal?[[.20,.25,.025],[.45,.3,.10],[.75,.25,.22]]:[[.30,.25,.07],[.55,.30,.02],[.85,.15,.08]];
 hit=bands.map(([top,height,inset])=>({...o,x:o.x+o.w*inset,y:o.y+o.h*top,w:o.w*(1-inset*2),h:o.h*height}));WORLD86_COLLISION_CACHE.set(o,hit);return hit;
}
function worldCollisionObstacles86(){if(isTraining())return obstacles;const theme=worldTheme75(),old=WORLD86_COLLISION_LISTS.get(obstacles);if(old&&old.length===obstacles.length&&old.theme===theme)return old.list;const list=obstacles.flatMap(world86CollisionRects);WORLD86_COLLISION_LISTS.set(obstacles,{length:obstacles.length,theme,list});return list;}
function world86Texture(o,theme,index){if(typeof OffscreenCanvas==='undefined')return null;const key=[theme,o.w,o.h,index%3,!!o.worldSky86].join(':'),old=world86Cache.get(key);if(old)return old.surface;
 const scale=Math.min(2,640/Math.max(o.w,o.h)),w=Math.ceil(o.w*scale),h=Math.ceil(o.h*scale),bytes=w*h*4;if(bytes>WORLD86_CACHE_LIMIT)return null;
 while(world86Bytes+bytes>WORLD86_CACHE_LIMIT&&world86Cache.size){const k=world86Cache.keys().next().value;world86Bytes-=world86Cache.get(k).bytes;world86Cache.delete(k);}
 const surface=new OffscreenCanvas(w,h),c=surface.getContext('2d');c.scale(scale,scale);paintWorld86(c,o,theme,index);world86Cache.set(key,{surface,bytes});world86Bytes+=bytes;return surface;
}
function drawWorldSolid86(o,x,t,index=0){if(isTraining()||x+o.w<-24||x>vw+24)return false;const theme=worldTheme75();if(!WORLD86_MATERIALS[theme])return false;ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 // A narrow contact shadow stays behind the object and out of the navigable passage.
 ctx.fillStyle='#061e3930';ctx.beginPath();ctx.ellipse(x+o.w*.52,o.y+o.h-2,o.w*.45,Math.min(9,o.h*.06),0,0,Math.PI*2);ctx.fill();
 const cached=world86Texture(o,theme,index);if(cached)ctx.drawImage(cached,x,o.y,o.w,o.h);else{ctx.translate(x,o.y);paintWorld86(ctx,o,theme,index);}ctx.restore();return true;
}
// Early, middle and later clusters have deliberately different rhythms; arenas/portals stay clear.
const SKY86_ROUTES={highland:[.07,.22,.69],jungle:[.1,.34,.7],palace:[.06,.32,.64],rana:[.07,.24,.74],shadow:[.09,.32,.58],tunnel:[.08,.31,.53]};
function setupWorldSky86(){if(isTraining())return;const theme=worldTheme75();if(!SKY86_ROUTES[theme])return;obstacles=obstacles.filter(o=>!o.worldSky86);powerups=powerups.filter(p=>!p.worldSky86);
 const line=waterSurface(),count=mode==='trial'?1:3,reach=mode==='trial'?W:W*.9;
 for(let cluster=0;cluster<count;cluster++){const anchor=Math.round(reach*SKY86_ROUTES[theme][cluster]);for(let j=0;j<2;j++){const w=160+(cluster+j)%3*20,x=anchor+j*(410+cluster*70),h=62+(cluster+j)%2*8,y=line-(cluster%2?102:112);if(x<400||x+w>W-850||boss&&Math.abs(x-boss.x)<850)continue;
  obstacles.push({x,y,w,h,worldSky86:true,worldTile86:WORLD86_MATERIALS[theme][3]});
  if(mode!=='trial'&&j===0){const px=x+w+130,py=line-100;powerups.push({x:px,y:py,type:cluster%2?'boost':'heart',phase:cluster*1.8,sky:true,taken:false,worldSky86:true});}
 }}
 // Existing airborne gifts must never be hidden inside a new solid reef.
 for(const p of powerups){if(!p.sky)continue;for(const o of obstacles)if(o.worldSky86&&p.x>o.x-65&&p.x<o.x+o.w+65&&p.y>o.y-65&&p.y<o.y+o.h+65){p.x=o.x+o.w+100;p.y=line-100;}}
}
function resolveWorldSky86(px,py){if(!leap.breached)return;const rx=58,ry=39;for(const original of obstacles){if(!original.worldSky86)continue;for(const o of world86CollisionRects(original)){if(!o.worldSky86||nessie.x+rx<=o.x||nessie.x-rx>=o.x+o.w||nessie.y+ry<=o.y||nessie.y-ry>=o.y+o.h)continue;
 if(px+rx<=o.x){nessie.x=o.x-rx;nessie.vx=Math.min(0,nessie.vx);}else if(px-rx>=o.x+o.w){nessie.x=o.x+o.w+rx;nessie.vx=Math.max(0,nessie.vx);}else if(py-ry>=o.y+o.h){nessie.y=o.y+o.h+ry;nessie.vy=Math.max(40,nessie.vy);}else if(py+ry<=o.y){nessie.y=o.y-ry;nessie.vy=Math.min(0,nessie.vy);leap.skimming=true;}else{const e=[{d:Math.abs(nessie.x-(o.x-rx)),x:o.x-rx,y:nessie.y},{d:Math.abs(nessie.x-(o.x+o.w+rx)),x:o.x+o.w+rx,y:nessie.y},{d:Math.abs(nessie.y-(o.y+o.h+ry)),x:nessie.x,y:o.y+o.h+ry}].sort((a,b)=>a.d-b.d);nessie.x=e[0].x;nessie.y=e[0].y;nessie.vx=0;if(e[0].y!==py)nessie.vy=Math.max(40,nessie.vy);}
 }}}
function palaceCameoPose86(p){const age=4-p.life,enter=smoothUnit(clamp(age/1.1,0,1)),exit=smoothUnit(clamp((age-3)/1,0,1));return {x:(p.x-camera)+(vw+220-(p.x-camera))*((1-enter)+exit),y:p.y+90*(1-enter)-65*exit,angle:reducedMotion?0:(1-enter)*-.12+exit*.1};}
function drawPalaceCameo86(t){const p=palace?.projection;if(!p||p.life<=0)return;const pose=palaceCameoPose86(p);ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.translate(pose.x,pose.y);ctx.rotate(pose.angle);drawRoyalCharacter('queen',0,0,170,t,'idle','amused');ctx.restore();}
function installWorld86(){const load=loadStage,swim=updateSwimmer,retry=retryStory,shadow=setupShadowCrabKingdom,tunnel=setupDarkTunnelChapter,resolve=resolvePlatforms;
 resolvePlatforms=function(px,py){if(isTraining())return resolve(px,py);const original=obstacles;obstacles=worldCollisionObstacles86();try{return resolve(px,py);}finally{obstacles=original;}};
 loadStage=function(){const r=load();clearWorld86Cache();setupWorldSky86();return r;};
 setupShadowCrabKingdom=function(){const r=shadow();clearWorld86Cache();setupWorldSky86();return r;};
 setupDarkTunnelChapter=function(){const r=tunnel();clearWorld86Cache();setupWorldSky86();return r;};
 retryStory=function(){const r=retry();clearWorld86Cache();setupWorldSky86();return r;};
 updateSwimmer=function(dt,dx,dy){const px=nessie.x,py=nessie.y;swim(dt,dx,dy);resolveWorldSky86(px,py);};
 SKY86_ART.addEventListener('load',clearWorld86Cache);reefGarden75.addEventListener('load',clearWorld86Cache);pearlGarden75.addEventListener('load',clearWorld86Cache);
}
