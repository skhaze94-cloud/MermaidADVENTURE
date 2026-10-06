const fs=require('node:fs'),path=require('node:path'),{createCanvas,loadImage}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');
async function render(){const names=['highlands','colombia','nessie','dancers','barrier-reef','barrier-jungle','flora-layer','carlo','miguel','rana-rex','sarah-mermaid','dialogue-friends','king-daddy-atlas','queen-antonella-atlas','pearl-palace','training-lagoon','environment-atlas','creature-atlas','tutorial-magic-atlas'];const images=await Promise.all(names.map(name=>loadImage(path.resolve(__dirname,'../dist/assets/'+name+'.webp'))));for(const img of images){Object.defineProperties(img,{src:{set(){}},naturalWidth:{get(){return this.width}},naturalHeight:{get(){return this.height}},complete:{get(){return true}}});img.addEventListener=()=>{};}const rt=require('./runtime.cjs')(true,images);
const out=process.argv[2]||'/tmp/rana-contact-sheet.png',sheet=createCanvas(2100,1440),sc=sheet.getContext('2d');
const states=['standard','heart','boost','combo','boss','boss'];
for(const [i,variant] of states.entries()){rt.run(`mode='sarah';stage=1;loadStage();state='playing';camera=1000;nessie.x=1600;nessie.y=180;leap.active=true;leap.breached=true;leap.variant='${variant}';leap.airDuration=1.3;leap.airTime=${i===5?.9:.4};leap.trace=Array.from({length:24},(_,j)=>({x:1400+j*8,y:250-j*3}));draw(20);`);sc.drawImage(rt.surface,i%3*700,Math.floor(i/3)*480,700,480);sc.fillStyle='#102534ed';sc.fillRect(i%3*700,Math.floor(i/3)*480,700,28);sc.fillStyle='#e1fff1';sc.font='bold 16px sans-serif';sc.fillText(variant,i%3*700+12,Math.floor(i/3)*480+20);}
fs.writeFileSync(out,sheet.toBuffer('image/png'));console.log(out);

}
render().catch(e=>{console.error(e);process.exit(1)});
