'use strict';
// Tutorial 2.0: an open relic garden, lesson trail, royal arena and farewell portal.
function tutorialQueenX(){return training?.queenX||5720;}
function updateTutorialExploration(dt){training.queenX+=((training.victoryReady?7180:5720)-training.queenX)*(1-Math.exp(-dt*1.5));for(const r of training.relics){if(!r.taken&&Math.hypot(nessie.x-r.x,nessie.y-r.y)<95){r.taken=true;score+=100;popups.push({x:r.x,y:r.y-85,text:'+100 · A lagoon relic!',life:2,color:'#ffe9ac'});tone(920,.15);tutorialSay(['A golden shell! I wonder who left this here.','Treasure hunting definitely counts as homework.','Three relics! Mum will want these on the mantelpiece.'][training.relics.filter(q=>q.taken).length-1],'sarah',4);}}
 if(training.step===5){training.queenSeen=true;training.queenReact=Math.max(training.queenReact||0,.6);}if(training.victoryReady&&!training.sendoff&&nessie.x>7100&&!leap.active){training.sendoff=true;if(mode==='sarah')openDialogue('antonella-sendoff');else tutorialSay('You’re ready. Your adventure is through the portal!','queen',4);}}
function drawTutorialGardens(t){const tick=reducedMotion?0:t;
 // Deliberate reef vistas rather than an endless row of repeated columns.
 drawTutorialReefVistas(tick);
 // Friendly life and magic displays make the lagoon feel inhabited without becoming hazards.
 const shoals=[
  {x:980,y:470,k:'seahorse',n:3},{x:1850,y:700,k:'jelly',n:4},{x:3380,y:430,k:'puffer',n:3},
  {x:4300,y:735,k:'eel',n:3},{x:5200,y:500,k:'seahorse',n:4},{x:6120,y:690,k:'swordfish',n:3}
 ];
 for(const [si,shoal] of shoals.entries()){for(let j=0;j<shoal.n;j++){const wx=shoal.x+j*55+Math.sin(tick*.65+j+si)*24,wy=shoal.y+Math.sin(tick*(1.05+si*.07)+j*1.3)*30,x=wx-camera;if(x<-120||x>vw+120)continue;ctx.save();ctx.globalAlpha=.58;releaseCreature({kind:shoal.k,x:wx,y:wy,size:12+(j%2)*3,dir:(si+j)%2?1:-1,clock:tick+j+si},tick,true);ctx.restore();}}
 const gardens=[
  {x:1180,y:740,portal:false},{x:2280,y:470,portal:true},{x:4020,y:760,portal:false},{x:5050,y:500,portal:true},{x:6260,y:760,portal:false}
 ];
 for(const [gi,g] of gardens.entries()){const x=g.x-camera;if(x<-330||x>vw+330)continue;ctx.save();ctx.globalAlpha=.45;envDraw(4,x-150,g.y+55,300,115,tick+gi,true);ctx.globalAlpha=.7;for(let j=0;j<7;j++){const a=j/7*Math.PI*2+tick*.28,r=45+(j%2)*18;tutorialPearl(x+Math.cos(a)*r,g.y+Math.sin(a)*r*.45,4+j%3,tick,.45);}ctx.restore();}


 for(const r of training.relics){const x=r.x-camera;if(x<-160||x>vw+160)continue;ctx.save();const glow=ctx.createRadialGradient(x,r.y,5,x,r.y,105);glow.addColorStop(0,r.taken?'#a8ffdd17':'#ffe69b35');glow.addColorStop(1,'#b9ffe700');ctx.fillStyle=glow;ctx.fillRect(x-105,r.y-105,210,210);envDraw(0,x-85,r.y+28,170,110,tick);if(!r.taken){if(!drawRelicArtwork(x,r.y-18,125,training.relics.indexOf(r)))drawCueBadge(x,r.y-15,'compass',true,tick);for(let j=0;j<4;j++){const a=j*Math.PI/2+tick*.7;paintedBubble(x+Math.cos(a)*55,r.y-18+Math.sin(a)*30,4,.65);}}ctx.restore();}
 // Antonella now reacts, gestures and participates in the lesson rather than floating as static set dressing.
 if(training.queenSeen||training.step>=5){const qx=tutorialQueenX()-camera,qy=470+Math.sin(tick*.8)*8,react=training.queenReact>0,victory=training.victoryReady,gifting=training.step===5,coaching=training.step===6&&!victory,pose=victory?'celebrate':react?'bloom':gifting?'bloomCharge':coaching?'teach':'idle',expression=victory?'proud':react?'amused':gifting?'warm':coaching?'competitive':'warm';ctx.save();ctx.globalAlpha=.72;envDraw(2,qx-130,645,260,215,tick);ctx.restore();drawRoyalCharacter('queen',qx,qy,255+(react?10:0),tick,pose,expression);if(gifting||react||victory){ctx.save();ctx.globalAlpha=react?.9:.55;for(let i=0;i<6;i++){const a=tick*(react?2.3:1.1)+i/6*Math.PI*2,r=react?78:62;tutorialPearl(qx+Math.cos(a)*r,qy-30+Math.sin(a)*r*.38,4+i%2*2,tick,.7);}ctx.restore();}if(coaching&&training.practiceEnemies?.some(e=>e.hp>0)){const next=training.practiceEnemies.find(e=>e.hp>0);if(next&&Math.abs(next.x-camera-qx)<900){ctx.save();ctx.strokeStyle='#ffe6b388';ctx.lineWidth=2;ctx.setLineDash([5,8]);ctx.beginPath();ctx.moveTo(qx,qy-35);ctx.lineTo(next.x-camera,next.y);ctx.stroke();ctx.restore();}}}
 const ax=6900-camera;if(ax>-700&&ax<vw+700){ctx.save();ctx.globalAlpha=.6;for(const side of [-1,1]){tutorialReefPiece(1,ax+side*350-75,630,150,260);}ctx.globalAlpha=1;ctx.strokeStyle='#c5fff13b';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(ax,870,330,40,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<9;i++)paintedBubble(ax-290+i*73,857+Math.sin(i*.7)*12,5,.6);ctx.restore();}
}
function drawRelicArtwork(x,y,size){return atlasDraw(tutorialAtlasArt,[.733,.145,.26,.81],x-size*.43,y-size*.5,size*.86,size);}
function drawOrnatePortal(x,y,height,t,open){if(x+height<0||x-height>vw||y+height<0||y-height>H)return;ctx.save();ctx.translate(x,y);const tick=reducedMotion?0:t,rx=height*.28,ry=height*.43;const glow=ctx.createRadialGradient(0,0,5,0,0,height*.65);glow.addColorStop(0,open?'#b7fff544':'#619cb416');glow.addColorStop(1,'#baaeff00');ctx.fillStyle=glow;ctx.fillRect(-height*.65,-height*.65,height*1.3,height*1.3);ctx.save();ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.clip();const core=ctx.createRadialGradient(-rx*.3,-ry*.3,3,0,0,ry);core.addColorStop(0,open?'#ddfff9':'#7094ad');core.addColorStop(.45,open?'#7ebde6':'#27445e');core.addColorStop(1,open?'#574caa':'#102b45');ctx.fillStyle=core;ctx.fillRect(-rx,-ry,rx*2,ry*2);if(open)for(let i=0;i<5;i++){ctx.strokeStyle=['#fff3cd99','#acffed88','#d2bcff88'][i%3];ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(Math.sin(tick*.4+i)*rx*.2,Math.cos(tick*.6+i)*ry*.12,rx*(.25+i*.17),ry*(.22+i*.18),tick*.18+i,.3,Math.PI*1.85);ctx.stroke();}ctx.restore();ctx.strokeStyle='#e7d5a2';ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(0,0,rx+7,ry+7,0,0,Math.PI*2);ctx.stroke();for(let i=0;i<18;i++){const a=i/18*Math.PI*2;paintedBubble(Math.cos(a)*(rx+7),Math.sin(a)*(ry+7),3.2,.85);}drawPortalArtwork(0,0,height,open);drawCueBadge(0,-height*.58,open?'portal':'shield',open,tick);ctx.restore();}
function drawPortalArtwork(x,y,height,open){ctx.save();ctx.globalAlpha=open?1:.52;const drawn=atlasDraw(tutorialAtlasArt,[0,0,.336,1],x-height*.42,y-height*.5,height*.84,height);ctx.restore();return drawn;}
function drawPaintedBubbleArtwork(x,y,r,alpha){if(!tutorialAtlasArt?.complete||!tutorialAtlasArt.naturalWidth||r<4)return false;ctx.save();ctx.globalAlpha=alpha*.78;atlasDraw(tutorialAtlasArt,[.362,.07,.34,.855],x-r,y-r,r*2,r*2);ctx.restore();return true;}
function installTutorialTwoDialogue(){conversations['antonella-welcome']={speaker:'Queen Antonella',portrait:'queen-warm',line:'There you are, darling! I brought two gifts.\nSarah: Mum! Are you here for mermaid school too?\nQueen Antonella: I’m quality control. Your father submitted a lesson plan titled “THUNDER???”.\nKing Daddy: It had three question marks for emphasis.\nQueen Antonella: And no learning outcomes.\nSarah: The rock had a learning outcome.\nQueen Antonella: The rock had a label.',options:[['What do the gifts do?','The pink heart restores a heart. The gold bubble gives eight seconds of unlimited boost. Collect both, then try a powered jump.'],['Did you hide the relics?','Three little treasures, just for you. They’re optional — curiosity deserves a reward.\nSarah: Best homework ever.'],['Are you watching my big jump?','Every glorious splash. Press J or tap JUMP after collecting both gifts. If the gold runs out, we’ll refill it.']],hint:''};conversations['antonella-sendoff']={speaker:'Queen Antonella',portrait:'queen-proud',line:'Look at you! A proper adventurer.\nKing Daddy: Trained by the Lord of Thunder!\nQueen Antonella: Moderated by the Department of Common Sense.\nSarah: And Professor Puff?\nQueen Antonella: On stress leave.\nKing Daddy: A warrior’s rest.\nSarah: Love you both. Scotland, here I come!',options:[['Through the portal!','Swim into the shining shell gate. Your adventure is waiting.'],['One more family hug?','Always, darling. You can return to this lagoon from Choose a stage whenever you like.']],hint:''};}


// All route solids are hand placed around the existing lesson checkpoints.
// Reef routes alternate overhead and floor obstacles, with open teaching bays.
function buildTutorialReefRoute(){return [
 {x:760,y:785,w:280,h:105,tutorialTile:0},
 {x:1340,y:765,w:180,h:125,tutorialTile:3},
 {x:1160,y:425,w:200,h:170,tutorialTile:1},
 {x:1880,y:waterSurface()+30,w:260,h:190,tutorialTile:2},
 {x:1080,y:125,w:220,h:72,tutorialSky:true,tutorialTile:0},
 {x:5180,y:110,w:230,h:92,tutorialSky:true,tutorialTile:0},
 {x:5530,y:90,w:190,h:88,tutorialSky:true,tutorialTile:0},
 {x:2180,y:795,w:360,h:95,tutorialTile:0},
 {x:3270,y:waterSurface()+24,w:235,h:160,tutorialTile:2},
 {x:3600,y:650,w:220,h:220,trainingRock:true,tutorialTile:1},
 {x:3890,y:778,w:310,h:112,tutorialTile:3},
 {x:4260,y:waterSurface()+30,w:235,h:185,tutorialTile:2},
 {x:4410,y:765,w:210,h:125,tutorialTile:0},
 {x:4800,y:waterSurface()+55,w:95,h:170,trainingJump:true,tutorialTile:1},
 {x:5160,y:795,w:350,h:95,tutorialTile:3},
 {x:5360,y:waterSurface()+20,w:215,h:105,tutorialTile:2}
];}
const TUTORIAL_REEF_CROPS=[[0.005859375, 0.10481770833333333, 0.48828125, 0.2897135416666667], [0.6295572916666666, 0.038411458333333336, 0.24088541666666666, 0.4231770833333333], [0.020182291666666668, 0.5807291666666666, 0.458984375, 0.3385416666666667], [0.5345052083333334, 0.6028645833333334, 0.4309895833333333, 0.2936197916666667]];
const TUTORIAL_FACE_CROPS=[[0.08771929824561403, 0.023923444976076555, 0.40749601275917063, 0.46810207336523124], [0.532695374800638, 0.019936204146730464, 0.41706539074960125, 0.4800637958532695], [0.04704944178628389, 0.5023923444976076, 0.44019138755980863, 0.47368421052631576], [0.5007974481658692, 0.5, 0.47208931419457734, 0.48564593301435405]];
function tutorialReefPiece(tile,x,y,w,h){
 if(!tutorialReefArt?.complete||!tutorialReefArt.naturalWidth||!TUTORIAL_REEF_CROPS[tile])return false;
 return atlasDraw(tutorialReefArt,TUTORIAL_REEF_CROPS[tile],x,y,w,h);
}
function drawTutorialReefBarrier(o,x,t){
 if(!isTraining()||o.tutorialTile===undefined)return false;
 ctx.save();tutorialReefPiece(o.tutorialTile,x-7,o.y-7,o.w+14,o.h+14);ctx.restore();return true;
}
function drawTutorialReefVistas(t){
 // Recessed, desaturated scenery is visually distinct from solid route reefs.
 const vistas=[{x:160,y:725,w:390,h:200,tile:3},{x:1050,y:535,w:160,h:355,tile:1},
 {x:1770,y:740,w:420,h:170,tile:0},{x:2820,y:675,w:370,h:225,tile:3},
 {x:4080,y:620,w:165,h:280,tile:1},{x:5520,y:735,w:410,h:180,tile:0}];
 ctx.save();ctx.globalAlpha=.22;
 for(const v of vistas){const x=v.x-camera*.84;if(x+v.w<-100||x>vw+100)continue;tutorialReefPiece(v.tile,x,v.y,v.w,v.h);}
 ctx.restore();
 // Shallow shafts give each bend depth without obscuring the swim lane.
 ctx.save();for(const wx of [520,1940,3150,4080,5660,6900]){const x=wx-camera*.94;if(x<-210||x>vw+210)continue;
 const wash=ctx.createLinearGradient(x,waterSurface(),x,850);wash.addColorStop(0,'#c5fff317');wash.addColorStop(1,'#b6ecff00');ctx.fillStyle=wash;ctx.beginPath();ctx.moveTo(x-30,waterSurface());ctx.lineTo(x+45,waterSurface());ctx.lineTo(x+170,850);ctx.lineTo(x-115,850);ctx.closePath();ctx.fill();}ctx.restore();
 // Arrival and arena each have a distinct, broad coral dais. They are scenery.
 for(const [wx,width] of [[450,540],[6900,650]]){const x=wx-camera;if(x+width<-100||x-width>vw+100)continue;tutorialReefPiece(0,x-width/2,875,width,100);}
}
function tutorialDaddyFaceIndex(pose){
 if(/Charge|Command|dadDash|vulnerable/.test(pose))return 2;
 if(/arrival|bubbleBurst/.test(pose))return 3;
 if(/celebrate|Volley/.test(pose))return 1;
 return training?.speech?.who==='daddy'&&/!|\?/.test(training.speech.text)?1:0;
}
function drawTutorialDaddyHead(pose,p,t,x){
 const speaking=state==='dialogue'||training?.speech?.who==='daddy';
 const target=clamp((nessie.x-camera-x)/400,-1,1),tick=reducedMotion?0:t;
 const angle=reducedMotion?0:target*.105+Math.sin(tick*1.6)*.045+(speaking?Math.sin(tick*4)*.018:0)+p.head;
 const crop=TUTORIAL_FACE_CROPS[tutorialDaddyFaceIndex(pose)];
 ctx.save();ctx.translate(target*3,-66);ctx.rotate(angle);
 if(crop&&tutorialFaceArt?.complete&&tutorialFaceArt.naturalWidth){
  // Jaw bob is tiny; the neck pivot keeps the crown and head attached.
  const bob=speaking&&!reducedMotion?Math.sin(tick*5)*1.3:0;
  atlasDraw(tutorialFaceArt,crop,-51.5,-102+bob,103,112);
 }else bossPart(2,1,0,-46,103,112,0);
 ctx.restore();
}

function tutorialRingClear(x,y){return !obstacles.some(o=>x+75>o.x&&x-75<o.x+o.w&&y+90>o.y&&y-90<o.y+o.h);}
