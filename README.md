# Pet Codex · 萌宠图鉴
Interactive 3D character collection by Xitao Liao.

Live: https://yuriknight01-web.github.io/3D/  
Portfolio: https://yuriknight01-web.github.io/Porfolio/

Three latest accepted pets: Bunni V34, Ember V31, Otti V31. Includes idle,
walk/hop, run, attack, hit, defeat, head-check animations, blinking and tail motion.
Rotate, zoom, pause, scrub, step frames and inspect materials/skeleton in the viewer.

## Preview / deployment
Run `python3 -m http.server 8080` in this folder. GitHub Pages serves `main` / root.
The fixed public URL stays available while the repository and Pages are enabled.
No build or external CDN is required. Needs WebGL; first model selection downloads 13–21 MB.

## Assets and editable sources
Files are losslessly split into small parts to fit GitHub browser upload limits.
The viewer assembles the GLB parts automatically; visitors do not need to do anything.
Download the repository ZIP and run `python3 restore-sources.py` to verify and
rebuild the three Blender source ZIPs. Unzip them to open the editable .blend files.
Mesh, texture and animation data are unchanged by splitting. Browser dissolve is a
shader effect; skeletal and eyelid animation is also in the Blender and GLB data.

## Attribution
Character assets © Xitao Liao. No reuse license is granted for the characters.
AI-assisted modeling, Blender refinement/rigging, Three.js web presentation.
Three.js MIT license: THREE-LICENSE.txt.
