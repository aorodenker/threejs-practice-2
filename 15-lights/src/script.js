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
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2);
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);

scene.add(hemisphereLightHelper);
scene.add(directionalLightHelper);
scene.add(pointLightHelper);
scene.add(spotLightHelper);
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

// GUI
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