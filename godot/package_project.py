#!/usr/bin/env python3
"""Build a Godot Project Manager compatible ZIP from this checkout.
Directory entries must precede nested files: Project Manager does not create
parent directories implicitly. Keep project.godot at the ZIP root.
"""
from pathlib import Path
import argparse, re, subprocess, zipfile
root = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('output', type=Path)
args = parser.parse_args()
tracked = subprocess.check_output(['git','ls-files'],cwd=root,text=True).splitlines()
files = {p for p in tracked if p.startswith('godot/') and not p.endswith(('.uid','.import','.gif'))}
files.add('project.godot')
for name in list(files):
    if (root/name).suffix in {'.gd','.tscn','.tres','.godot','.gdshader'}:
        for resource in re.findall(r'["\']res://(dist/[^"\']+)["\']' , (root/name).read_text()):
            if not (root/resource).is_file():
                raise RuntimeError('Missing runtime asset: '+resource)
            files.add(resource)
notes = '''Sarah Maria — Mermaid Adventure | Godot v0.14 — Pearl & Crown UI Update

Godot 4.4.1 or newer: Project Manager > Import > select this ZIP > choose an empty folder.
Alternatively extract this ZIP and import the project.godot file at its root.
Press F6 on godot/highland_level.tscn to go directly to Level 1.
The main project runs the illustrated opening and menu first.

v0.14: original transparent shell, pearl, crown and action icons; native live HUD;
score counting, pooled reward feedback, fair timed combos, results and saved records.
Refined multitouch joystick/actions, cancellation handling and size/opacity options.
Includes v0.13: active lake approach/pursuit, waterfall telegraph-and-lunge encounters,
sculpted creature lighting and anticipation/strike/recovery animation.
Includes v0.12: connected, deformable Sarah arms, hair, tail and fins, expressive gestures,
refined head/body/arm proportions, an elongated tail, flowing swim cycles, more responsive steering/braking and proportional touch controls.
Includes the dimensional jump pass: elastic launch/landing, faux yaw, limb overlap,
rounded lighting, apex fin fan and curved intertwined fin trails.
Adds alternating small left/right corkscrews and independent celebratory arm/wrist lifts.
Includes all previous menu, enemy, environment, waterfall, jump and reliable ZIP improvements.
F3: Reduced Motion. F4: Economy/High depth. M: music.

The old ZIP extraction alert also affected music and scripts. This archive fixes its
missing directory entries; it has passed Godot-style extraction and fresh editor import.
See godot/README.md for controls, scope and QA. This is the native Level 1 vertical slice.
'''
directories = {str(parent)+'/' for name in files for parent in Path(name).parents if str(parent)!='.'}
args.output.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(args.output,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
    for directory in sorted(directories,key=lambda p:(p.count('/'),p)):
        archive.writestr(directory,b'')
    archive.writestr('START-HERE.txt',notes)
    for name in sorted(files):
        archive.write(root/name,name)
print(f'{args.output}: {len(files)+1} files, {len(directories)} explicit directories, {args.output.stat().st_size} bytes')
