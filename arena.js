import * as T from 'three';
import {OrbitControls} from './OrbitControls.js';
const host=document.querySelector('#scene'),scene=new T.Scene();scene.background=new T.Color('#d7e2d9');scene.fog=new T.Fog('#d7e2d9',25,58);
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;host.append(renderer.domElement);
const camera=new T.PerspectiveCamera(36,innerWidth/innerHeight,.1,100);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=3;controls.maxDistance=55;controls.maxPolarAngle=Math.PI*.94;controls.minPolarAngle=.18;controls.target.set(0,.5,0);
function view(name='home'){
 const positions={home:[0,12,21],front:[0,5,24],back:[0,7,-24],left:[-24,8,0],right:[24,8,0],top:[0,26,.01]};
 camera.position.set(...positions[name]).multiplyScalar(innerWidth/innerHeight<1.1?1.3:1);
 controls.target.set(0,.5,0);controls.update();
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===name)));
 host.dataset.view=name;
}view();
scene.add(new T.HemisphereLight('#eaf6eb','#83937f',.55));const sun=new T.DirectionalLight('#fff0c8',1.6);sun.position.set(-8,14,7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-13,right:13,top:13,bottom:-13,near:.5,far:45});sun.shadow.normalBias=.035;sun.shadow.bias=-.00015;scene.add(sun);
// Environment lighting is kept for the accepted pet materials only.
let part='Foundation';const map=new T.Group();map.name='Verdant Court — modular 3D environment';scene.add(map);
let seed=1921;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}const ink='#344e46';
const gradient=new T.DataTexture(new Uint8Array([85,85,85,255,150,150,150,255,218,218,218,255,255,255,255,255]),4,1);gradient.minFilter=gradient.magFilter=T.NearestFilter;gradient.needsUpdate=true;
function painted(base,kind){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=base;x.fillRect(0,0,256,256);for(let i=0;i<95;i++){x.globalAlpha=.025+rand()*.055;x.strokeStyle=i%3?'#fff9cd':'#243e38';x.lineWidth=1+rand()*4;const a=rand()*256,b=rand()*256;x.beginPath();x.moveTo(a,b);x.lineTo(a+8+rand()*32,b+(kind==='stone'?rand()*5:rand()*20-10));x.stroke()}x.globalAlpha=1;if(kind==='stone'){x.strokeStyle='#344e4638';x.lineWidth=1.3;for(let i=0;i<8;i++){let a=rand()*256,b=rand()*256;x.beginPath();x.moveTo(a,b);x.lineTo(a+8,b+12);x.lineTo(a+5,b+20);x.stroke()}}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t}
function mat(color,kind='plain'){return new T.MeshToonMaterial({color:kind==='plain'?color:'#ffffff',map:kind==='plain'?null:painted(color,kind),gradientMap:gradient})}
const m={stone:mat('#c1c8a4','stone'),light:mat('#e1d9b4','stone'),dark:mat('#637e6b','stone'),earth:mat('#707c5d','stone'),grass:mat('#98b66b','leaf'),grass2:mat('#a9c079','leaf'),leaf:mat('#6d9c66','leaf'),leafLight:mat('#a8c478','leaf'),leafDeep:mat('#426f63','leaf'),bark:mat('#897b5a','stone'),gold:mat('#d6b66d','stone'),teal:mat('#568f89','leaf'),pink:mat('#d79b9f','leaf'),white:mat('#f1e5bc'),flower:mat('#f2b5a1'),water:mat('#83c8bf'),rune:mat('#e7e4b3')};
const outlineMat=new T.MeshBasicMaterial({color:ink,side:T.BackSide});
function mesh(geo,material,p=[0,0,0],scale=[1,1,1],outline=false,parent=map){const o=new T.Mesh(geo,material);o.position.set(...p);o.scale.set(...scale);o.castShadow=true;o.receiveShadow=true;o.userData.part=part;parent.add(o);if(outline){const shell=new T.Mesh(geo,outlineMat);shell.scale.setScalar(1.022);o.add(shell)}return o}
const box=new T.BoxGeometry(1,1,1),sphere=new T.IcosahedronGeometry(1,1),smoothSphere=new T.SphereGeometry(1,12,8);
function block(p,s,material=m.stone){const o=mesh(box,material,p,s);const e=new T.LineSegments(new T.EdgesGeometry(box,25),new T.LineBasicMaterial({color:ink,transparent:true,opacity:.5}));o.add(e);return o}
function rock(x,z,s=1){const o=mesh(sphere,m.dark,[x,.22*s,z],[s,.6*s,s*.75],true);o.rotation.set(rand()*.5,rand()*6,.15);return o}
// Low floating foundation with a dressed masonry rim and a quiet grass battle floor.
block([0,-.64,0],[14.1,.85,10.2],m.earth);block([0,-.22,0],[14.35,.20,10.45],m.dark);block([0,-.06,0],[14,.20,10.1],m.grass);
for(let i=0;i<14;i++){block([-6.5+i,.07,-4.85],[.96,.26,.42],i%3?m.light:m.stone);block([-6.5+i,.07,4.85],[.96,.26,.42],i%3?m.light:m.stone)}
for(let i=0;i<9;i++)for(const side of [-1,1])block([side*6.8,.07,i-4],[.42,.26,.96],m.light);
part='Battle floor';
// Irregular stone pavers, actual 3D polygons with fine ink joints.
for(let row=-2;row<=2;row++)for(let col=-4;col<=4;col++){
 const x=col*1.22+(row%2)*.61,z=row*1.06;if(Math.abs(x)>5.5)continue;
 const g=new T.CylinderGeometry(.695,.695,.075,6);const o=mesh(g,(row+col)%4===0?m.light:m.stone,[x,.075,z],[1,1,1]);o.rotation.y=0;
 o.add(new T.LineSegments(new T.EdgesGeometry(g,28),new T.LineBasicMaterial({color:'#647c66',transparent:true,opacity:.55})));
}
part='Paw crest';
// Central engraved crest, subtle enough to leave the combat silhouettes readable.
const ring=mesh(new T.TorusGeometry(1.08,.022,6,72),m.gold,[0,.122,0]);ring.rotation.x=-Math.PI/2;
const pad=mesh(new T.CylinderGeometry(.32,.32,.013,24),m.dark,[0,.126,.16],[1.3,1,.8]);for(let i=0;i<3;i++)mesh(new T.CylinderGeometry(.12,.12,.014,16),m.dark,[(i-1)*.29,.127,-.22-(i===1?.1:0)]);
part='Steps and balustrades';
// Entrance stairs and low side balustrades.
for(let i=0;i<3;i++)block([0,-.18-i*.13,5.12+i*.36],[3.4+i*.3,.23,.58],m.light);
for(const side of [-1,1]){for(let i=0;i<5;i++)block([side*(2.4+i*.92),.24,4.55],[.86,.37,.48],m.stone);for(let i=0;i<7;i++)block([side*6.45,.36,-3.8+i*1.05],[.48,.52,.98],i%2?m.light:m.stone)}
part='Gate and walls';
// Rear garden wall and open arch: masonry is segmented, with bevel-like caps.
for(let i=-6;i<=6;i++){if(Math.abs(i)<2)continue;block([i,.55,-4.38],[.96,.95,.6],m.stone);block([i,1.07,-4.38],[1.03,.12,.75],m.light)}
for(const side of [-1,1]){block([side*1.52,1.03,-4.35],[.67,2.1,.75],m.light);block([side*1.52,.20,-4.35],[.95,.40,.98],m.dark);block([side*1.52,1.98,-4.35],[.88,.18,.94],m.gold)}
for(let i=0;i<13;i++){const a=(i+.5)/13*Math.PI;const o=block([Math.cos(a)*1.51,2+Math.sin(a)*1.32,-4.35],[.37,.49,.8],i===6?m.gold:m.light);o.rotation.z=a-Math.PI/2}
const crest=mesh(new T.TorusGeometry(.31,.065,6,32),m.gold,[0,3.63,-4.35]);mesh(new T.OctahedronGeometry(.17),m.teal,[0,3.63,-4.34]);
part='Water garden';
// Small side water garden, a channel integrated into the arena boundary.
block([-5.75,.03,.15],[.65,.05,6.9],m.dark);const water=mesh(new T.PlaneGeometry(.51,6.7),m.water,[-5.75,.09,.15]);water.rotation.x=-Math.PI/2;
const ripples=[];for(let i=0;i<11;i++){const o=mesh(new T.TorusGeometry(.14+rand()*.06,.009,4,24),m.white,[-5.75,.105,-2.8+i*.57],[1,1,.5]);o.rotation.x=-Math.PI/2;ripples.push(o)}
part='Trees';
// Trees have clustered, sculpted canopies and angular bark contours.
const plants=[];function tree(x,z,h,variant=0){const group=new T.Group();group.position.set(x,0,z);map.add(group);mesh(new T.CylinderGeometry(.15,.30,h*.68,7),m.bark,[0,h*.34,0],[1,1,1],true,group);
 for(let i=0;i<3;i++){const branch=mesh(new T.CylinderGeometry(.055,.12,h*.4,6),m.bark,[(i-1)*.25,h*.65,0],[1,1,1],true,group);branch.rotation.z=(i-1)*.55}
 const crown=new T.Group();crown.position.y=h*.82;group.add(crown);for(let i=0;i<7;i++){const a=i*2.4;const radius=i===0?0:.55;mesh(sphere,[m.leaf,m.leafLight,m.leafDeep][(i+variant)%3],[Math.cos(a)*radius,(i%3)*.32,Math.sin(a)*radius],[.95,.7,.85],true,crown)}plants.push({o:crown,phase:rand()*6,amount:.018});
 for(let i=0;i<4;i++){const a=i*Math.PI/2;const root=mesh(new T.ConeGeometry(.2,.8,5),m.bark,[Math.cos(a)*.20,.12,Math.sin(a)*.20],[1,1,1],true,group);root.rotation.z=.9;root.rotation.y=a}}
[[-6.2,-4,3.9],[-4.5,-5.2,4.4],[-2.8,-5.7,3.7],[3.3,-5.5,4.0],[5.3,-5,4.6],[6.9,-2.6,3.6],[-7.2,-1.1,3.2]].forEach((p,i)=>tree(...p,i));
part='Flowers and foliage';
// Stylized leaf blades, fern rosettes and flowers, each a small 3D mesh.
const leafShape=new T.Shape();leafShape.moveTo(0,0);leafShape.quadraticCurveTo(.23,.24,0,.68);leafShape.quadraticCurveTo(-.23,.24,0,0);const leafGeo=new T.ShapeGeometry(leafShape);const leafMat=m.leaf.clone();leafMat.side=T.DoubleSide;
function tuft(x,z,size=1){const g=new T.Group();g.position.set(x,.14,z);map.add(g);for(let i=0;i<5;i++){const l=mesh(leafGeo,i%2?leafMat:m.leafLight,[0,0,0],[size,size,size],false,g);l.rotation.y=i*1.25;l.rotation.x=-.30-i*.13;l.material.side=T.DoubleSide}plants.push({o:g,phase:rand()*6,amount:.035})}
function flower(x,z,color=m.flower){mesh(new T.CylinderGeometry(.012,.016,.28,4),m.leafDeep,[x,.25,z]);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;mesh(smoothSphere,color,[x+Math.cos(a)*.075,.4,z+Math.sin(a)*.075],[.065,.025,.065])}mesh(smoothSphere,m.gold,[x,.415,z],[.033,.025,.033])}
for(let i=0;i<58;i++){const x=(rand()-.5)*13,z=(rand()-.5)*9;if(Math.abs(x)<5.15&&Math.abs(z)<3.15)continue;tuft(x,z,.35+rand()*.6);if(i%3===0)rock(x+.22,z,.2+rand()*.24);if(i%2===0)flower(x-.15,z+.2,i%4?m.flower:m.white)}
for(const side of [-1,1]){for(let i=0;i<9;i++)flower(side*(3.4+rand()*2.5),3.3+rand()*.7);rock(side*6,3.65,.65);tuft(side*5.7,3.45,1.1)}
part='Banners and lanterns';
// Waving cloth standards and warm lanterns flank the gate.
const banners=[];for(const side of [-1,1]){const x=side*3.5,z=-3.7;block([x,.2,z],[.65,.4,.65],m.dark);mesh(new T.CylinderGeometry(.045,.045,2.75,8),m.gold,[x,1.5,z]);mesh(new T.OctahedronGeometry(.12),m.gold,[x,2.94,z]);const g=new T.PlaneGeometry(.68,1.05,8,8);const cloth=mesh(g,side<0?m.teal:m.pink,[x+side*.36,2.16,z]);cloth.material=cloth.material.clone();cloth.material.side=T.DoubleSide;banners.push({o:cloth,base:g.attributes.position.array.slice(),side});const badge=mesh(new T.OctahedronGeometry(.14),m.white,[x+side*.36,2.18,z+.045],[1,1,.18]);}
for(const side of [-1,1]){const x=side*1.52,z=-3.86;block([x,1.37,z],[.20,.33,.20],m.dark);mesh(smoothSphere,new T.MeshBasicMaterial({color:'#ffe2a4'}),[x,1.39,z+.05],[.07,.1,.06]);}
part='Atmosphere';
// Atmospheric motes give depth without obscuring the field.
const moteGeo=new T.BufferGeometry(),motePos=new Float32Array(36*3);for(let i=0;i<36;i++){motePos[i*3]=(rand()-.5)*13;motePos[i*3+1]=.3+rand()*3;motePos[i*3+2]=(rand()-.5)*8}moteGeo.setAttribute('position',new T.BufferAttribute(motePos,3));const motes=new T.Points(moteGeo,new T.PointsMaterial({color:'#fff4b3',size:.045,transparent:true,opacity:.6}));map.add(motes);
let animate=true;
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view(b.dataset.view));
document.querySelector('#motion').onclick=e=>{animate=!animate;e.target.textContent=animate?'Pause motion':'Resume motion';e.target.setAttribute('aria-pressed',String(!animate));};
const raycaster=new T.Raycaster(),pointer=new T.Vector2();let down=null,selection=null;
renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
renderer.domElement.addEventListener('pointerup',e=>{
 if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5||e.button!==0)return;
 const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
 const hit=raycaster.intersectObject(map,true).find(h=>h.object.isMesh&&h.object.userData.part);
 if(selection){scene.remove(selection);selection.geometry.dispose();selection.material.dispose();selection=null;}
 const label=document.querySelector('#selected');
 if(hit){selection=new T.BoxHelper(hit.object,0xe9ad45);scene.add(selection);label.textContent=hit.object.userData.part;host.dataset.selected=label.textContent;}
 else {label.textContent='Click a detail to identify its area';delete host.dataset.selected;}
});
window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()});
host.dataset.loaded='true';
const clock=new T.Clock();let time=0;function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05);if(animate)time+=dt;for(const p of plants)p.o.rotation.z=Math.sin(time*.8+p.phase)*p.amount;for(const b of banners){const a=b.o.geometry.attributes.position;for(let i=0;i<a.count;i++){const x=b.base[i*3],y=b.base[i*3+1];a.setZ(i,Math.sin(time*1.7+x*3+y*2)*.055*(.5+x*b.side));}a.needsUpdate=true;b.o.geometry.computeVertexNormals()}ripples.forEach((r,i)=>r.scale.setScalar(1+.10*Math.sin(time+i)));motes.rotation.y=time*.015;controls.update();renderer.render(scene,camera)}frame();