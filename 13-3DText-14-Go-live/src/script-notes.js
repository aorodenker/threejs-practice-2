import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import * as dat from 'lil-gui';

//* THREE.TextBufferGeometry() - 3d fonts, requires font format called typeface
//* 1) convert fonts to typeface: https://gero3.github.io/facetype.js/
//* -OR-
//* use three.js fonts: /node_modules/three/examples/fonts
//* 2) put fonts in static dir
//* -OR-
//* import directly: import typefaceFont from 'three/examples/fonts/<font-name>.typeface.json'

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Axes helper
// const axesHelper = new THREE.AxesHelper();
// scene.add(axesHelper);

// Textures
const textureLoader = new THREE.TextureLoader();

const matcapTexture = textureLoader.load('/textures/matcaps/8.png');

// Fonts
//* as with TextureLoader(), a single FontLoader() can be reused to load multiple fonts
const fontLoader = new FontLoader()

//* FontLoader() requires a callback function to use loaded font
fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (fontOne) => {
        //* TextGeometry(text: string, properties: object)
        //* properties object: { font: var(loaded font to use), size: num, height: num, curveSegments(triangles in letter),
        //* bevelEnabled: boolean, bevelThickness: num, bevelSize: num, bevelOffset: num, bevelSegments: num }
        //* bevel = rounded edges
        const textGeometry = new TextGeometry(
            'Andrew Orodenker',
            {
                font: fontOne,
                size: 0.5,
                height: 0.2,
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4
            }
        );
        //* centering text using bounding
        //* bounding: tells you what space is being taken by that geometry, can be a box or sphere(default)
        //* helps three.js calculate if object is on screen (frustum culling)
        //* computeBoundingBox() - calculate box bounding to be able to access textGeometry.boundingBox
        //* returns instance of Box3 with min and max properties
        //* min isn't at 0 because of bevelThickness and bevelSize
        // textGeometry.computeBoundingBox();
        // console.log(textGeometry.boundingBox);
        //* move geometry instead of mesh, so correct rotation stays

        // textGeometry.translate(
            //* calculate center (hard way)
        //     - (textGeometry.boundingBox.max.x - 0.02) / 2,
        //     - (textGeometry.boundingBox.max.y - 0.02) / 2,
        //     - (textGeometry.boundingBox.max.z - 0.03) / 2
        // );

        //* center (easy way)
        textGeometry.center();

        const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
        const text = new THREE.Mesh(textGeometry, material);
        scene.add(text);

        //* create 100 donuts
        //* create geometry and material OUTSIDE of loop for optimization
        const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);
        for (let i = 0; i < 101; i++) {
            const donut = new THREE.Mesh(donutGeometry, material);

            //* randomize position
            //* math: Math.random() random num between 0-1 -> subtract 0.5 so half num are negative -> multiplier for distance
            donut.position.x = (Math.random() - 0.5) * 10;
            donut.position.y = (Math.random() - 0.5) * 10;
            donut.position.z = (Math.random() - 0.5) * 10;

            //* randomize rotation
            //* only need to rotate two axis, third unnecessary
            //* multiply Math.random() by Math.PI for half rotation
            //* full rotation unnecessary for objects that look the same top and bottom
            donut.rotation.x = Math.random() * Math.PI;
            donut.rotation.y = Math.random() * Math.PI;

            //* randomize size/scale
            //* to maintain shape, create one random num to use for all 3 axis
            const scale = Math.random();
            donut.scale.set(scale, scale, scale);

            scene.add(donut);
        }
    }
);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

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

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();