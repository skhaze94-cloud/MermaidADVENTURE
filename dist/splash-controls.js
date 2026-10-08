'use strict';
const keyboardHeld=new Set(),touchDirections=new Map(),touchOwnedKeys=new Set();
function padDirections(x,y,rect){
 const dx=(x-rect.left-rect.width/2)/(rect.width/2),dy=(y-rect.top-rect.height/2)/(rect.height/2),result=[];
 if(Math.hypot(dx,dy)<.2)return result;
 if(Math.abs(dx)>.3)result.push(dx<0?'ArrowLeft':'ArrowRight');
 if(Math.abs(dy)>.3)result.push(dy<0?'ArrowUp':'ArrowDown');
 return result;
}
function syncTouchDirections(){
 for(const key of touchOwnedKeys){if(!keyboardHeld.has(key))keys.delete(key);syncControlVisual(key,keyboardHeld.has(key));}
 touchOwnedKeys.clear();
 for(const directions of touchDirections.values())for(const key of directions){touchOwnedKeys.add(key);keys.add(key);syncControlVisual(key,true);}
 for(const b of document.querySelectorAll('[data-key]')){const pressed=touchOwnedKeys.has(b.dataset.key)||keyboardHeld.has(b.dataset.key);b.classList.toggle('is-pressed',pressed);b.setAttribute('aria-pressed',String(pressed));}
}
function resetTouchDirections(){for(const key of touchOwnedKeys)if(!keyboardHeld.has(key))keys.delete(key);touchDirections.clear();touchOwnedKeys.clear();keyboardHeld.clear();}
function installSplashControls(){
 const pad=document.querySelector('.dpad');
 for(const b of document.querySelectorAll('[data-key]')){
  b.setAttribute('aria-pressed','false');
  b.addEventListener('pointerdown',e=>{e.preventDefault();if(state!=='playing')return;try{b.setPointerCapture?.(e.pointerId);}catch{}activeTouchPointers.set(e.pointerId,b);touchDirections.set(e.pointerId,[b.dataset.key]);syncControlVisual(b.dataset.key,true);syncTouchDirections();if(b.dataset.key===' ')burst();});
  b.addEventListener('pointermove',e=>{if(activeTouchPointers.get(e.pointerId)!==b||b.dataset.key===' ')return;if(state!=='playing'){clearHeldControls();return;}touchDirections.set(e.pointerId,padDirections(e.clientX,e.clientY,pad.getBoundingClientRect()));syncTouchDirections();});
  const release=e=>{if(e?.pointerId!=null){activeTouchPointers.delete(e.pointerId);touchDirections.delete(e.pointerId);}else for(const [id,owner]of activeTouchPointers)if(owner===b){activeTouchPointers.delete(id);touchDirections.delete(id);}syncTouchDirections();};
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,release);
  b.addEventListener('contextmenu',e=>e.preventDefault());
 }
 pad.addEventListener('pointerdown',e=>{if(e.target!==pad||state!=='playing')return;e.preventDefault();try{pad.setPointerCapture?.(e.pointerId);}catch{}activeTouchPointers.set(e.pointerId,pad);touchDirections.set(e.pointerId,padDirections(e.clientX,e.clientY,pad.getBoundingClientRect()));syncTouchDirections();});
 pad.addEventListener('pointermove',e=>{if(activeTouchPointers.get(e.pointerId)!==pad)return;if(state!=='playing'){clearHeldControls();return;}touchDirections.set(e.pointerId,padDirections(e.clientX,e.clientY,pad.getBoundingClientRect()));syncTouchDirections();});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(ev,e=>{if(activeTouchPointers.get(e.pointerId)===pad){activeTouchPointers.delete(e.pointerId);touchDirections.delete(e.pointerId);syncTouchDirections();}});
 for(const jumpButton of [$('touch-jump'),$('desktop-jump')].filter(Boolean)){
  jumpButton.addEventListener('pointerdown',e=>{e.preventDefault();if(state==='playing')requestJump();});
  jumpButton.addEventListener('click',e=>{if(e.detail===0&&state==='playing')requestJump();});
  jumpButton.addEventListener('contextmenu',e=>e.preventDefault());
 }
}
function syncSplashControls(){
 const suspended=state!=='playing';document.querySelector('.game-shell')?.classList.toggle('controls-suspended',suspended);
 if(suspended&&(activeTouchPointers.size||keys.size||keyboardHeld.size))clearHeldControls();
}
