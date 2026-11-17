// Photographic architectural entourage. Fictional people; transparent image cutouts.
export function createPopulation(T,scene,obstacles){
  const figures=[];
  const slots=[
    {x:-5.4,z:-.3,index:0,seated:true},{x:-5.4,z:2.3,index:1,seated:true},
    {x:-2.8,z:1,index:2,seated:true},
    {x:-7.25,z:3.5,index:3},{x:-7.5,z:-5.85,index:0,seated:true},
    {x:-6.4,z:-5.85,index:1,seated:true},{x:-5.1,z:-4.65,index:5},
    {x:.1,z:-5.55,index:4},{x:7.5,z:-3.6,index:3},
    {x:6,z:-1.8,index:2,seated:true},{x:7,z:5.5,index:4}
  ];
  const url=new URL('./assets/professores-treino.webp',import.meta.url).href;
  const loader=new T.TextureLoader();
  loader.load(url,atlas=>{
    const image=atlas.image,cell=image.width/6;
    const textures=[];
    for(let i=0;i<6;i++){
      const c=document.createElement('canvas');c.width=Math.floor(cell);c.height=image.height;
      const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,i*cell,0,cell,image.height,0,0,c.width,c.height);
      const data=ctx.getImageData(0,0,c.width,c.height).data;
      let left=c.width,top=c.height,right=0,bottom=0;
      for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(data[(y*c.width+x)*4+3]>80){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}
      const cropped=document.createElement('canvas');cropped.width=Math.max(1,right-left+3);cropped.height=Math.max(1,bottom-top+3);
      cropped.getContext('2d').drawImage(c,left-1,top-1,cropped.width,cropped.height,0,0,cropped.width,cropped.height);
      const tex=new T.CanvasTexture(cropped);tex.colorSpace=T.SRGBColorSpace;
      textures.push({tex,ratio:cropped.width/cropped.height});
    }
    for(const q of slots){
      const {tex,ratio}=textures[q.index],height=q.seated?1.26:1.78;
      const material=new T.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.3,side:T.DoubleSide,depthWrite:true,toneMapped:false});
      const mesh=new T.Mesh(new T.PlaneGeometry(height*ratio,height),material);
      mesh.position.set(q.x,height/2+.035,q.z);mesh.name=q.seated?'Aluno em aula — recorte fotográfico':'Professor — recorte fotográfico';
      scene.add(mesh);figures.push(mesh);
      if(!q.seated)obstacles.push({x:q.x,z:q.z,w:.7,d:.7});
    }
    atlas.dispose();
  },undefined,error=>console.warn('Pessoas da visita indisponíveis',error));
  return {count:slots.length,update(time,camera){if(!camera)return;for(const mesh of figures)mesh.rotation.y=Math.atan2(camera.position.x-mesh.position.x,camera.position.z-mesh.position.z)}};
}