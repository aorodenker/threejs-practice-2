import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';

// Debug
const gui = new dat.GUI();

// Textures
const textureLoader = new THREE.TextureLoader();
const simpleShadow = textureLoader.load('/textures/simpleShadow.jpg');
const bakedShadow = textureLoader.load('/textures/bakedShadow.jpg');

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
const spotLight = new THREE.SpotLight(0xffffff, 0.4, 10, Math.PI * 0.3);
const pointLight = new THREE.PointLight(0xffffff, 0.3);

pointLight.castShadow = false;
pointLight.position.set(-1, 1, 0);
pointLight.shadow.mapSize.x = 1024;
pointLight.shadow.mapSize.y = 1024;
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 5;

spotLight.castShadow = false;
spotLight.position.set(0, 2, 2);
scene.add(spotLight.target);
spotLight.shadow.mapSize.x = 1024;
spotLight.shadow.mapSize.y = 1024;
spotLight.shadow.camera.fov = 30;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 5;

directionalLight.castShadow = false;
directionalLight.position.set(2, 2, - 1);
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.left = -2;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;
directionalLight.shadow.radius = 10;

directionalLight.shadow.mapSize.x = 1024;
directionalLight.shadow.mapSize.y = 1024;

const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);
pointLightCameraHelper.visible = false;
scene.add(pointLightCameraHelper);

const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
spotLightCameraHelper.visible = false;
scene.add(spotLightCameraHelper);

const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
directionalLightCameraHelper.visible = false;
scene.add(directionalLightCameraHelper);

scene.add(spotLight, ambientLight, directionalLight, pointLight);

// Materials
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.7;

// Objects
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
const sphereShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        alphaMap: simpleShadow
    })
);

sphere.castShadow = true;
plane.receiveShadow = true;

plane.rotation.x = - Math.PI * 0.5;
plane.position.y = - 0.5;

sphereShadow.rotation.x = - Math.PI / 2;
sphereShadow.position.y = plane.position.y + 0.01;

scene.add(sphere, plane, sphereShadow);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// GUI
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001);
gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001);
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001);
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001);
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001);
gui.add(material, 'metalness').min(0).max(1).step(0.001);
gui.add(material, 'roughness').min(0).max(1).step(0.001);

window.addEventListener('resize', () =>
{
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
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
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

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Animate
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    sphere.position.x = Math.cos(elapsedTime) * 1.5;
    sphere.position.z = Math.sin(elapsedTime) * 1.5;
    //* make sphere bounce
    sphere.position.y = Math.abs(Math.sin(elapsedTime * 3));
    //* update sphereShadow to follow sphere
    sphereShadow.position.x = sphere.position.x;
    sphereShadow.position.z = sphere.position.z;
    //* change opacity to simulate accurate shadow
    sphereShadow.material.opacity = (1 - sphere.position.y) * 0.3

    controls.update();

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
};

tick();


/* ----- SHADOWS ----- */
//* poor performance and frame rate in real-time 3D. 3js has built-in solution
//* when you do one render, 3js will do a render for each light supporting shadows
//* these new renders simulate what light sees as if it was a camera
//* during renders, all meshes are replaced by MeshDepthMaterial
//* renders are stored as textures called shadow maps
//* shadow maps are then used on every material supposed to receive a shadow and projects on the geometry
//* shadow maps are stored in individual light source

//* core shadows - shadows on back of objects, not on surfaces or other objects
//* drop shadows - shadows objects make on surfaces and other objects

//* adjusting near and far properties to remain in scene will improve precision of shadow

//* mixing light source shadows doesn't look good or realistic

//? Shadow Activation
//* MUST enable shadowMap on renderer
// renderer.shadowMap.enabled = true;
//* MUST turn on light.castShadow to allow shadows from that specific light
// directionalLight.castShadow = true;
//* MUST turn on castShadow and receiveShadow for an object to have shadow on another object
//* sphere can cast shadow
// sphere.castShadow = true;
//* plane can receive shadow
// plane.receiveShadow = true;

//? Shadow Manipulation
//* view shadow properties on light source
// console.log(directionalLight.shadow);
//* adjust quality of shadow using light.shadow.mapSize.width/height or x/y
// directionalLight.shadow.mapSize.x = 1024;
// directionalLight.shadow.mapSize.y = 1024;
//* adjust camera near and far for shadow precision and to avoid bugs and shadow cropping
// directionalLight.shadow.camera.near = 1;
// directionalLight.shadow.camera.far = 6;
//* adjust shadow camera size
// directionalLight.shadow.camera.top = 2;
// directionalLight.shadow.camera.right = 2;
// directionalLight.shadow.camera.bottom = -2;
// directionalLight.shadow.camera.left = -2;
//* if using huge scene (city) shadows in streets will look bad, must tweak for best combination
//* control shadow blur using radius property, higher number = more blur
// directionalLight.shadow.radius = 10;

//? Camera Helper / Shadow Helper
//* view light's shadow camera: light.shadow.camera
// console.log(directionalLight.shadow.camera);
//* camera helper
// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(directionalLightCameraHelper);
//* if want to keep CameraHelper but hide lines:
// directionalLightCameraHelper.visible = false;

//? SpotLight shadows
//* create spot light
// const spotLight = new THREE.SpotLight(0xffffff, 0.4, 10, Math.PI * 0.3);
//* turn on shadows from spot light
// spotLight.castShadow = true;
//* adjust spot light position
// spotLight.position.set(0, 2, 2);
//* add spot light target to scene
// scene.add(spotLight.target);
//* adjust shadow map size
// spotLight.shadow.mapSize.x = 1024;
// spotLight.shadow.mapSize.y = 1024;
//* spot light uses perspective camera for shadow mapping
//* adjust fov
// spotLight.shadow.camera.fov = 30;
//* adjust near and far
// spotLight.shadow.camera.near = 1;
// spotLight.shadow.camera.far = 5;

//* create spot light camera helper and add to scene
// const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
//* disable camera helper
// spotLightCameraHelper.visible = false;
// scene.add(spotLightCameraHelper);

//? PointLight shadows
// const pointLight = new THREE.PointLight(0xffffff, 0.3);
// pointLight.castShadow = true;
// pointLight.position.set(-1, 1, 0);
// pointLight.shadow.mapSize.x = 1024;
// pointLight.shadow.mapSize.y = 1024;
// pointLight.shadow.camera.near = 0.1;
// pointLight.shadow.camera.far = 5;

//* create point light camera helper, is perspective camera and creates 6 shadow maps per render
//* last shadow map is down, so helper shows aiming down
// const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);
// pointLightCameraHelper.visible = false;
// scene.add(pointLightCameraHelper);

/* ----- SHADOW MAP ALGORITHM ----- */

//? THREE.BasicShadowMap - performant but low quality
//? THREE.PCFShadowMap - less performant but smoother edges (default)
//? THREE.PCFSoftShadowMap - less performant but even softer edges
//? THREE.VSMShadowMap - less performant but more constraints, can have unexpected results

//* to use a different one, change renderer shadow map type
//* disables custom directionalLight.shadow.radius
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/* ----- BAKED SHADOWS ----- */
//* cant be used for moving objects/shadows

//* 1) turn off camera shadows
// directionalLight.castShadow = false;
//* 2) load textures
// const textureLoader = new THREE.TextureLoader();
// const bakedShadow = textureLoader.load('/textures/bakedShadow.jpg');
//* 3) change material to MeshBasicMaterial and use loaded texture
// const plane = new THREE.Mesh(
//     new THREE.PlaneGeometry(5, 5),
//     new THREE.MeshBasicMaterial({
//         map: bakedShadow
//     })
// );

//* Moving baked shadow to follow below object
//* 1) load texture
// const textureLoader = new THREE.TextureLoader();
// const simpleShadow = textureLoader.load('/textures/simpleShadow.jpg');
//* 2) create plane slightly above floor with alphaMap using the simpleShadow
// const sphereShadow = new THREE.Mesh(
//     new THREE.PlaneGeometry(1.5, 1.5),
//     new THREE.MeshBasicMaterial({
//         color: 0x000000,
//         transparent: true,
//         alphaMap: simpleShadow
//     })
// );
//* orient flat, position y 0.01 above floor to prevent zed fighting
// sphereShadow.rotation.x = - Math.PI / 2;
// sphereShadow.position.y = plane.position.y + 0.01;
// scene.add(sphereShadow);
//* 3) animate sphere and adjust sphereShadow to match
// const tick = () => {
//     const elapsedTime = clock.getElapsedTime();

//     sphere.position.x = Math.cos(elapsedTime) * 1.5;
//     sphere.position.z = Math.sin(elapsedTime) * 1.5;
//     //* make sphere bounce
//     sphere.position.y = Math.abs(Math.sin(elapsedTime * 3));
//     //* update sphereShadow to follow sphere
//     sphereShadow.position.x = sphere.position.x;
//     sphereShadow.position.z = sphere.position.z;
//     //* change opacity to simulate accurate shadow
//     sphereShadow.material.opacity = (1 - sphere.position.y) * 0.3

//     controls.update();

//     renderer.render(scene, camera);

//     window.requestAnimationFrame(tick);
// };