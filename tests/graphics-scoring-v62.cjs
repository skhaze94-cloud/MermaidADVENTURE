'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
const html=fs.readFileSync('dist/index.html','utf8'),game=fs.readFileSync('dist/game.js','utf8'),css=fs.readFileSync('dist/scoring-v62.css','utf8');
assert.match(html,/scoring-v62\.css/);assert.match(html,/(?:6\.\d+|[789]\.\d+) · /);
for(const id of ['pearl-count','treasure-count','reward-banner','reward-title','reward-sub'])assert(html.includes('id="'+id+'"'),id);
for(const token of ['combo-meter','multiplier-shells','v62-result-score','v62-stars','reward-banner.kind-combo'])assert(css.includes(token),token);
for(const token of ['function relicKind','function drawGemTreasure','function drawPearlTreasure','function drawStarCoinTreasure','function drawTreasureChest62','function drawScorePopup','function showRewardBanner','+250 COMBO BONUS','+1000 PERFECT BONUS'])assert(game.includes(token),token);

rt.run(`
simulationBatch=true;mode='trial';stage=0;loadStage();state='playing';score=0;combo=4;lastPickup=elapsed;const c=coins.find(c=>c.type==='coin'&&!c.taken);const expectedPickup=10*treasureMultiplier();pickup(c);globalThis.__comboScore=score;globalThis.__comboMult=treasureMultiplier();globalThis.__comboPopup=popups.some(p=>p.kind==='combo'||p.kind==='perfect');
`);
assert.equal(rt.run('__comboScore'),10*rt.run('__comboMult')+250,'Fifth treasure grants the +250 milestone on top of the live multiplier');
assert(rt.run('__comboPopup'));

rt.run(`
mode='story';stage=1;loadStage();state='playing';simulationBatch=true;const chest=coins.find(c=>c.type==='chest');score=0;pickup(chest);globalThis.__chestKind=popups.at(-1).kind;globalThis.__chestCount=chestCount;
`);
assert.equal(rt.run('__chestKind'),'treasure');assert.equal(rt.run('__chestCount'),1);

rt.run(`
mode='story';stage=1;loadStage();state='playing';simulationBatch=true;health=4;const hp={x:nessie.x,y:nessie.y,type:'heart',phase:0,taken:false};collectPowerup(hp);globalThis.__heart=[health,popups.at(-1).kind];
`);
assert.equal(rt.run('__heart[0]'),5);assert.equal(rt.run('__heart[1]'),'heart');

rt.run(`
mode='trial';stage=0;loadStage();state='playing';simulationBatch=true;score=0;elapsed=30;for(const c of coins)if(c.type==='coin')c.taken=true;completeStage();globalThis.__perfectScore=score;globalThis.__perfectState=state;
`);
assert.equal(rt.run('__perfectScore'),1300,'30-second complete clear earns +300 time and +1000 Perfect');
assert.equal(rt.run('__perfectState'),'portal');

rt.run(`
mode='story';stage=2;loadStage();const kinds=new Set(coins.filter(c=>c.type==='coin').slice(0,18).map(relicKind));globalThis.__kinds=[...kinds];
`);
assert(rt.run('__kinds.length')>=3,'Treasure groups visibly vary between pearl/gem/coin families');

console.log('6.2 graphics/scoring passed: treasure variants, live HUD, +250 combo milestones, +1000 Perfect, powerup rewards and results presentation are wired.');
