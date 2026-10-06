const assert=require('node:assert/strict'),rt=require('./runtime.cjs')();rt.sandbox.assert=assert;
rt.run(`
const movement=[];
for(const fps of [20,30,60,120]){mode='trial';stage=0;loadStage();state='playing';coins=[];obstacles=[];keys.add('ArrowRight');for(let i=0;i<fps*2;i++)advanceSimulation(1/fps);movement.push(nessie.x);assert(Math.abs(elapsed-2)<1e-8);assert.equal(simulationBatch,false);}
assert(Math.max(...movement)-Math.min(...movement)<4,'Swimming speed remains consistent across render rates');
state='paused';const px=nessie.x,time=elapsed;advanceSimulation(.1);assert.equal(nessie.x,px);assert.equal(elapsed,time);
state='playing';advanceSimulation(10);assert(elapsed-time<=.100001,'Long stalls have bounded catch-up');
const oldUpdate=update;update=()=>{throw new Error('test')};try{advanceSimulation(.02)}catch{}assert.equal(simulationBatch,false);update=oldUpdate;
assert.equal(meshLayout(230,154,12,8),meshLayout(230,154,12,8),'Topology is reused');
const target=$('perf-target');setHtmlIfChanged(target,'<b>ready</b>');assert.equal(target.innerHTML,'<b>ready</b>');
`);
console.log('Performance checks passed: 20/30/60/120 Hz movement, elapsed time, pause, bounded stalls, cleanup and shared mesh topology.');
