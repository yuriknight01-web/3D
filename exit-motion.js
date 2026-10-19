// Dissolve is a renderer effect; skeletal pose and closed eyes are baked in Defeat.
export class ExitMotion {
 constructor(model,pet){
  this.uniform={value:0};this.mouth={value:0};this.pet=pet;this.model=model;this.materials=[];
  model.traverse(o=>{if(!o.isMesh)return;const list=Array.isArray(o.material)?o.material:[o.material];const copies=list.map(m=>{
   const c=m.clone();c.onBeforeCompile=shader=>{
    shader.uniforms.exitProgress=this.uniform;shader.uniforms.defeatMouth=this.mouth;
    shader.vertexShader='varying vec3 exitPosition;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nexitPosition=position;');
    shader.fragmentShader='uniform float exitProgress;\nuniform float defeatMouth;\nvarying vec3 exitPosition;\n'+shader.fragmentShader;
    if(this.pet==='ember' && m.name!=='Closed eyelid'){
     shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
      // Object-space material expression. Preserve the authored mesh and UVs.
      float mx=abs(exitPosition.x), my=exitPosition.y;
      float mouthArea=(1.0-smoothstep(.082,.100,mx))*smoothstep(.70,.75,exitPosition.z)
         *smoothstep(-.005,.012,my)*(1.0-smoothstep(.054,.068,my));
      float darkInk=1.0-smoothstep(.20,.55,max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b)));
      vec3 muzzle=vec3(.94,.925,.89);
      diffuseColor.rgb=mix(diffuseColor.rgb,muzzle,defeatMouth*mouthArea*darkInk);
      float lineY=.030-.010*pow(min(mx/.078,1.0),2.0);
      float stroke=(1.0-smoothstep(.0016,.0035,abs(my-lineY)))*(1.0-smoothstep(.074,.082,mx))
         *smoothstep(.70,.75,exitPosition.z);
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.045,.030,.022),stroke*defeatMouth);
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
   };c.customProgramCacheKey=()=> 'pet-exit-mouth-v35-'+pet;this.materials.push(c);return c;
  });o.material=Array.isArray(o.material)?copies:copies[0];});
 }
 update(clip,phase){const f=clip==='Defeat'?Math.max(0,Math.min(1,(phase-.03)/.32)):0;this.mouth.value=f*f*(3-2*f);const u=clip==='Defeat'?Math.max(0,Math.min(1,(phase-.70)/.27)):0;this.uniform.value=u*u*(3-2*u);this.model.visible=this.uniform.value<1;return this.uniform.value;}
}
