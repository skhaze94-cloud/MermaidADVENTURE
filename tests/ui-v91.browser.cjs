'use strict';
// Real CSS and pointer checks in Chromium; screenshots are retained by CI for review.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 fs.mkdirSync('qa/ui-v91',{recursive:true});const browser=await chromium.launch({headless:true});
 try{for(const device of [
  {name:'desktop',width:1440,height:1000,touch:false},
  {name:'phone',width:390,height:844,touch:true},
  {name:'narrow-phone',width:320,height:568,touch:true},
  {name:'landscape',width:844,height:390,touch:true},
  {name:'tablet',width:1024,height:768,touch:true}
 ]){
  const context=await browser.newContext({viewport:{width:device.width,height:device.height},hasTouch:device.touch,isMobile:device.touch,deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:`qa/ui-v91/${device.name}-menu.png`});
  // Opening the chapter drawer must stay scrollable, including short landscape screens.
  await page.locator('#chapter-drawer summary').click();await page.locator('#stage-3').scrollIntoViewIfNeeded();assert(await page.locator('#stage-3').isVisible());
  await page.evaluate(()=>{mode='sarah';stage=0;loadStage();state='playing';score=123456;V70.mermaidPowers.bubble=true;$('overlay').style.display='none';const shell=document.querySelector('.game-shell');shell.classList.remove('menu-active','intro-active');syncBubbleUi();hud();syncSplashControls();});
  await page.screenshot({path:`qa/ui-v91/${device.name}-game.png`});
  assert(await page.evaluate(()=>['#score','.stage-hud b'].every(s=>getComputedStyle(document.querySelector(s)).fontFamily.includes('Nunito'))),device.name+' shared UI font');
  const boxes=await page.evaluate(()=>{
   const box=s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height,visible:getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden'};};
   return {shell:box('.game-shell'),hud:box('.hud'),stage:box('.stage-hud'),score:box('.score-tile'),health:box('.timer-tile'),pause:box('#pause'),pad:box('.dpad'),actions:box('.splash-actions'),boost:box('.touch-dash'),jump:box('#touch-jump'),bubble:box('#touch-bubble'),meter:box('.dash-meter')};
  });
  const inside=(a,b)=>a.x>=b.x-1&&a.right<=b.right+1&&a.y>=b.y-1&&a.bottom<=b.bottom+1;
  assert(inside(boxes.hud,boxes.shell),device.name+' HUD bounded');assert(boxes.hud.height<=(device.width<=700?100:85),device.name+' HUD stays compact');assert(boxes.score.right<=boxes.health.x+1&&boxes.health.right<=boxes.pause.x+1,device.name+' essentials share a row');
  for(const n of ['stage','score','health','pause'])assert(inside(boxes[n],boxes.hud),device.name+' '+n+' fits HUD');
  if(device.touch){
   assert(boxes.pad.visible&&boxes.actions.visible,device.name+' touch controls visible');
   assert(inside(boxes.pad,boxes.shell)&&inside(boxes.actions,boxes.shell),device.name+' controls bounded');
   assert(boxes.pad.right+4<=boxes.actions.x,device.name+' controls do not overlap');
   for(const n of ['boost','jump','bubble'])assert(boxes[n].width>=44&&boxes[n].height>=44,device.name+' '+n+' usable target');
   assert(boxes.meter.visible&&boxes.meter.bottom<=boxes.actions.y,device.name+' energy visible above actions');
   // A real pointer must start and release swimming with the smaller geometry.
   const right=page.locator('[data-key="ArrowRight"]');await right.dispatchEvent('pointerdown',{pointerId:1,bubbles:true});assert(await page.evaluate(()=>keys.has('ArrowRight')));await right.dispatchEvent('pointercancel',{pointerId:1,bubbles:true});assert(!(await page.evaluate(()=>keys.has('ArrowRight'))));
  }
  await page.evaluate(()=>{stage=-1;loadStage();state='playing';training.step=2;training.pendingLesson=null;syncTutorialUi();});
  assert(await page.locator('#tutorial-card').isVisible());await page.screenshot({path:`qa/ui-v91/${device.name}-cue.png`});await page.waitForTimeout(1250);assert(!(await page.locator('#tutorial-card').isVisible()));
  await page.evaluate(()=>pause());await page.locator('#resume').scrollIntoViewIfNeeded();assert(await page.locator('#resume').isVisible());await page.screenshot({path:`qa/ui-v91/${device.name}-pause.png`});await page.locator('#resume').click();assert.equal(await page.evaluate(()=>state),'playing');
  assert.deepEqual(errors,[],device.name+' no page errors');console.log(device.name+' browser layout, cue and pointer checks passed');await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
