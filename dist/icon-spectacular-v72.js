'use strict';
/* Mermaid Adventure 7.2 — world icon/model upgrade.
   Loaded after game.js so it can upgrade established renderers without altering gameplay. */
globalThis.V72_VISUALS={version:'7.2.0',quality:'premium-icons'};

function v72Spark(x,y,r=12,alpha=.9,turn=0){
  ctx.save();ctx.translate(x,y);ctx.rotate(turn);ctx.globalAlpha=alpha;
  const g=ctx.createLinearGradient(-r,-r,r,r);g.addColorStop(0,'#fff9d8');g.addColorStop(.45,'#d7ffff');g.addColorStop(1,'#efb8ff');
  ctx.fillStyle=g;ctx.shadowColor='#c9ffff';ctx.shadowBlur=r*.6;ctx.beginPath();
  for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.25:r;const px=Math.cos(a)*rr,py=Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}
  ctx.closePath();ctx.fill();ctx.restore();
}
function v72PearlMaterial(r){
  const g=ctx.createRadialGradient(-r*.32,-r*.36,1,0,0,r);
  g.addColorStop(0,'#ffffff');g.addColorStop(.12,'#fffaf0');g.addColorStop(.3,'#f1dfff');
  g.addColorStop(.56,'#afefff');g.addColorStop(.79,'#aaa0ef');g.addColorStop(1,'#6573bd');return g;
}
function v72GlassRing(r,color='#a8fbff'){
  ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.globalAlpha=.72;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
}
if(typeof drawPearlTreasure==='function')drawPearlTreasure=function(t,phase){
  const pulse=reducedMotion?0:(Math.sin(t*2.7+phase)+1)/2;ctx.save();
  ctx.shadowColor='#86efff';ctx.shadowBlur=18+pulse*8;ctx.fillStyle=v72PearlMaterial(25);ctx.strokeStyle='#fffff1';ctx.lineWidth=2.2;
  ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
  ctx.globalAlpha=.78;ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(-7,-8,7,4.4,-.55,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=.38;ctx.strokeStyle='#ffc9ef';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(2,2,16,.25,2.2);ctx.stroke();ctx.globalAlpha=1;
  v72GlassRing(28+pulse*2,'#b8ffff');if(!reducedMotion&&pulse>.68)v72Spark(22,-20,6,pulse,(t+phase)*.4);
  ctx.restore();
};
if(typeof drawStarCoinTreasure==='function')drawStarCoinTreasure=function(t,phase){
  const pulse=reducedMotion?0:(Math.sin(t*3+phase)+1)/2;ctx.save();ctx.rotate(reducedMotion?0:Math.sin(t*1.15+phase)*.08);
  ctx.shadowColor='#ffd766';ctx.shadowBlur=16+pulse*7;
  const rim=ctx.createRadialGradient(-7,-8,3,0,0,28);rim.addColorStop(0,'#fffbd0');rim.addColorStop(.24,'#ffe685');rim.addColorStop(.62,'#f5ad31');rim.addColorStop(1,'#a75a18');
  ctx.fillStyle=rim;ctx.strokeStyle='#fff2ac';ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(0,0,23,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
  ctx.fillStyle='#80431a';ctx.globalAlpha=.28;ctx.beginPath();ctx.arc(0,0,17,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  const sg=ctx.createLinearGradient(-12,-12,12,12);sg.addColorStop(0,'#fffbe0');sg.addColorStop(.5,'#ffe873');sg.addColorStop(1,'#f7a92b');ctx.fillStyle=sg;
  ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?7:14;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();
  ctx.strokeStyle='#fff7b6';ctx.lineWidth=1;ctx.stroke();v72GlassRing(29+pulse*1.5,'#ffe9a0');if(!reducedMotion&&pulse>.7)v72Spark(23,-19,5,pulse,t*.3);ctx.restore();
};
if(typeof drawGemTreasure==='function')drawGemTreasure=function(kind,t,phase){
  const palette=kind==='ruby'?['#fff0f8','#ff68bd','#b81674']:kind==='amethyst'?['#f7ecff','#bb77ff','#5b2ac4']:['#e5ffff','#55eaff','#177bc8'];
  const pulse=reducedMotion?0:(Math.sin(t*2.8+phase)+1)/2;ctx.save();ctx.rotate(reducedMotion?0:Math.sin(t*1.1+phase)*.07);
  ctx.shadowColor=palette[1];ctx.shadowBlur=15+pulse*7;const g=ctx.createLinearGradient(-22,-25,24,25);g.addColorStop(0,palette[0]);g.addColorStop(.35,palette[1]);g.addColorStop(1,palette[2]);ctx.fillStyle=g;ctx.strokeStyle='#efffff';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(21,-9);ctx.lineTo(15,17);ctx.lineTo(0,27);ctx.lineTo(-18,15);ctx.lineTo(-22,-8);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;
  ctx.globalAlpha=.55;ctx.strokeStyle='#ffffff';ctx.lineWidth=1;for(const [a,b,c,d] of [[0,-25,0,27],[-22,-8,21,-9],[-22,-8,0,5],[21,-9,0,5],[0,5,-18,15],[0,5,15,17]]){ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke();}
  ctx.globalAlpha=.9;ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-12,-10);ctx.lineTo(-3,-18);ctx.lineTo(-5,-5);ctx.closePath();ctx.fill();ctx.globalAlpha=1;if(!reducedMotion&&pulse>.72)v72Spark(18,-22,5,pulse,t*.35);ctx.restore();
};
if(typeof drawTreasureChest62==='function')drawTreasureChest62=function(t,phase){
  const pulse=reducedMotion?0:(Math.sin(t*2.6+phase)+1)/2;ctx.save();ctx.shadowColor='#ffc95e';ctx.shadowBlur=17+pulse*7;
  let g=ctx.createLinearGradient(-31,0,31,30);g.addColorStop(0,'#6e351f');g.addColorStop(.3,'#b5652d');g.addColorStop(.65,'#8a4425');g.addColorStop(1,'#54271d');ctx.fillStyle=g;ctx.strokeStyle='#ffe08a';ctx.lineWidth=2.5;ctx.beginPath();ctx.roundRect(-32,-7,64,35,6);ctx.fill();ctx.stroke();
  g=ctx.createLinearGradient(-30,-32,30,-5);g.addColorStop(0,'#8b4725');g.addColorStop(.45,'#df963a');g.addColorStop(1,'#71351f');ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(-32,-31,64,26,[15,15,4,4]);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
  ctx.fillStyle='#f4bd4e';ctx.fillRect(-5,-16,10,43);ctx.fillStyle='#fff1a0';ctx.beginPath();ctx.roundRect(-7,-5,14,13,4);ctx.fill();ctx.fillStyle='#8b531d';ctx.beginPath();ctx.arc(0,1,2.6,0,Math.PI*2);ctx.fill();
  const gems=[[-20,-23,'#6cf2ff'],[-8,-27,'#ff79c7'],[7,-27,'#b990ff'],[20,-21,'#83f5c9']];for(const [x,y,c] of gems){ctx.fillStyle=c;ctx.strokeStyle='#efffff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y-5);ctx.lineTo(x+5,y);ctx.lineTo(x,y+6);ctx.lineTo(x-5,y);ctx.closePath();ctx.fill();ctx.stroke();}
  if(!reducedMotion&&pulse>.62){v72Spark(27,-28,6,pulse,t*.4);v72Spark(-28,-11,4,pulse*.7,-t*.3);}ctx.restore();
};
if(typeof drawGlossyHeart==='function')drawGlossyHeart=function(x,y,size,t){
  ctx.save();ctx.translate(x,y);ctx.scale(size/48,size/48);ctx.shadowColor='#ff71bd';ctx.shadowBlur=20;
  const g=ctx.createLinearGradient(-25,-27,24,30);g.addColorStop(0,'#fff4fb');g.addColorStop(.18,'#ffc8e5');g.addColorStop(.5,'#ff76bd');g.addColorStop(.78,'#ef3a9a');g.addColorStop(1,'#9b195e');ctx.fillStyle=g;ctx.strokeStyle='#fff4fb';ctx.lineWidth=2.6;
  ctx.beginPath();ctx.moveTo(0,29);ctx.bezierCurveTo(-7,20,-33,5,-33,-11);ctx.bezierCurveTo(-33,-29,-10,-32,0,-16);ctx.bezierCurveTo(10,-32,33,-29,33,-11);ctx.bezierCurveTo(33,5,7,20,0,29);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;
  ctx.globalAlpha=.5;ctx.strokeStyle='#ffc4e7';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,39,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.9;ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(-13,-14,8,4.5,-.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;if(!reducedMotion)v72Spark(22,-21,5,.75,t*.5);ctx.restore();
};
if(typeof drawBoostCrystal==='function')drawBoostCrystal=function(x,y,size,t){
  ctx.save();ctx.translate(x,y);ctx.rotate(reducedMotion?0:Math.sin(t*1.3)*.06);const r=size*.54;ctx.shadowColor='#56efff';ctx.shadowBlur=21;
  const g=ctx.createLinearGradient(-r,-r,r,r);g.addColorStop(0,'#f0ffff');g.addColorStop(.2,'#91fbff');g.addColorStop(.55,'#28d8ef');g.addColorStop(.78,'#4b8ce8');g.addColorStop(1,'#6656bf');ctx.fillStyle=g;ctx.strokeStyle='#eaffff';ctx.lineWidth=2.4;
  ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*.78,-r*.27);ctx.lineTo(r*.6,r*.56);ctx.lineTo(0,r);ctx.lineTo(-r*.66,r*.54);ctx.lineTo(-r*.8,-r*.28);ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;
  ctx.strokeStyle='#ffffff91';ctx.lineWidth=1.2;for(const q of [[0,-r,0,r],[0,-r,r*.6,r*.56],[0,-r,-r*.66,r*.54],[-r*.8,-r*.28,r*.78,-r*.27]]){ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(q[2],q[3]);ctx.stroke();}
  ctx.globalAlpha=.85;ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-r*.4,-r*.5);ctx.lineTo(-r*.07,-r*.7);ctx.lineTo(-r*.17,-r*.24);ctx.closePath();ctx.fill();ctx.globalAlpha=1;v72GlassRing(r+9,'#aefcff');if(!reducedMotion)v72Spark(r*.72,-r*.68,5,.7,t*.45);ctx.restore();
};
if(typeof drawBubbleRushPowerup==='function')drawBubbleRushPowerup=function(p,t){
  const x=p.x-camera;if(p.taken||x<-90||x>vw+90)return true;const y=p.y+(reducedMotion?0:Math.sin(t*2.5+p.phase)*8),pulse=reducedMotion?0:(Math.sin(t*4.5+p.phase)+1)/2;
  ctx.save();ctx.translate(x,y);ctx.shadowColor='#9afcff';ctx.shadowBlur=22+pulse*7;const aura=ctx.createRadialGradient(0,0,4,0,0,55);aura.addColorStop(0,'#ffffffc9');aura.addColorStop(.25,'#a7ffff70');aura.addColorStop(.55,'#a69cff55');aura.addColorStop(.8,'#f3b1ff3c');aura.addColorStop(1,'#7a58cb00');ctx.fillStyle=aura;ctx.beginPath();ctx.arc(0,0,48,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  for(let i=0;i<3;i++){const a=(reducedMotion?i*2.09:t*1.55+i*2.09),rr=20,br=[13,11,9][i];ctx.save();ctx.translate(Math.cos(a)*rr,Math.sin(a)*rr);ctx.fillStyle=v72PearlMaterial(br);ctx.strokeStyle='#f3ffff';ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(0,0,br,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.globalAlpha=.8;ctx.beginPath();ctx.ellipse(-br*.35,-br*.4,br*.27,br*.16,-.5,0,Math.PI*2);ctx.fill();ctx.restore();}
  ctx.fillStyle='#fff6d1';ctx.strokeStyle='#49347e';ctx.lineWidth=3;ctx.font='1000 15px Nunito,sans-serif';ctx.textAlign='center';ctx.strokeText('×3',0,5);ctx.fillText('×3',0,5);if(!reducedMotion)v72Spark(34,-31,6,.72+pulse*.2,t*.35);ctx.restore();return true;
};
if(typeof drawScorePopup==='function')drawScorePopup=function(p,t){
  const x=p.x-camera,y=p.y,kind=p.kind||'plain',max=p.maxLife||1.1,progress=clamp(1-p.life/max,0,1),alpha=Math.min(1,p.life*2);ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);
  const scale=reducedMotion?1:.9+Math.sin(Math.min(1,progress*1.6)*Math.PI)*.13;ctx.scale(scale,scale);
  if(kind!=='plain'){const colors=kind==='heart'?['#ffabd6','#a62570']:kind==='treasure'?['#ffe17b','#9f5d1d']:kind==='perfect'?['#f8b1ff','#7142c7']:kind==='combo'?['#8df8ff','#435cc3']:kind==='pearl'?['#a6fff4','#2878b4']:['#b8ffff','#356ba8'];ctx.shadowColor=colors[0];ctx.shadowBlur=12;ctx.fillStyle=colors[1]+'e8';ctx.strokeStyle='#ffffffdf';ctx.lineWidth=1.8;ctx.font='1000 22px Nunito,sans-serif';const w=Math.max(82,ctx.measureText(p.text).width+42);ctx.beginPath();ctx.roundRect(-w/2,-25,w,44,22);ctx.fill();ctx.stroke();ctx.shadowBlur=0;v72Spark(-w/2+12,-18,4,.75,t*.4);ctx.fillStyle=kind==='treasure'||kind==='perfect'?'#fff4b3':'#efffff';ctx.strokeStyle='#17355d';ctx.lineWidth=3;ctx.textAlign='center';ctx.strokeText(p.text,0,4);ctx.fillText(p.text,0,4);}
  else{ctx.font='1000 26px Nunito,sans-serif';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#093f59';ctx.strokeText(p.text,0,0);ctx.fillStyle=p.color;ctx.fillText(p.text,0,0);}ctx.restore();
};
/* Preserve the painted starfish model, but give star projectiles a premium readable halo. */
if(typeof drawBossProjectileV4==='function'){
  const v72BaseBossProjectile=drawBossProjectileV4;
  drawBossProjectileV4=function(p,t){
    if(p?.type==='star'){const x=p.x-camera,y=p.y;ctx.save();ctx.globalCompositeOperation='screen';ctx.strokeStyle='#ffe8a888';ctx.lineWidth=2;ctx.shadowColor='#ffd77e';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(x,y,27+(reducedMotion?0:Math.sin(t*5+p.x)*2),0,Math.PI*2);ctx.stroke();ctx.restore();}
    return v72BaseBossProjectile(p,t);
  };
}
