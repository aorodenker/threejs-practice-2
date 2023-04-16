import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';

//* think of 1 unit as 1 meter, for consistency

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Fog
//* THREE.Fog(color, near:num, far:num)
//* near - how far from camera fog starts
//* far - how far from camera fog will be fully opaque
const fog = new THREE.Fog('#262837', 1, 15);
//* to add fog to a scene, use scene.fog = <fog variable>
scene.fog = fog;

// Textures
const textureLoader = new THREE.TextureLoader();

//* door textures
const doorColorTexture = textureLoader.load('/textures/door/color.jpg');
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg');
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg');
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg');
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg');
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg');

//* wall textures
const bricksColorTexture = textureLoader.load('textures/bricks/color.jpg');
const bricksAmbientOcclusionTexture = textureLoader.load('textures/bricks/ambientOcclusion.jpg');
const bricksNormalTexture = textureLoader.load('textures/bricks/normal.jpg');
const bricksRoughnessTexture = textureLoader.load('textures/bricks/roughness.jpg');

//* ground textures
const grassColorTexture = textureLoader.load('textures/grass/color.jpg');
const grassAmbientOcclusionTexture = textureLoader.load('textures/grass/ambientOcclusion.jpg');
const grassNormalTexture = textureLoader.load('textures/grass/normal.jpg');
const grassRoughnessTexture = textureLoader.load('textures/grass/roughness.jpg');

//* manipulate texture repeating values for smaller sections, more detail
//* use texture.repeat.set(x,y)
grassColorTexture.repeat.set(8, 8);
grassAmbientOcclusionTexture.repeat.set(8, 8);
grassNormalTexture.repeat.set(8, 8);
grassRoughnessTexture.repeat.set(8, 8);

//* by default the textures won't repeat, only the last pixel will
//* set texture.wrapT and texture.wrapS to THREE.RepeatWrapping for consistent repeat
grassColorTexture.wrapT = THREE.RepeatWrapping;
grassColorTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;

// Objects
//* use group for house to move as one
const house = new THREE.Group();

//* house parts
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({
        map: bricksColorTexture,
        aoMap: bricksAmbientOcclusionTexture,
        normalMap: bricksNormalTexture,
        roughnessMap: bricksRoughnessTexture
    })
);
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1, 4),
    new THREE.MeshStandardMaterial({ color: '#b35f45' })
);

//* alphaMap requires transparent: true
//* aoMap requires uv2 (see below)
//* displacementMap requires displacementScale manipulation
//* displacementScale manipulates width segments and height segments in PlaneGeometry() params
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
    new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.1,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture
    })
);

//* position walls on ground using wall height / 2
walls.position.y = 2.5 / 2;
//* create uv2 attribute for aoMap, using wall geometry attributes that already exist
walls.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2));

//* position roof on top of walls
//* rotate roof y axis to line up with walls, Math.PI / 4 = quarter rotation
roof.rotation.y = Math.PI / 4;
//* use wall height + half of roof height
roof.position.y = 2.5 + 0.5;

//* create uv2 attribute for aoMap, using door geometry attributes that already exist
door.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2));
//* position door on house
//* position door z axis to wall, using half wall z and add 0.01 for zed fighting
door.position.z = 2 + 0.01;
//* position door y, up half of door height
door.position.y = 1;

//* add parts of house to house group
house.add(walls, roof, door);

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' });

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);

//* varying bush sizes, scaling off of geometry initial size
bush1.scale.set(0.5, 0.5, 0.5);
bush2.scale.set(0.25, 0.25, 0.25);
bush3.scale.set(0.4, 0.4, 0.4);
bush4.scale.set(0.15, 0.15, 0.15);

//* bush positions
bush1.position.set(0.8, 0.2, 2.2);
bush2.position.set(1.4, 0.1, 2.1);
bush3.position.set(-0.8, 0.1, 2.2);
bush4.position.set(-1, 0.05, 2.6);

//* add bushes to scene
scene.add(bush1, bush2, bush3, bush4);

// Graves - procedural generation
//* create graves group
const graves = new THREE.Group();

//* one geometry and material for all graves
const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1' });

//* create 50 graves
for (let i = 0; i < 51; i++) {
    //* create random angle around house
    //* Math.random() * Math.PI * 2 = random number in a circle
    const angle = Math.random() * Math.PI * 2;
    //* using sin and cos on x and y with same angle, you get a position on a circle
    //* by default, circle has radius of 1, so multiply by a num to increase radius
    //* use random multiplier, base distance of 3 + random value from 0-6 = random num between 3 and 9
    const radius = 3 + (Math.random() * 6);
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    const grave = new THREE.Mesh(graveGeometry, graveMaterial);

    //* use random x and z for each grave, half grave height for y
    //* in this case, so graves don't angle above ground, set slightly lower
    grave.position.set(x, 0.3, z);
    //* randomize grave rotation, random num between -0.5 and 0.5 multiplied by intensity of rotation
    grave.rotation.y = (Math.random() - 0.5) * 0.4;
    //* rotate z for tilt
    grave.rotation.z = (Math.random() - 0.5) * 0.4;

    //* allow graves to cast shadows
    grave.castShadow = true;

    graves.add(grave);
};

scene.add(graves);

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
        map: grassColorTexture,
        aoMap: grassAmbientOcclusionTexture,
        normalMap: grassNormalTexture,
        roughnessMap: grassRoughnessTexture
    })
);

floor.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2));
floor.rotation.x = - Math.PI * 0.5;
floor.position.y = 0;

scene.add(floor, house);

// Lights
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12);
const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.12);
const doorLight = new THREE.PointLight('#ff7d46', 1, 7);

//* light positions
moonLight.position.set(4, 5, - 2);
doorLight.position.set(0, 2.2, 2.7);

scene.add(moonLight, ambientLight);
//* add door light to house group
house.add(doorLight);

const ghost1 = new THREE.PointLight('#ff00ff', 2, 3);
const ghost2 = new THREE.PointLight('#00ffff', 2, 3);
const ghost3 = new THREE.PointLight('#ffff00', 2, 3);

scene.add(ghost1, ghost2, ghost3);

// GUI
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001);
gui.add(moonLight.position, 'x').min(- 5).max(5).step(0.001);
gui.add(moonLight.position, 'y').min(- 5).max(5).step(0.001);
gui.add(moonLight.position, 'z').min(- 5).max(5).step(0.001);
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;

scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//* set background color to same as fog using renderer.setClearColor(fog color)
renderer.setClearColor('#262837');

// Shadows
//* activate shadows on renderer
renderer.shadowMap.enabled = true;
//* change shadow map type
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//* activate shadows on lights that should CAST them
moonLight.castShadow = true;
doorLight.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;

//* allow certain objects to CAST shadows
walls.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;
bush3.castShadow = true;
bush4.castShadow = true;

//* allow objects to RECEIVE shadows
floor.receiveShadow = true;

//* optimize shadow maps (usually need to create helpers to find best optimization)
moonLight.shadow.mapSize.width = 256;
moonLight.shadow.mapSize.height = 256;
moonLight.shadow.camera.far = 7;

doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 7;

ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 7;

ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 7;

// Animate
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Ghost Animation
    //* use elapsedTime for 3 varying loops around house
    const ghost1Angle = elapsedTime * 0.5;
    const ghost2Angle = - elapsedTime * 0.32;
    const ghost3Angle = - elapsedTime * 0.18;

    //* cos and sin on x and y with same angle simulates circular looping rotation
    //* sin on y simulates bouncing
    ghost1.position.x = Math.cos(ghost1Angle) * 4;
    ghost1.position.z = Math.sin(ghost1Angle) * 4;
    ghost1.position.y = Math.sin(elapsedTime * 3);

    //* ghost2 y has more randomness than ghost1 y
    ghost2.position.x = Math.cos(ghost2Angle) * 5;
    ghost2.position.z = Math.sin(ghost2Angle) * 5;
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);

    //* ghost3 x and z snake during loop around house
    ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32));
    ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32));
    ghost3.position.y = Math.sin(elapsedTime * 5) + Math.sin(elapsedTime * 2);

    controls.update();

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
};

tick();