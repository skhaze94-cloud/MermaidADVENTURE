'use strict';
// A deliberate press close to water contact chains a splash bounce.
const SPLASH_EARLY=.22,SPLASH_LATE=.24,SPLASH_DIP=.16;
let splashChain=0,splashBonusUntil=-Infinity,splashLandingAt=-Infinity,splashQueued=false,splashDip=null;
function resetSplashChain(){splashChain=0;splashBonusUntil=-Infinity;splashLandingAt=-Infinity;splashQueued=false;splashDip=null;}
function treasureMultiplier(){return Math.min(8,Math.min(5,1+Math.floor(combo/5))+(elapsed<splashBonusUntil?splashChain:0));}
function landingSoon(){
 if(!leap.active||!leap.breached||nessie.vy<=0||leap.skimming)return false;
 const distance=waterSurface()+25-nessie.y,g=leap.gravity||1200;
 const seconds=(-nessie.vy+Math.sqrt(nessie.vy*nessie.vy+2*g*Math.max(0,distance)))/g;
 return seconds<=SPLASH_EARLY;
}
function requestJump(){
 if(state!=='playing'||splashDip||isExpandedHighland()&&highland?.fall)return false;
 if(leap.active){if(landingSoon()){splashQueued=true;return true;}return false;}
 if(elapsed-splashLandingAt<=SPLASH_LATE){beginSplashBounce();return true;}
 if(leap.cooldown>0||energy<.4&&boostUnlimited<=0&&!bossLeapReady)return false;
 splashChain=0;splashBonusUntil=-Infinity;splashQueued=false;
 launchFromPad(closestLaunchPad());return true;
}
function noteSplashLanding(splashed){
 if(!splashed){splashQueued=false;return;}
 splashLandingAt=elapsed;
 if(splashQueued){splashQueued=false;beginSplashBounce();}
}
function beginSplashBounce(){
 splashLandingAt=-Infinity;
 splashDip={time:0,x:nessie.x,y:waterSurface()+25,vx:nessie.vx};
 nessie.vy=160;dashTime=0;
}
function updateSplashBounce(dt,dx){
 if(!splashDip)return false;
 const dip=splashDip;dip.time+=dt;
 const p=Math.min(1,dip.time/SPLASH_DIP);
 nessie.y=waterSurface()+25+Math.sin(p*Math.PI/2)*43;
 nessie.x=clamp(nessie.x+(dip.vx+dx*90)*dt,90,W-90);
 if(p>=1){
  splashDip=null;splashChain=Math.min(3,splashChain+1);splashBonusUntil=elapsed+4;
  const mult=treasureMultiplier(),reward=100*splashChain;score+=reward;maxCombo=Math.max(maxCombo,mult);
  launchFromPad(closestLaunchPad(),false,true);
  leap.variant='combo';leap.splashBounce=true;
  popups.push({x:nessie.x,y:waterSurface()-35,text:'SPLASH ×'+mult+' · +'+reward,life:1.3,color:'#fff0b3'});
  surfaceSplash(nessie.x,waterSurface(),false);tone(780+splashChain*100,.14);
 }
 return true;
}
