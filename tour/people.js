// Stylized fictional occupants, modeled locally without external assets.
export function createPopulation(T, scene, obstacles) {
  const people=[];
  const materials=new Map();
  const material=color=>{if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.85}));return materials.get(color)};
  const sphere=new T.SphereGeometry(1,12,8);
  const limbGeometry=new T.CylinderGeometry(1,1,1,8);
  const torsoGeometry=new T.CylinderGeometry(.23,.18,.48,10);
  const up=new T.Vector3(0,1,0);
  function mesh(g,geometry,color,x,y,z,sx=1,sy=sx,sz=sx){const m=new T.Mesh(geometry,material(color));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
  function limb(g,a,b,r,color){const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start),mid=start.clone().add(end).multiplyScalar(.5);const m=mesh(g,limbGeometry,color,mid.x,mid.y,mid.z,r,delta.length(),r);m.quaternion.setFromUnitVectors(up,delta.normalize());return m}
  const skins=['#b77a52','#754b35','#d49c76','#986344','#e0b28c'];
  function person(x,z,{seated=false,teacher=false,angle=0,pose='rest',variant=0}={}){
    const g=new T.Group();g.name=teacher?'Professor do CT':'Aluno do CT';g.position.set(x,0,z);g.rotation.y=angle;scene.add(g);
    const skin=skins[variant%skins.length],shirt=teacher?'#e7edf5':'#225fbd',shorts='#112b50',shoe='#e8edf2';
    const hip=seated?.66:.91,shoulder=hip+.48,head=hip+.82;
    mesh(g,torsoGeometry,shirt,0,hip+.25,0);
    mesh(g,sphere,skin,0,head,0,.155,.19,.15);
    const hair=mesh(g,sphere,variant%3===0?'#503d2c':'#241f20',0,head+.09,.025,.16,.12,.15);
    // Faces look toward local -Z; small eyes keep the figures readable at close range.
    for(const ex of [-.052,.052])mesh(g,sphere,'#25232a',ex,head+.02,-.138,.016);
    limb(g,[0,hip+.48,0],[0,hip+.64,0],.065,skin);
    for(const side of [-1,1]){
      const hx=side*.115;
      const knee=seated?[hx,.48,-.34]:[hx,.48,pose==='stretch'&&side===1?-.22:0];
      const ankle=seated?[hx,.12,-.34]:[hx,.12,pose==='stretch'&&side===1?-.35:.02];
      limb(g,[hx,hip,0],knee,.095,shorts);limb(g,knee,ankle,.065,skin);
      mesh(g,sphere,shoe,ankle[0],.075,ankle[2]-.07,.085,.06,.16);
      const raised=pose==='teach'&&side===-1;
      const elbow=raised?[side*.48,shoulder+.04,-.09]:[side*.29,hip+.2,seated?-.13:0];
      const hand=raised?[side*.7,shoulder+.23,-.2]:[side*.2,seated?hip+.08:hip-.02,seated?-.34:-.05];
      limb(g,[side*.22,shoulder-.03,0],elbow,.072,shirt);limb(g,elbow,hand,.05,skin);mesh(g,sphere,skin,...hand,.06);
    }
    // Small CT badge on the chest, with no personal likenesses or identifying details.
    mesh(g,new T.BoxGeometry(.07,.085,.012),teacher?'#225fbd':'#f0f4ff',-.09,hip+.34,-.195);
    if(pose==='read'){
      const book=new T.Group();book.position.set(0,hip+.04,-.38);book.rotation.x=-.35;g.add(book);
      mesh(book,new T.BoxGeometry(.36,.025,.24),'#dfcba1',0,0,0);mesh(book,new T.BoxGeometry(.012,.03,.24),'#225fbd',0,.005,0);
    }
    if(!seated)obstacles.push({x,z,w:.78,d:.78});
    people.push({g,hair,phase:variant*.8,teacher});return g;
  }
  // Occupy existing chairs; leave the right-hand aisle and all camera stops clear.
  let v=0;
  for(const x of [-5.4,-4.1,-2.8])for(const z of [-.3,1,2.3])person(x,z,{seated:true,angle:Math.PI/2,variant:v++});
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
  return {count:people.length,update(time){if(reduced.matches)return;for(const p of people){p.g.rotation.z=Math.sin(time*.7+p.phase)*.008;}}};
}
