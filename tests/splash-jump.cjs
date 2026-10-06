const assert=require('node:assert/strict'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`
function setupSplashTest(){mode='trial';stage=0;loadStage();state='playing';nessie.x=1000;nessie.y=600;energy=1;keys.clear();score=0;combo=0;}
function tick(n){for(let i=0;i<n;i++){elapsed+=1/60;updateSwimmer(1/60,0,0);}}
setupSplashTest();keys.add('ArrowUp');burst();assert(!leap.active,'Boost never launches');resetLeap();energy=1;dashCooldown=0;keys.clear();assert(requestJump());assert(leap.active,'Jump needs no directional key');
while(!leap.breached)tick(1);assert(!requestJump(),'Early taps do not queue');
let guard=0;while(!landingSoon()&&guard++<300)tick(1);assert(guard<300);assert(requestJump());
while(leap.active)tick(1);assert(splashDip);const landingY=nessie.y;tick(5);assert(nessie.y>landingY,'Bounce dips below water');tick(6);assert(leap.active);assert(leap.splashBounce);assert.equal(splashChain,1);assert.equal(score,100);assert.equal(treasureMultiplier(),2);
while(leap.active)tick(1);assert(!splashDip);tick(6);assert(requestJump(),'Late grace press accepted');tick(10);assert.equal(splashChain,2);assert.equal(score,300);assert.equal(treasureMultiplier(),3);
while(leap.active)tick(1);tick(16);assert(!splashDip);energy=0;assert(!requestJump(),'After grace, normal energy gate applies');
resetLeap();assert.equal(splashChain,0);assert.equal(splashDip,null);assert.equal(treasureMultiplier(),1);
setupSplashTest();requestJump();state='paused';const before=nessie.y;update(1/60);assert.equal(nessie.y,before);
setupSplashTest();const c=coins.find(c=>c.type==='coin');splashChain=2;splashBonusUntil=elapsed+4;pickup(c);assert.equal(score,30,'Bounce multiplier applies to treasure');elapsed+=5;assert.equal(treasureMultiplier(),1);
`);console.log('Splash jumps passed: distinct boost/jump, early/late grace, real dip/relaunch, chains, score multiplier, energy, pause and reset.');
