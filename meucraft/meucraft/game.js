import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const menu=document.getElementById('menu'), game=document.getElementById('game');
document.getElementById('play').onclick=()=>{menu.style.display='none';game.hidden=false;startGame()};

let started=false;
function startGame(){
 if(started)return; started=true;
 const scene=new THREE.Scene();
 scene.background=new THREE.Color(0x87ceeb);
 scene.fog=new THREE.Fog(0x87ceeb,25,70);
 const camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,100);
 camera.position.set(0,3,7);

 const renderer=new THREE.WebGLRenderer({antialias:true});
 renderer.setSize(innerWidth,innerHeight);
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 game.prepend(renderer.domElement);

 scene.add(new THREE.HemisphereLight(0xffffff,0x668866,2));
 const sun=new THREE.DirectionalLight(0xffffff,2); sun.position.set(10,20,5); scene.add(sun);

 const geo=new THREE.BoxGeometry(1,1,1);
 const mats={
  grass:new THREE.MeshLambertMaterial({color:0x55aa44}),
  dirt:new THREE.MeshLambertMaterial({color:0x8b5a2b}),
  stone:new THREE.MeshLambertMaterial({color:0x888888}),
  wood:new THREE.MeshLambertMaterial({color:0x8a5a2b}),
  leaves:new THREE.MeshLambertMaterial({color:0x2f8f3a})
 };
 const blocks=[];
 function addBlock(x,y,z,type='grass'){
   const m=new THREE.Mesh(geo,mats[type]);m.position.set(x,y,z);m.userData.type=type;
   scene.add(m);blocks.push(m);
 }
 for(let x=-12;x<=12;x++)for(let z=-12;z<=12;z++){
   addBlock(x,0,z,'grass'); addBlock(x,-1,z,'dirt');
   if((x*x+z*z)%17===0){addBlock(x,1,z,'dirt');}
 }
 for(const [x,z] of [[-5,-4],[6,-2],[-7,6],[4,7]]){
   for(let y=1;y<=3;y++)addBlock(x,y,z,'wood');
   for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)for(let y=3;y<=4;y++)
     if(Math.abs(dx)+Math.abs(dz)<4)addBlock(x+dx,y,z+dz,'leaves');
 }

 const keys={};
 addEventListener('keydown',e=>keys[e.code]=true);
 addEventListener('keyup',e=>keys[e.code]=false);

 let yaw=0,pitch=0,locked=false;
 renderer.domElement.addEventListener('click',()=>renderer.domElement.requestPointerLock());
 document.addEventListener('pointerlockchange',()=>locked=document.pointerLockElement===renderer.domElement);
 document.addEventListener('mousemove',e=>{if(!locked)return;yaw-=e.movementX*.002;pitch-=e.movementY*.002;pitch=Math.max(-1.45,Math.min(1.45,pitch));});

 const ray=new THREE.Raycaster();
 function target(){
   ray.setFromCamera(new THREE.Vector2(0,0),camera);
   return ray.intersectObjects(blocks)[0];
 }
 function removeBlock(){const h=target();if(h){scene.remove(h.object);blocks.splice(blocks.indexOf(h.object),1)}}
 function placeBlock(){const h=target();if(!h)return;const p=h.point.clone().add(h.face);const q=new THREE.Vector3(Math.round(p.x),Math.round(p.y),Math.round(p.z));if(!blocks.some(b=>b.position.equals(q)))addBlock(q.x,q.y,q.z,'grass')}
 renderer.domElement.addEventListener('mousedown',e=>{if(e.button===0)removeBlock();if(e.button===2)placeBlock()});
 renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
 document.getElementById('break').onclick=removeBlock;
 document.getElementById('place').onclick=placeBlock;

 // Simple mobile touch look
 let touch=null;
 renderer.domElement.addEventListener('touchstart',e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY}});
 renderer.domElement.addEventListener('touchmove',e=>{if(!touch)return;const t=e.touches[0];yaw-=(t.clientX-touch.x)*.008;pitch-=(t.clientY-touch.y)*.008;pitch=Math.max(-1.45,Math.min(1.45,pitch));touch={x:t.clientX,y:t.clientY}});
 renderer.domElement.addEventListener('touchend',()=>touch=null);

 function animate(){
   requestAnimationFrame(animate);
   const speed=.08; const dir=new THREE.Vector3();
   if(keys.KeyW)dir.z-=1;if(keys.KeyS)dir.z+=1;if(keys.KeyA)dir.x-=1;if(keys.KeyD)dir.x+=1;
   dir.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw); camera.position.addScaledVector(dir,speed);
   camera.position.y=3;
   camera.rotation.order='YXZ';camera.rotation.y=yaw;camera.rotation.x=pitch;
   renderer.render(scene,camera);
 }
 animate();
 addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
}