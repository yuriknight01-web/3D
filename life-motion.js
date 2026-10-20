import * as THREE from 'three';
// Additive life motion: restore each frame before evaluating the authored clip.
export class LifeMotion {
 constructor(model,pet){
  this.pet=pet;this.time=0;this.nextBlink=1.5;this.blinkStart=-10;this.double=false;this.meshes=[];this.tails=[];
  model.traverse(o=>{if(o.morphTargetDictionary?.Blink!==undefined)this.meshes.push(o);if(o.isBone&&/^Tail(Base|Tip)$/.test(o.name))this.tails.push({bone:o,base:o.quaternion.clone()});});
 }
 restore(){for(const t of this.tails)t.bone.quaternion.copy(t.base);}
 update(dt,{active,blink,tail,manual,clip,phase=0}){
  if(active)this.time+=dt;
  if(active&&this.time>=this.nextBlink){this.blinkStart=this.time;const twice=!this.double&&Math.random()<.18;this.double=twice;this.nextBlink=this.time+(twice?.40:2.8+Math.random()*3.2);}
  const age=this.time-this.blinkStart;
  let close=age<0?0:age<.09?age/.09:age<.13?1:age<.25?1-(age-.13)/.12:0;
  close=close*close*(3-2*close);
  if(!blink||clip==='Rest')close=0;
  if(clip==='Defeat'){const u=Math.max(0,Math.min(1,this.pet==='ember'?(phase-.03)/.32:this.pet==='otti'?(phase-.04)/.26:(phase-.03)/.32));close=u*u*(3-2*u);}
  close=Math.max(close,manual);
  for(const m of this.meshes){m.morphTargetInfluences[m.morphTargetDictionary.Blink]=close;if(this.pet==='ember'&&m.material?.name==='Closed eyelid')m.visible=false;}
  for(const t of this.tails){
   t.base.copy(t.bone.quaternion);
   if(!tail||clip==='Rest'||clip==='Defeat')continue;
   const tip=t.bone.name==='TailTip';
   const moving=clip==='Walk'||clip==='Run';
   const lag=tip?.85:0;
   let pitch=0,sway=0;
   if(this.pet==='bunni'){
    if(moving){
     // A compact tail lifts during loading and follows the landing rebound.
     const keys=[[0,0],[.18,.11],[.28,.13],[.40,-.12],[.60,-.07],[.76,.04],[.88,.15],[1,0]];
     const p=((phase-.045)%1+1)%1;
     for(let i=0;i<keys.length-1;i++){
      const [a,x]=keys[i],[b,y]=keys[i+1];
      if(p>=a&&p<=b){let u=(p-a)/(b-a);u=u*u*(3-2*u);pitch=x+(y-x)*u;break;}
     }
     sway=.018*Math.sin(phase*Math.PI*2-.4);
    }else{
     pitch=.075*Math.sin(this.time*1.65)+.025*Math.sin(this.time*2.7);
     sway=.025*Math.sin(this.time*1.25);
    }
   }else{
    const otter=this.pet==='otti';
    const strength=moving?.65:1;
    const rhythm=moving?phase*Math.PI*2:this.time*(otter?1.65:1.35);
    // The distal bend is delayed, in the same direction as the root sweep.
    const amp=(otter?.18:.15)*(tip?.72:1)*strength;
    sway=amp*(Math.sin(rhythm-lag)+.18*Math.sin(rhythm*2-lag));
    pitch=amp*.55*Math.sin(rhythm-.6-lag);
   }
   // Use character-space axes rather than arbitrary bone roll axes.
   t.bone.updateWorldMatrix(true,false);
   const inverse=t.bone.getWorldQuaternion(new THREE.Quaternion()).invert();
   const up=new THREE.Vector3(0,1,0).applyQuaternion(inverse);
   const right=new THREE.Vector3(1,0,0).applyQuaternion(inverse);
   const q=new THREE.Quaternion().setFromAxisAngle(up,sway);
   q.multiply(new THREE.Quaternion().setFromAxisAngle(right,pitch));
   t.bone.quaternion.multiply(q);
  }
  return close;
 }
}
