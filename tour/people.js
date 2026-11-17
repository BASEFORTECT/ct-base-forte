// Neutral architectural scale figures, with smooth anatomy and restrained materials.
export function createPopulation(T, scene, obstacles) {
  const people=[];
  const materials=new Map();
  const material=color=>{if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.92}));return materials.get(color)};
  const sphere=new T.SphereGeometry(1,20,14);
  const limbGeometry=new T.CapsuleGeometry(1,1,4,12);
  const torsoGeometry=new T.LatheGeometry([new T.Vector2(.125,0),new T.Vector2(.155,.045),new T.Vector2(.145,.15),new T.Vector2(.19,.33),new T.Vector2(.195,.39),new T.Vector2(.13,.445),new T.Vector2(.065,.47)],24);
  const up=new T.Vector3(0,1,0);
  function mesh(g,geometry,color,x,y,z,sx=1,sy=sx,sz=sx){const m=new T.Mesh(geometry,material(color));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
  function limb(g,a,b,r,color){const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start),mid=start.clone().add(end).multiplyScalar(.5);const m=mesh(g,limbGeometry,color,mid.x,mid.y,mid.z,r,delta.length()/3,r);m.quaternion.setFromUnitVectors(up,delta.normalize());return m}
  const skins=['#c4b9a7','#b7ad9e','#d3c7b5','#c0b29e','#d0c5b5'];
  function person(x,z,{seated=false,teacher=false,angle=0,pose='rest',variant=0}={}){
    const g=new T.Group();g.name=teacher?'Professor do CT':'Aluno do CT';g.position.set(x,0,z);g.rotation.y=angle;scene.add(g);
    const skin=skins[variant%skins.length],shirt=teacher?'#c7ccd0':['#657889','#6f8090','#84919a'][variant%3],shorts=teacher?'#525e68':'#596c7d',shoe='#747775';
    const hip=seated?.62:.89,shoulder=hip+.43,head=hip+.68;
    const torso=mesh(g,torsoGeometry,shirt,0,hip,0,1,1,.68);
    mesh(g,sphere,shorts,0,hip+.025,0,.16,.105,.105);
    mesh(g,sphere,skin,0,head,0,.09,.12,.098);
    mesh(g,sphere,skin,0,head-.055,-.025,.071,.066,.077);
    mesh(g,sphere,skin,0,head-.018,-.095,.018,.023,.025);
    // Monochrome, simplified faces are deliberate architectural entourage.
    const hair=mesh(g,sphere,skin,0,head+.055,.012,.091,.067,.095);
    limb(g,[0,hip+.43,0],[0,hip+.59,0],.048,skin);
    for(const side of [-1,1]){
      const hx=side*.09;
      const knee=seated?[hx,.48,-.34]:[hx,.48,pose==='stretch'&&side===1?-.22:0];
      const ankle=seated?[hx,.12,-.34]:[hx,.12,pose==='stretch'&&side===1?-.35:.02];
      limb(g,[hx,hip,0],knee,.079,shorts);limb(g,knee,ankle,.052,skin);
      mesh(g,sphere,shoe,ankle[0],.075,ankle[2]-.07,.065,.052,.13);
      const raised=pose==='teach'&&side===-1;
      const elbow=raised?[side*.35,shoulder-.14,-.11]:[side*.235,hip+.19,seated?-.13:0];
      const hand=raised?[side*.52,shoulder+.01,-.24]:[side*.2,seated?hip+.08:hip-.02,seated?-.34:-.05];
      limb(g,[side*.17,shoulder-.035,0],elbow,.06,shirt);limb(g,elbow,hand,.038,skin);mesh(g,sphere,skin,...hand,.04,.065,.025);
    }
    if(pose==='read'){
      const book=new T.Group();book.position.set(0,hip+.04,-.38);book.rotation.x=-.35;g.add(book);
      mesh(book,new T.BoxGeometry(.36,.025,.24),'#dfcba1',0,0,0);mesh(book,new T.BoxGeometry(.012,.03,.24),'#225fbd',0,.005,0);
    }
    if(!seated)obstacles.push({x,z,w:.78,d:.78});
    people.push({g,hair,phase:variant*.8,teacher});return g;
  }
  // Occupy existing chairs; leave the right-hand aisle and all camera stops clear.
  let v=0;
  for(const x of [-5.4,-2.8])for(const z of [-.3,1,2.3])person(x,z,{seated:true,angle:Math.PI/2,variant:v++});
  person(-7.35,3.5,{teacher:true,angle:-Math.PI/2,pose:'teach',variant:3});
  person(-7.5,-5.85,{seated:true,pose:'read',variant:4});
  person(-6.4,-5.85,{seated:true,variant:2});
  person(-7.5,-3.65,{seated:true,angle:Math.PI,pose:'read',variant:1});
  person(-5.1,-4.65,{teacher:true,angle:Math.PI/2,pose:'teach',variant:0});
  person(.1,-5.55,{pose:'read',angle:Math.PI,variant:2});
  person(7.5,-3.6,{teacher:true,angle:Math.PI/2,pose:'teach',variant:4});
  person(6,-1.8,{angle:Math.PI,pose:'stretch',variant:1});
  person(7,5.5,{teacher:true,angle:Math.PI/2,variant:2});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  return {count:people.length,update(time){if(reduced.matches)return;for(const p of people){p.g.rotation.z=0;}}};
}
