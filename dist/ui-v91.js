'use strict';
// Brief cues use game time: drawing twice cannot restart them, and pausing freezes them.
function installUI91(){
 if(installUI91.installed)return;installUI91.installed=true;
 let clock=0;const cues=new Map();
 function brief(id,key,eligible=true){
  const el=$(id);if(!eligible){el.hidden=true;return;}
  let cue=cues.get(id);if(!cue||cue.key!==key){cue={key,until:clock+1};cues.set(id,cue);}
  el.hidden=clock>=cue.until;
 }
 const originalUpdate=update;update=function(dt){if(state==='playing')clock+=Math.max(0,Math.min(dt,.1));originalUpdate(dt);};
 const originalLoad=loadStage;loadStage=function(){cues.clear();clock=0;originalLoad();};
 const originalTutorial=syncTutorialUi;syncTutorialUi=function(){
  originalTutorial();const active=isTraining()&&!!training&&state==='playing';
  brief('tutorial-card',training?.step,active&&training.step>=0&&!training.victoryReady&&!training.pendingLesson);
  // The readable control cue replaces the paragraph, counters and decorated panel.
  if(active&&training.step>=0&&!training.victoryReady){const touch=window.matchMedia('(any-pointer:coarse)').matches;
   const labels=touch?['Swim through the rings','Swim over the reef','Tap Boost','Tap Jump','Jump, then steer right','Collect the gifts, then Jump','Boost into the green glow']:['Swim · WASD / arrows','Swim over the reef','Boost · Space','Jump · J / Shift','Jump, then steer right','Collect the gifts, then Jump','Boost into the green glow'];
   $('tutorial-title').textContent=labels[training.step]||'Keep swimming';}
 };
 const originalHighland=syncHighlandUi;syncHighlandUi=function(){originalHighland();
  brief('waterfall-help','fall',state==='playing'&&isExpandedHighland()&&!!highland?.fall);
 };
 const originalLesson=updateBossLesson;updateBossLesson=function(){originalLesson();bossLessonTime=Math.min(bossLessonTime,1);};
 // Bubble availability stays in the action itself; show only a temporary power-up status.
 const originalBubble=syncBubbleUi;syncBubbleUi=function(){originalBubble();
  const hud=document.getElementById('bubble-power-hud');if(hud)hud.hidden=!(mode==='sarah'&&V70.bubbleRush>0);
 };
 $('tutorial-card').setAttribute('role','status');
 $('tutorial-card').setAttribute('aria-live','polite');
 $('waterfall-help').setAttribute('role','status');
 syncTutorialUi();syncHighlandUi();syncBubbleUi();
}
