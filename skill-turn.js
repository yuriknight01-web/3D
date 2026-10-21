import * as T from 'three';
import {angleDelta,turnPlan} from './turn-math.mjs';
const up=new T.Vector3(0,1,0),smooth=t=>t*t*(3-2*t),clamp=T.MathUtils.clamp;
function worldRotate(b,q){const w=b.getWorldQuaternion(new T.Quaternion()).premultiply(q),p=b.parent.getWorldQuaternion(new T.Quaternion()).invert();b.quaternion.copy(p.multiply(w));b.updateWorldMatrix(false,true);}
function solve(upper,lower,paw,target){
 const a=upper.getWorldPosition(new T.Vector3()),b=lower.getWorldPosition(new T.Vector3()),c=paw.getWorldPosition(new T.Vector3()),pawQ=paw.getWorldQuaternion(new T.Quaternion());
 const l1=a.distanceTo(b),l2=b.distanceTo(c),axis=target.clone().sub(a),raw=axis.length(),d=clamp(raw,Math.abs(l1-l2)+.0001,l1+l2-.0001);axis.normalize();
 const bend=b.clone().sub(a).addScaledVector(axis,-b.clone().sub(a).dot(axis));if(bend.lengthSq()<1e-8)bend.set(0,0,1).cross(axis);bend.normalize();
 const x=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-x*x)),knee=a.clone().addScaledVector(axis,x).addScaledVector(bend,h),end=a.clone().addScaledVector(axis,d);
 worldRotate(upper,new T.Quaternion().setFromUnitVectors(b.clone().sub(a).normalize(),knee.clone().sub(a).normalize()));
 const nowB=lower.getWorldPosition(new T.Vector3()),nowC=paw.getWorldPosition(new T.Vector3());worldRotate(lower,new T.Quaternion().setFromUnitVectors(nowC.sub(nowB).normalize(),end.sub(nowB).normalize()));
 paw.quaternion.copy(paw.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(pawQ));paw.updateWorldMatrix(false,true);
 return paw.getWorldPosition(new T.Vector3()).distanceTo(target);
}
export class TurnInPlace{
 constructor(model,holder){this.model=model;this.holder=holder;this.plan=null;this.saved=[];this.head=model.getObjectByName('Head');this.headYaw=0;this.legs=['Front.L','Hind.R','Front.R','Hind.L'].map(n=>{const [kind,side]=n.split('.');const upper=model.getObjectByName(T.PropertyBinding.sanitizeNodeName(kind+'Upper.'+side)),lower=model.getObjectByName(T.PropertyBinding.sanitizeNodeName(kind+'Lower.'+side)),paw=model.getObjectByName(T.PropertyBinding.sanitizeNodeName(kind+'Paw.'+side));const world=paw.getWorldPosition(new T.Vector3());return {upper,lower,paw,local:holder.worldToLocal(world.clone()),anchor:world.clone()};});}
 restore(){for(const [b,q] of this.saved)b.quaternion.copy(q);this.saved=[];}
 update(dt,desired){
  const bones=[this.head,...this.legs.flatMap(l=>[l.upper,l.lower,l.paw])];this.saved=bones.map(b=>[b,b.quaternion.clone()]);
  if(!this.plan)this.plan=turnPlan(this.holder.rotation.y,desired);
  let p=0;if(this.plan){this.plan.age+=dt;p=clamp((this.plan.age-.10)/.85,0,1);this.holder.rotation.y=this.plan.start+(this.plan.end-this.plan.start)*smooth(p);}
  this.holder.updateWorldMatrix(true,true);const delta=angleDelta(this.holder.rotation.y,desired);this.headYaw+=(clamp(delta,-.23,.23)-this.headYaw)*(1-Math.exp(-dt*12));worldRotate(this.head,new T.Quaternion().setFromAxisAngle(up,this.headYaw));
  let error=0,lift=0;this.legs.forEach((l,i)=>{let target=l.anchor.clone();if(this.plan){const goal=l.local.clone().applyAxisAngle(up,this.plan.end).add(this.holder.position),u=clamp((p-i*.23)/.23,0,1);target.lerp(goal,smooth(u));const height=Math.sin(Math.PI*u)*.10;target.y+=height;lift=Math.max(lift,height);}error=Math.max(error,solve(l.upper,l.lower,l.paw,target));});
  if(this.plan&&p>=1){for(const l of this.legs)l.anchor.copy(l.local).applyAxisAngle(up,this.plan.end).add(this.holder.position);this.plan=null;}
  return {turning:!!this.plan,error,lift,delta};
 }
}
