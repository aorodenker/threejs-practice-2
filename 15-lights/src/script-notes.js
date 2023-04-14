import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import * as dat from 'lil-gui';

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.3);
const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3);
const pointLight = new THREE.PointLight(0xff9000, 1, 3);
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 5, 3, 1);
const spotLight = new THREE.SpotLight(0x78ff00, 0.5, 6, Math.PI * 0.05, 0.25, 1);

scene.add(spotLight.target);
spotLight.target.position.x = -0.75;

spotLight.position.set(0, 2, 3);
rectAreaLight.position.set(1, -0.5, 1);
rectAreaLight.lookAt(new THREE.Vector3());

directionalLight.position.set(1, 0.25, 0);
pointLight.position.set(1, -0.5, 1);

scene.add(spotLight);
scene.add(pointLight);
scene.add(ambientLight);
scene.add(rectAreaLight);
scene.add(hemisphereLight);
scene.add(directionalLight);

// Light Helpers
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2);
scene.add(hemisphereLightHelper);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2);
scene.add(directionalLightHelper);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
scene.add(pointLightHelper);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
scene.add(rectAreaLightHelper);

// Material
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
);

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
);

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
);

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
);

sphere.position.x = - 1.5;

torus.position.x = 1.5;

plane.rotation.x = - Math.PI * 0.5;
plane.position.y = - 0.65;

scene.add(sphere, cube, torus, plane);

// GUI Tweaks
// gui.add(object: var, property: string).min(num).max(num).step(num)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001);
gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001);
gui.add(spotLight, 'angle').min(0).max(1).step(0.001);
gui.add(spotLight.target.position, 'x').min(-10).max(10).step(0.25);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

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

// Animate
const clock = new THREE.Clock();

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

    sphere.rotation.y = 0.1 * elapsedTime;
    cube.rotation.y = 0.1 * elapsedTime;
    torus.rotation.y = 0.1 * elapsedTime;

    sphere.rotation.x = 0.15 * elapsedTime;
    cube.rotation.x = 0.15 * elapsedTime;
    torus.rotation.x = 0.15 * elapsedTime;

    controls.update();

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
};

tick();


/* ----- BAKING ----- */
//* reduces light performance impact
//* 'bake' light into the texture with 3D software
//* drawback: can't move light anymore and increases texture load size

/* ----- LIGHTS ----- */
//* Lights have high performance impact, try to use as few as possible, and cheap ones
//* Cheap: AmbientLight, HemisphereLight
//* Middle: DirectionalLight, PointLight
//* Expensive: SpotLight, RectAreaLight

//* adjusting near and far properties to remain in scene will improve precision

//? AmbientLight - omnidirectional light, no shadows, uniform regardless of object shapes
//? good for simulating light bouncing when combined with other light sources
//* can set properties in-line or after using dot notation
//* THREE.AmbientLight(color, intensity)
//* - OR -
// const ambientLight = new THREE.AmbientLight();
// ambientLight.color = new THREE.Color(0xffffff);
// ambientLight.intensity = 0.5;
// scene.add(ambientLight);

//? DirectionalLight - comes from same direction, parallel source from light position center
//const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.3);
//* adjust light position
//* directionalLight.position.set(x, y, z)
// directionalLight.position.set(1, 0.25, 0);
// scene.add(directionalLight);

//? HemisphereLight - similar to ambient but with sky and ground having different colors
//? different color from top and bottom
//* HemisphereLight(topColor: color, bottomColor: color, intensity: num)
// const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3);
// scene.add(hemisphereLight);

//? PointLight - realistic light source, starts small at position and spreads evenly in every direction
//? same light strength regardless of distance, modified using 'decay'
//* PointLight(color: color, intensity: num, decay: num)
// const pointLight = new THREE.PointLight(0xff9000, 1, 3);
// pointLight.position.set(1, -0.5, 1);
// scene.add(pointLight);

//? RectAreaLight - mix between directional and diffuse, similar to big rectangle lights seen on photoshoots
//? ONLY works with MeshStandardMaterial and MeshPhysicalMaterial, can't generate shadows
//* RectAreaLight(color: color, intensity: num, width: num, height: num)
// const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 5, 3, 1);
//* change position of light source
//* make light look at a coordinate, must be done AFTER position
// rectAreaLight.position.set(1, -0.5, 1);
//* lookAt(vector3), THREE.Vector3() without params defaults to (0, 0, 0)
// rectAreaLight.lookAt(new THREE.Vector3());
// scene.add(rectAreaLight);

//? SpotLight - cone, starting at point oriented in a direction (ex: flashlight)
//* SpotLight(color: color, intensity: num, distance: num, angle: num, penumbra: num, decay: num)
//* distance - fade distance, in tandem with decay
//* angle - source size, Math.PI keeps circular source
//* penumbra - sharpness of edge of light, 0 = sharpest
//* decay - fade distance, in tandem with distance
// const spotLight = new THREE.SpotLight(0x78ff00, 0.5, 6, Math.PI * 0.05, 0.25, 1);
//* to rotate SpotLight, must add target property to scene
//* then move SpotLight.target to move light instead of SpotLight itself
// scene.add(spotLight.target);
// spotLight.target.position.x = -0.75;
// spotLight.position.set(0, 2, 3);
// scene.add(spotLight);


/* ----- LIGHT HELPERS ----- */
//* provides visual aid for adjusting lights

//? HemisphereLightHelper
//* HemisphereLightHelper(targetLight: var, size: num)
// const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2);
// scene.add(hemisphereLightHelper);

//? DirectionalLightHelper
//* DirectionalLightHelper(targetLight: var, size: num)
// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2);
// scene.add(directionalLightHelper);

//? PointLightHelper
//* PointLightHelper(targetLight: var, size: num)
// const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
// scene.add(pointLightHelper);

//? RectAreaLightHelper
//* RectAreaLightHelper(targetLight: var, size: num)
//* must import to use, not imported by default
// import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
//* and is not a THREE class:
// const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
// scene.add(rectAreaLightHelper);

//? SpotLightHelper
//* SpotLightHelper(targetLight: var)
// const spotLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(spotLightHelper);

//? CameraHelper - mostly for shadow help
//* view light's shadow camera: light.shadow.camera
// console.log(directionalLight.shadow.camera);
//* camera helper
// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(directionalLightCameraHelper);