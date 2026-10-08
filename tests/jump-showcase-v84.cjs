'use strict';
const assert=require('node:assert/strict'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`
mode='trial';stage=0;loadStage();state='playing';jumpSequence84=0;
const trajectories=[];
for(let style=0;style<12;style++){
 resetLeap();elapsed=0;nessie.x=1000;nessie.y=600;nessie.vx=0;nessie.vy=0;nessie.face=1;energy=1;boostUnlimited=0;heartJumpTime=0;bossLeapReady=false;keys.clear();
 assert(requestJump());assert.equal(leap.style84,style%6,'All six routines appear without needing power-ups');assert.equal(leap.variant,'standard');assert.equal(energy,.6);
 const samples=[];for(let i=0;i<180&&leap.active;i++){elapsed+=1/60;updateSwimmer(1/60,0,0);samples.push([nessie.x,nessie.y,nessie.vx,nessie.vy]);}
 assert(!leap.active,'All routines finish');trajectories.push(JSON.stringify(samples));
}
assert.equal(new Set(trajectories).size,1,'Every routine has identical control, speed, height and airtime');
energy=0;resetLeap();const sequenceBefore=jumpSequence84;assert(!requestJump());assert.equal(jumpSequence84,sequenceBefore,'Rejected presses do not skip routines');
const fingerprints=[];
for(let style=0;style<6;style++){
 for(const variant of ['standard','heart','boost','combo','boss']){
  for(let i=0;i<=100;i++){const f=sarahFlight84(i/100,variant,style);for(const v of Object.values(f))assert(Number.isFinite(v));assert(f.tuck>=0&&f.tuck<=1);assert(Math.abs(f.roll)<=1);}
  assert(Math.abs(sarahFlight84(0,variant,style).angle)<1e-10);
  const end=sarahFlight84(1,variant,style);assert(Math.abs(end.roll)<1e-10);assert(Math.abs(end.curl)<1e-10);
  if(variant==='boss')assert(Math.abs(Math.abs(end.angle)-Math.PI*4)<1e-10,'Boss reward retains the double rotation');
 }
 leap={active:true,breached:true,style84:style,variant:'standard',airDuration:1,airTime:.5};fingerprints.push(JSON.stringify(sarahMotion81(1,1,1)));
 const before=JSON.stringify({hero:nessie,score,health,energy,leap});drawJumpFlourish84(false);drawJumpFlourish84(true);drawJumpLanding84({landing:true,style84:style,life:.6,x:1000,y:300});assert.equal(JSON.stringify({hero:nessie,score,health,energy,leap}),before,'Flourishes are cosmetic');
}
assert.equal(new Set(fingerprints).size,6,'Each routine has distinct limb and tail choreography');
assert(sarahFlight84(.6,'standard',0).angle>0);assert(sarahFlight84(.6,'standard',1).angle<0,'Backflip reverses the turn');
assert(sarahFlight84(.5,'standard',3).fan>.7,'Starfish spreads the fins');assert(sarahFlight84(.25,'standard',4).angle<0,'Dolphin pitches into its dive');
mode='story';const original={};assignJump84(original);assert.equal(original.style84,undefined);assert.equal(jumpStyle84(),null,'Nessie stays unchanged');
mode='sarah';stage=-1;trainingHero='daddy';assignJump84(original);assert.equal(original.style84,undefined,'King Daddy stays unchanged');
`);
const quiet=require('./runtime.cjs')(false,[],{reducedMotion:true});quiet.run(`mode='sarah';state='playing';leap={active:true,breached:true,style84:2,variant:'standard',airTime:.5,airDuration:1};`);assert.deepEqual(JSON.parse(quiet.run('JSON.stringify(jumpPose())')),{angle:0,squash:1,stretch:1,skew:0});
console.log('8.4 jumps: six ordinary routines, identical physics, distinct limbs, boss double turns, cosmetic rendering, character isolation and reduced motion passed.');
