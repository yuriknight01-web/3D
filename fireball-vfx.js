import * as T from 'three';
const additive=color=>new T.MeshBasicMaterial({color,transparent:true,opacity:.8,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
function glowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,250,190,1)');g.addColorStop(.22,'rgba(255,191,70,.7)');g.addColorStop(.55,'rgba(255,80,20,.18)');g.addColorStop(1,'rgba(255,50,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new T.CanvasTexture(c);}
export class FireballVFX{
 constructor(scene,ball){this.ball=ball;this.root=new T.Group();scene.add(this.root);this.charge=new T.Group();scene.add(this.charge);this.blast=new T.Group();scene.add(this.blast);this.blast.visible=false;this.blastAge=9;
 const glow=new T.Sprite(new T.SpriteMaterial({map:glowTexture(),color:0xffbd64,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));glow.scale.setScalar(2.3);ball.add(glow);this.glow=glow;
 this.ribbons=Array.from({length:7},(_,k)=>{const g=new T.BufferGeometry(),pos=new Float32Array(33*2*3),idx=[];for(let i=0;i<32;i++){let a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}g.setAttribute('position',new T.BufferAttribute(pos,3));g.setIndex(idx);const o=new T.Mesh(g,additive(k%2?'#ffbd38':'#ff5c16'));o.frustumCulled=false;ball.add(o);return o;});
 this.rings=Array.from({length:3},(_,i)=>{const o=new T.Mesh(new T.TorusGeometry(.62+i*.14,.014,6,96),additive(i===1?'#fff1a8':'#ffa53c'));this.charge.add(o);o.rotation.x=i===0?Math.PI/2:Math.PI/3;return o;});
 this.runes=Array.from({length:12},(_,i)=>{const o=new T.Mesh(new T.OctahedronGeometry(.055),additive('#ffe594'));this.charge.add(o);return o;});
 this.shock=new T.Mesh(new T.TorusGeometry(1,.025,8,96),additive('#ffcf77'));this.shock.rotation.x=-Math.PI/2;this.blast.add(this.shock);
 this.flashes=Array.from({length:18},(_,i)=>{const o=new T.Mesh(new T.ConeGeometry(.08,.7,5),additive(i%2?'#ffb33f':'#fff2b1'));const d=new T.Vector3(Math.cos(i*2.4),.15+Math.random()*.8,Math.sin(i*2.4)).normalize();o.userData.dir=d;o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d);this.blast.add(o);return o;});
 this.flash=glow.clone();this.flash.material=glow.material.clone();this.blast.add(this.flash);
 }
 hit(point){this.blast.position.copy(point);this.blastAge=0;this.blast.visible=true;}
 update(dt,time,state,start,direction,charge){
 this.ball.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),direction);this.glow.material.opacity=.65+.12*Math.sin(time*14);
 const flying=state==='flight';this.ribbons.forEach((o,k)=>{const a=o.geometry.attributes.position;for(let i=0;i<=32;i++){const u=i/32,angle=k*Math.PI*2/7+u*5-time*(flying?9:5),r=(.28+Math.sin(u*Math.PI)*.2)*(1-u*.7),z=flying?.15-u*1.9:Math.sin(u*Math.PI*2+time*4+k)*.35;const width=(1-u)*(.09+.025*Math.sin(time*7+k));for(let side=0;side<2;side++){const an=angle+(side?1:-1)*width/r;a.setXYZ(i*2+side,Math.cos(an)*r,Math.sin(an)*r,z)}}a.needsUpdate=true;});
 this.charge.visible=state==='charge';this.charge.position.copy(start);this.charge.scale.setScalar(.55+charge*.55);this.rings.forEach((r,i)=>{r.rotation.z=time*(i%2?2:-2);r.rotation.y=time*.6+i;});this.runes.forEach((r,i)=>{const a=time*1.7+i*Math.PI/6;r.position.set(Math.cos(a)*.9,Math.sin(a*2)*.13,Math.sin(a)*.9);r.rotation.y=time*3;});
 if(this.blastAge<1){this.blastAge+=dt;const p=this.blastAge;this.blast.visible=p<1;this.shock.scale.setScalar(.2+p*2.2);this.shock.material.opacity=(1-p)*.9;this.shock.position.y=-this.blast.position.y+.06;this.flash.scale.setScalar((.8+Math.sin(Math.min(p*3,1)*Math.PI)*1.7));this.flash.material.opacity=Math.max(0,1-p*2.5);for(const o of this.flashes){o.position.copy(o.userData.dir).multiplyScalar(p*2.3);o.scale.setScalar(Math.max(0,1-p));o.material.opacity=1-p;}}
 }
}
