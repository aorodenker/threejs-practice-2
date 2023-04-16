import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';

/* ----- PARTICLES ----- */
//* useful for: stars, smoke, rain, dust, fire, etc.
//* composed of a plane (two triangles) always facing the camera
//* can have thousands with reasonable framerate

//* to create, is similar to creating a THREE.Mesh()
//* requires geometry(BufferGeometry), material(PointsMaterial), a 'Points' instance (instead of Mesh)

//? resource: https://www.kenney.nl/assets/particle-pack/

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Textures
const textureLoader = new THREE.TextureLoader();

const particleTexture = textureLoader.load('/textures/particles/2.png');

// Particles
//* Geometry
//* custom buffer
const particlesGeometry = new THREE.BufferGeometry();
//* count for number of particles
const count = 5000;

//* float 32 array with length of number of particles times 3
//* times 3 to group by 3 and use for particle x,y,z
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

//* fill array with random values
//* -0.5 for equal distance left and right, up and down
//* multiply by 5 for more particle distance
for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 5;
    colors[i] = Math.random();
};

//* set position attribute on geometry with value of float32array and num to increment by (3)
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

//* Material
//* THREE.PointsMaterial(params:object)
const particlesMaterial = new THREE.PointsMaterial();
//* size - size of points in pixels
//* sizeAttenuation - specify whether points size is affected by camera depth (close big, far small)
particlesMaterial.size = 0.1;
particlesMaterial.sizeAttenuation = true;

//* to fix textures blocking things behind them, switch from material.map to material.alphaMap
particlesMaterial.transparent = true;
particlesMaterial.alphaMap = particleTexture;

//* particles drawn in same order as created, webgl doesn't know which ones are in front or behind
//* possible solutions:
//* 1) alphaTest tells webgl not to render particles
// particlesMaterial.alphaTest = 0.001;
//* 2) turn off depthTest so webgl draws everything regardless of if it's in front or behind
//* can create bugs with other objects
// particlesMaterial.depthTest = false;
//* 3) turn off depthWrite to tell webgl not to draw particles in that depth buffer
// particlesMaterial.depthWrite = false;
//* 4) material blending - adds color of pixel behind to color of pixel in front
//* impacts performance
particlesMaterial.depthWrite = false;
particlesMaterial.blending = THREE.AdditiveBlending;

//* turn on vertexColors to use buffer array for random colors
particlesMaterial.vertexColors = true;

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

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
camera.position.z = 3;
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

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    //* Poor performance particle animation, updates whole attribute on each frame
    //* better to use custom shaders (learn later)
    //* loop over every 3 indices (x,y,z), i represents x, i+1 = y, i+2 = z
    for (let i = 0; i < count * 3; i+=3) {
        //* store current particle x to offset next x by that value
        const x = particlesGeometry.attributes.position.array[i];
        particlesGeometry.attributes.position.array[i+1] = Math.sin(elapsedTime + x);
    };

    particlesGeometry.attributes.position.needsUpdate = true;

    controls.update();

    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
};

tick();