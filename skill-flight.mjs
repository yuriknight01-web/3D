// Swept sphere against sphere colliders: return the earliest contact on this step.
export function firstHit(a,b,colliders,radius=0){
 const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,A=dx*dx+dy*dy+dz*dz;let best=null;
 for(const c of colliders){const x=a.x-c.x,y=a.y-c.y,z=a.z-c.z,r=c.r+radius,C=x*x+y*y+z*z-r*r;let t;
  if(C<=0)t=0;else{if(A<1e-12)continue;const B=2*(x*dx+y*dy+z*dz),D=B*B-4*A*C;if(D<0)continue;t=(-B-Math.sqrt(D))/(2*A);if(t<0||t>1)continue;}
  if(!best||t<best.t)best={id:c.id,t,point:{x:a.x+dx*t,y:a.y+dy*t,z:a.z+dz*t}};
 }return best;
}
