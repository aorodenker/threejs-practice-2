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
    sphere.position.y = Math.abs(Math.sin(elapsedTime * 3));
    
    sphereShadow.position.x = sphere.position.x;
    sphereShadow.position.z = sphere.position.z;
    sphereShadow.material.opacity = (1 - sphere.position.y) * 0.3

    controls.update();

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
};

tick();