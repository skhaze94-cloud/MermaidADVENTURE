'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{fs.mkdirSync('qa/level-v92',{recursive:true});const browser=await chromium.launch({headless:true});try{
for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
const page=await browser.newPage({viewport,reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8765',{waitUntil:'networkidle'});
assert(await page.evaluate(()=>LEVEL92_IMAGES.every(i=>i.complete&&i.naturalWidth>0)),'all supplied sheets loaded');
for(const [name,x,fallen]of [['shore',750,false],['grotto',5800,true],['ruins',13250,true],['court',19850,true],['waterfall',0,false]]){
await page.evaluate(({x,fallen,name})=>{mode='sarah';stage=0;loadStage();state='playing';dialogueSeen=new Set(Object.keys(conversations));highland.fallen=fallen;nessie.x=x;nessie.y=570;camera=Math.max(0,x-vw*.43);$('overlay').style.display='none';document.querySelector('.game-shell').classList.remove('menu-active','intro-active');hud();syncSplashControls();if(name==='waterfall'){beginHighlandFall();highland.fall.phase='descent';highland.fall.time=5;highland.fall.depth=1930;}state='paused';draw(12);},{x,fallen,name});
await page.screenshot({path:`qa/level-v92/${viewport.width}-${name}.png`});assert.equal(await page.evaluate(()=>enemies.length),68);
}
const cache=await page.evaluate(()=>{for(const name of Object.keys(LEVEL92_CROPS))sprite92(name);return {count:LEVEL92_SPRITES.size,all:[...LEVEL92_SPRITES.values()].every(c=>c.width>0&&c.height>0)}});assert.equal(cache.count,18);assert(cache.all);assert.deepEqual(errors,[]);await page.close();
} }finally{await browser.close();}console.log('9.2 browser: atlas loads, cached crops, desktop/phone route and waterfall scenes, unchanged enemy roster, no page errors.');})().catch(e=>{console.error(e);process.exitCode=1});
