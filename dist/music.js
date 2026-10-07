// Sarah Maria 6.5 adaptive soundtrack.
// Music is routed through Web Audio gain nodes so fades, crossfades and dialogue
// ducking work on iPhone/iPad, where HTMLMediaElement.volume is read-only.
// Falls back to element.volume when Web Audio is unavailable.
const MUSIC_TRACKS={
 opening:{src:'assets/bubble-bell-adventure.mp3',plannedTrack:'opening-aquatic-adventure.mp3',label:'Opening Credits · Aquatic Adventure',gain:.88},
 tutorial:{src:'assets/bubble-bell-adventure.mp3',plannedTrack:'tutorial-friendly-regal-groove.mp3',label:'Tutorial · Friendly Regal Groove',gain:.82},
 stage1:{src:'assets/bubble-bell-adventure.mp3',plannedTrack:'stage-1-buoyant-splash.mp3',label:'Stage 1 · Buoyant Splash',gain:.84},
 stage1Boss:{src:'assets/bubble-bell-adventure.mp3',plannedTrack:'stage-1-boss-crab-kingdom.mp3',label:'Stage 1 Boss · Crab Kingdom',gain:.9},
 stage2:{src:'assets/bubble-bell-adventure.mp3',plannedTrack:'stage-2-king-pancake-ray.mp3',label:'Stage 2 · King Pancake the Ray',gain:.84},
 stage2Boss:{src:'assets/bubble-bell-adventure.mp3',plannedTrack:'stage-2-boss-final-impact.mp3',label:'Stage 2 Boss · Final Impact',gain:.9},
 stage3:{src:'assets/bubble-bell-adventure.mp3',plannedTrack:'stage-3-mock-solemn-chant.mp3',label:'Stage 3 · The Mock-Solemn Chant',gain:.82},
 stage3Boss:{src:'assets/bubble-bell-adventure.mp3',plannedTrack:'stage-3-boss-queen-antonella.mp3',label:'Stage 3 Boss · Queen Antonella',gain:.9},
 stage4:{src:'assets/bubble-bell-adventure.mp3',plannedTrack:'stage-4-constraining-momentum.mp3',label:'Stage 4 · Constraining Momentum',gain:.84},
 stage4Boss:{src:'assets/bubble-bell-adventure.mp3',plannedTrack:'stage-4-boss-serpentine-assault.mp3',label:'Stage 4 Boss · Serpentine Assault',gain:.91},
 nessieBoss:{src:'assets/bubble-bell-adventure.mp3',plannedTrack:'nessie-second-threat.mp3',label:'Nessie Boss · The Second Threat',gain:.92},
 fallback:{src:'assets/bubble-bell-adventure.mp3',label:'Bubble Bell Adventure',gain:.82}
};
let soundtrack=null,musicIncoming=null,musicKey='',musicIncomingKey='',musicUnlocked=false,musicPending=false,musicBlocked=false,musicFade=0;

// ---- Web Audio routing -------------------------------------------------------
// Shares the `audio` AudioContext that tone() uses in game.js.
function musicContext(){
 try{
  const Ctor=typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext);
  if(!Ctor)return null;
  audio??=new Ctor();
  return audio;
 }catch{return null;}
}
function resumeMusicContext(){const c=audio;if(c&&c.state==='suspended'){try{const p=c.resume();if(p&&p.catch)p.catch(()=>{});}catch{}}}
// Attach a GainNode to a deck. Each media element can only be wired once.
function routeDeck(a){
 if(!a||a._musicGain!==undefined)return;
 a._musicGain=null;
 const c=musicContext();
 if(!c||typeof c.createMediaElementSource!=='function')return;
 try{
  const source=c.createMediaElementSource(a),gain=c.createGain();
  gain.gain.value=0;source.connect(gain);gain.connect(c.destination);
  a._musicGain=gain;a._musicSource=source;
  a.volume=1; // element runs at full level; the gain node does all fading
 }catch{a._musicGain=null;}
}
// Current level of a deck (0..1), regardless of which path it uses.
function deckLevel(a){if(!a)return 0;return a._musicGain?(a._musicLevel??0):a.volume;}
function setDeckLevel(a,v){
 if(!a)return;
 v=Math.max(0,Math.min(1,v||0));
 if(a._musicGain){
  a._musicLevel=v;
  const g=a._musicGain.gain,c=audio;
  // A tiny time constant removes zipper noise from per-frame updates.
  if(c&&typeof g.setTargetAtTime==='function'){try{g.cancelScheduledValues?.(c.currentTime);g.setTargetAtTime(v,c.currentTime,.015);return;}catch{}}
  g.value=v;
 }else a.volume=v;
}
function silenceDeck(a){if(!a)return;if(!a.paused)a.pause();if(a._musicGain){a._musicLevel=0;try{a._musicGain.gain.cancelScheduledValues?.(0);}catch{}a._musicGain.gain.value=0;}else a.volume=0;}

// ---- Scene selection ---------------------------------------------------------
function desiredMusicKey(){try{if(state==='ready'||state==='intro')return'opening';if(isTraining())return'tutorial';if(stage===0)return boss?.active&&boss.hp>0?'stage1Boss':'stage1';if(stage===1)return boss?.active&&boss.hp>0?'stage2Boss':'stage2';if(stage===2)return boss?.active&&boss.hp>0?'stage3Boss':'stage3';if(stage===3){if(isNessieFinal()&&nessieTwist&&!nessieTwist.ready)return'nessieBoss';if(isRana()&&boss?.active&&boss.hp>0)return'stage4Boss';return'stage4';}}catch{}return'opening';}
function currentMusicLabel(){return MUSIC_TRACKS[musicIncomingKey||musicKey||desiredMusicKey()]?.label||'Sarah Maria soundtrack';}
function soundLabel(){const b=$('sound');if(!b)return;b.classList.toggle('music-playing',audioOn&&musicUnlocked&&!musicBlocked&&!document.hidden);b.setAttribute('aria-pressed',String(audioOn));b.setAttribute('aria-label',audioOn?'Mute music and sound effects':'Enable music and sound effects');b.title=currentMusicLabel()+' · Music & effects';const label=b.querySelector('span');if(label)label.textContent=audioOn?(musicBlocked?'Tap for sound':'Sound on'):'Sound off';}

// ---- Decks -------------------------------------------------------------------
function makeMusicDeck(key){if(typeof Audio==='undefined')return null;const meta=MUSIC_TRACKS[key]||MUSIC_TRACKS.fallback,a=new Audio();a.loop=true;a.preload='auto';a.volume=0;a.src=meta.src;if(a.dataset){a.dataset.musicKey=key;a.dataset.musicSrc=meta.src;}else a.dataset={musicKey:key,musicSrc:meta.src};a.addEventListener?.('error',()=>{if(key!=='fallback'&&!a.dataset?.fallbackTried){if(a.dataset)a.dataset.fallbackTried='1';a.src=MUSIC_TRACKS.fallback.src;try{a.load?.();a.play?.();}catch{}}});routeDeck(a);return a;}
function playDeck(a){if(!a||!audioOn||document.hidden)return;resumeMusicContext();try{const p=a.play();musicPending=true;Promise.resolve(p).then(()=>{musicPending=false;musicBlocked=false;soundLabel();}).catch(()=>{musicPending=false;musicBlocked=true;soundLabel();});}catch{musicBlocked=true;soundLabel();}}
function switchMusic(key,immediate=false){if(!musicUnlocked||!audioOn)return;if(key===musicKey&&!musicIncoming)return;if(key===musicIncomingKey)return;// Reuse the deck when scene cues share the bundled soundtrack.
if(soundtrack&&!musicIncoming&&soundtrack.dataset?.musicSrc===(MUSIC_TRACKS[key]||MUSIC_TRACKS.fallback).src){musicKey=key;soundtrack.dataset.musicKey=key;soundLabel();return;}const next=makeMusicDeck(key);if(!next)return;musicIncoming=next;musicIncomingKey=key;musicFade=immediate?1:0;playDeck(next);if(!soundtrack||immediate){if(soundtrack&&soundtrack!==next)silenceDeck(soundtrack);soundtrack=next;musicKey=key;musicIncoming=null;musicIncomingKey='';musicFade=0;}soundLabel();}
function unlockGameAudio(){if(!audioOn)return;musicUnlocked=true;musicBlocked=false;resumeMusicContext();if(!soundtrack)switchMusic(desiredMusicKey(),true);else{playDeck(soundtrack);const wanted=desiredMusicKey();if(wanted!==musicKey)switchMusic(wanted);}soundLabel();}
function toggleGameSound(){if(audioOn&&musicBlocked){unlockGameAudio();return;}audioOn=!audioOn;try{localStorage.setItem('sarah-sound-enabled',audioOn?'1':'0');}catch{}if(audioOn){unlockGameAudio();tone(740,.09,.035);}else{for(const a of [soundtrack,musicIncoming])silenceDeck(a);}soundLabel();}

// ---- Per-frame mixing --------------------------------------------------------
function updateMusic(dt){if(!musicUnlocked)return;const wanted=desiredMusicKey();if(audioOn&&!document.hidden&&wanted!==musicKey&&wanted!==musicIncomingKey)switchMusic(wanted);if(!audioOn||document.hidden){for(const a of [soundtrack,musicIncoming])silenceDeck(a);return;}for(const a of [soundtrack,musicIncoming])if(a?.paused)playDeck(a);let base=state==='dialogue'?.14:state==='paused'?.06:state==='ready'?.24:state==='portal'?.23:.3;const fadeInOut=a=>{if(!a)return 1;const time=a.currentTime,duration=a.duration;return Number.isFinite(duration)&&duration>2?Math.min(1,time/.65,Math.max(0,(duration-time)/.55)):1;};if(musicIncoming){musicFade=Math.min(1,musicFade+Math.min(dt,.1)/.8);const oldGain=MUSIC_TRACKS[musicKey]?.gain||.82,newGain=MUSIC_TRACKS[musicIncomingKey]?.gain||.82;setDeckLevel(soundtrack,base*oldGain*(1-musicFade)*fadeInOut(soundtrack));setDeckLevel(musicIncoming,base*newGain*musicFade*fadeInOut(musicIncoming));if(musicFade>=1){silenceDeck(soundtrack);soundtrack=musicIncoming;musicKey=musicIncomingKey;musicIncoming=null;musicIncomingKey='';musicFade=0;soundLabel();}}else if(soundtrack){const target=base*(MUSIC_TRACKS[musicKey]?.gain||.82)*fadeInOut(soundtrack),cur=deckLevel(soundtrack);setDeckLevel(soundtrack,cur+(target-cur)*(1-Math.exp(-Math.min(dt,.1)*4)));}}
function initGameSound(){try{audioOn=localStorage.getItem('sarah-sound-enabled')!=='0';}catch{audioOn=true;}soundLabel();document.addEventListener('visibilitychange',()=>{if(document.hidden){for(const a of [soundtrack,musicIncoming])silenceDeck(a);soundLabel();}else if(musicUnlocked&&audioOn)unlockGameAudio();});}
