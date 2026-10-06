'use strict';
const assert=require('node:assert/strict'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`
mode='sarah';stage=-1;loadStage();let completed=0;
for(const id of Object.keys(conversations))for(let choice=0;choice<conversations[id].options.length;choice++){
 state='playing';dialogueSeen=new Set();assert(openDialogue(id,()=>completed++));let guard=0;
 while(dialogueFlow.phase!=='choices'&&guard++<20){assert($('dialogue-line').textContent.length>0);advanceConversation();}
 assert.equal(dialogueFlow.phase,'choices');chooseConversationReply(choice);assert.equal($('dialogue-speaker').textContent,'Sarah Maria');assert.equal($('dialogue-line').textContent,conversations[id].options[choice][0]);
 while(state==='dialogue'&&guard++<40){assert($('dialogue-line').textContent.length>0);advanceConversation();}
 assert.equal(state,'playing');assert.equal(dialogueFlow,null);assert(guard<40);
}
assert.equal(completed,Object.values(conversations).reduce((n,c)=>n+c.options.length,0));
const beats=dialogueBeats('Training.\\nSarah: You could have just said that.','King Daddy','daddy-proud');assert.equal(beats.length,2);assert.equal(beats[1].portrait,'sarah');
state='playing';dialogueSeen=new Set();openDialogue('queen-win');assert.equal(dialogueFlow.phase,'opening');handleConversationKey({key:'Enter',repeat:false,preventDefault(){}});assert.equal($('dialogue-speaker').textContent,'Sarah Maria');handleConversationKey({key:'Escape',preventDefault(){}});assert.equal(state,'playing');assert(invincible>=.65);
`);
console.log('Every conversation branch passed: speaker portraits, opening beats, all choices, responses, callbacks, keyboard advance, skip, and safe return to swimming.');
