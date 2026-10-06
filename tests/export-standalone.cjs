'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sarah-offline-'));
try{
 const file=path.join(dir,'game.html');execFileSync('python3',['scripts/export-standalone.py',file]);
 const html=fs.readFileSync(file,'utf8'),scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
 assert(scripts.length>15);for(const source of scripts)new vm.Script(source);
 const registry=JSON.parse(scripts[0].match(/const OFFLINE_ASSETS=(.*);/s)[1]);
 assert(registry['assets/gentleman-shark.webp'].startsWith('data:image/webp;base64,'));
 assert(registry['assets/bubble-bell-adventure.mp3'].startsWith('data:audio/mpeg;base64,'));
 for(const [,key] of html.matchAll(/OFFLINE_ASSETS\["([^"]+)"\]/g))assert(registry[key],'Embedded asset: '+key);
 assert(!/<script src=/.test(html));assert(!/(?:src|href)=["'](?:assets|fonts)\//.test(html));
 assert(html.length<30*1024*1024,'Shared soundtrack is embedded once, not repeated for every scene');
 console.log('Offline export passed: parseable source, shared art/music registry, embedded fonts, no external script links.');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
