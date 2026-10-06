const fs=require('node:fs'),path=require('node:path'),{createCanvas,loadImage}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');
async function render(){const names=['highlands','colombia','nessie','dancers','barrier-reef','barrier-jungle','flora-layer','carlo','miguel','rana-rex','sarah-mermaid','dialogue-friends','king-daddy-atlas','queen-antonella-atlas','pearl-palace','training-lagoon','environment-atlas','creature-atlas','tutorial-magic-atlas','gentleman-shark','tutorial-reef-v6','tutorial-daddy-faces-v6','boss-wild-parts','boss-sea-parts','boss-royal-parts','boss-spell-parts'];const images=await Promise.all(names.map(name=>loadImage(path.resolve(__dirname,'../dist/assets/'+name+'.webp'))));for(const img of images){Object.defineProperties(img,{src:{set(){}},naturalWidth:{get(){return this.width}},naturalHeight:{get(){return this.height}},complete:{get(){return true}}});img.addEventListener=()=>{};}const rt=require('./runtime.cjs')(true,images);
const out=process.argv[2]||'/tmp/rana-contact-sheet.png',sheet=createCanvas(2100,1440),sc=sheet.getContext('2d');
const states=[0,0,0,1,1,1];
for(const [i,chapter] of states.entries()){rt.run(`mode='story';stage=${chapter};loadStage();state='playing';camera=2400;nessie.x=2850;nessie.y=450;boss.active=true;boss.clock=${[.2,.8,2,0.5,3,4][i]};elapsed=${i};draw(${i});`);sc.drawImage(rt.surface,i%3*700,Math.floor(i/3)*480,700,480);}
fs.writeFileSync(out,sheet.toBuffer('image/png'));console.log(out);

}
render().catch(e=>{console.error(e);process.exit(1)});
