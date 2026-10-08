'use strict';
const fs=require('node:fs'),path=require('node:path');
(async()=>{const rt=await require('./art-runtime.cjs')(),out=process.argv[2]||'/workspace/scratch/060981a79282/waterfall-87';fs.mkdirSync(out,{recursive:true});
rt.run("mode='sarah';stage=0;loadStage();state='playing';dialogueSeen=new Set(Object.keys(conversations));nessie.x=2920;nessie.y=400;camera=2300;draw(12)");await rt.waitForBitmaps();
for(const [name,time,extra] of [['entrance',null,''],['pull',.9,"highland.fall.phase='pull'"],['shaft',8,"highland.fall.phase='descent';highland.fall.y=-60"],['eel',7,"highland.fall.phase='descent';highland.fall.y=100"],['exit',.8,"highland.fall.phase='outflow';nessie.x=4120;nessie.y=610;camera=3520"]]){if(time!==null)rt.run(`if(!highland.fall)beginHighlandFall();highland.fall.time=${time};highland.fall.travel=${name==='exit'?17:time};highland.fall.depth=180+highland.fall.travel*350;${extra}`);rt.run('draw(12)');await rt.waitForBitmaps();rt.run('draw(12)');fs.writeFileSync(path.join(out,name+'.png'),rt.surface.toBuffer('image/png'));}
console.log('Rendered entrance, uninterrupted pull, shaft, eel encounter and outflow.');})().catch(e=>{console.error(e);process.exit(1)});
