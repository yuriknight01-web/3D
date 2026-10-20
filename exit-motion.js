// Dissolve is a renderer effect; skeletal pose and closed eyes are baked in Defeat.
export class ExitMotion {
 constructor(model,pet){
  this.uniform={value:0};this.mouth={value:0};this.blink={value:0};this.pet=pet;this.model=model;this.materials=[];
  model.traverse(o=>{if(!o.isMesh)return;const list=Array.isArray(o.material)?o.material:[o.material];const copies=list.map(m=>{
   const c=m.clone();c.onBeforeCompile=shader=>{
    shader.uniforms.exitProgress=this.uniform;shader.uniforms.defeatMouth=this.mouth;shader.uniforms.naturalBlink=this.blink;
    shader.vertexShader='uniform float naturalBlink;\nuniform float defeatMouth;\nvarying vec3 exitPosition;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nexitPosition=position;');
    shader.fragmentShader='uniform float naturalBlink;\nuniform float exitProgress;\nuniform float defeatMouth;\nvarying vec3 exitPosition;\n'+shader.fragmentShader;
    if(this.pet==='ember' && m.name!=='Closed eyelid'){
     const muzzleFunctions=`
      float muzzleMask(vec3 p){
       float noseGuard=1.0-(1.0-smoothstep(.022,.035,abs(p.x)))*smoothstep(.047,.060,p.y);
       return (1.0-smoothstep(.085,.115,abs(p.x)))*smoothstep(.69,.75,p.z)
        *smoothstep(-.018,.002,p.y)*(1.0-smoothstep(.065,.090,p.y))*noseGuard;
      }
      float muzzleDepth(vec2 p){return -(-.793312+.007216*p.x-.213389*p.y+4.676614*p.x*p.x+.016473*p.x*p.y+5.314320*p.y*p.y);}
     `;
     shader.vertexShader=muzzleFunctions+shader.vertexShader;
     shader.fragmentShader=muzzleFunctions+shader.fragmentShader;
     shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
      float mouthBlend=defeatMouth*muzzleMask(position);
      vec3 smoothMuzzleNormal=normalize(vec3(.007216+9.353228*position.x+.016473*position.y,
       -.213389+.016473*position.x+10.628640*position.y,1.0));
      objectNormal=normalize(mix(objectNormal,smoothMuzzleNormal,mouthBlend));
     `);
     shader.vertexShader=shader.vertexShader.replace('exitPosition=position;', `exitPosition=position;
      transformed.z=mix(transformed.z,muzzleDepth(position.xy),defeatMouth*muzzleMask(position));
     `);

     shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
      // Eyelids close over the unchanged rounded face, without compressing cheeks.
      float ex=(abs(exitPosition.x)-.176)/.112;
      float ez=(exitPosition.y-.208)/.123;
      float eyeRegion=(1.0-smoothstep(1.10,1.25,length(vec2(ex,ez))))*smoothstep(.34,.50,exitPosition.z);
      float eyeSeam=.196+.018*min(1.0,ex*ex);
      float aperture=.15*(1.0-naturalBlink);
      float cover=smoothstep(aperture-.006,aperture+.006,abs(exitPosition.y-eyeSeam))*smoothstep(0.0,.06,naturalBlink);
      if(naturalBlink>.999)cover=1.0;
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.94,.925,.89),eyeRegion*cover);
      float eyelidLine=(1.0-smoothstep(.0015,.0035,abs(exitPosition.y-eyeSeam)))*(1.0-smoothstep(.78,.90,abs(ex)))*smoothstep(.90,1.0,naturalBlink)*eyeRegion;
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.035,.018,.012),eyelidLine);
      // Object-space material expression. Preserve the authored mesh and UVs.
      float mx=abs(exitPosition.x), my=exitPosition.y;
      float mouthArea=muzzleMask(exitPosition);
      float darkInk=1.0-smoothstep(.20,.55,max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b)));
      vec3 muzzle=vec3(.94,.925,.89);
      diffuseColor.rgb=mix(diffuseColor.rgb,muzzle,defeatMouth*mouthArea);
      float lineY=.030-.010*pow(min(mx/.078,1.0),2.0);
      float stroke=(1.0-smoothstep(.0016,.0035,abs(my-lineY)))*(1.0-smoothstep(.074,.082,mx))
         *smoothstep(.70,.75,exitPosition.z);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.045,.030,.022),stroke*defeatMouth);
     `);
     shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      normal=normalize(mix(normal,nonPerturbedNormal,max(defeatMouth*mouthArea,eyeRegion*cover)));
     `);
    }
    shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>
      if(exitProgress>0.0){
       vec3 cell=floor(exitPosition*65.0);
       float grain=fract(sin(dot(cell,vec3(12.9898,78.233,37.719)))*43758.5453);
       float field=clamp(.35*(exitPosition.y+.9)/1.8+.65*grain,0.0,1.0);
       if(field<exitProgress)discard;
       float edge=1.0-smoothstep(0.0,.05,field-exitProgress);
       gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(.85,1.0,.86),edge*.8);
      }`);
   };c.customProgramCacheKey=()=> 'pet-exit-surface-v39-'+pet;this.materials.push(c);return c;
  });o.material=Array.isArray(o.material)?copies:copies[0];});
 }
 update(clip,phase){const f=clip==='Defeat'?Math.max(0,Math.min(1,(phase-.03)/.32)):0;this.mouth.value=f*f*(3-2*f);const u=clip==='Defeat'?Math.max(0,Math.min(1,(phase-.70)/.27)):0;this.uniform.value=u*u*(3-2*u);this.model.visible=this.uniform.value<1;return this.uniform.value;}
}
