import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
const gui = new dat.GUI();

// Textures
const textureLoader = new THREE.TextureLoader();

//* to load cube texture, must use THREE.CubeTextureLoader() NOT THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader();

const doorColorTexture = textureLoader.load('/textures/door/color.jpg');
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg');
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg');
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg');
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg');
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg');
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg');
const matcapTexture = textureLoader.load('./textures/matcaps/3.png');
const gradientTexture = textureLoader.load('./textures/gradients/5.jpg');


//* for High Dynamic Range Images (HDRI): https://polyhaven.com/
//* 1) download image as .hdr
//* 2) upload to https://matheowis.github.io/HDRI-to-CubeMap/
//* 3) change orientation to desired result
//* 4) save -> choose separate images option (bottom one) -> process -> save
//* 5) extract -> move to project
//* search the internet for environment maps if not making your own
//* THREE.CubeTextureLoader requires an array of 6 images, one for each side of the cube
//* specific order: pos-x(right), neg-x(left), pos-y(up), neg-y(down), pos-z(front), neg-z(back)
const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/testMap/px.png',
    '/textures/environmentMaps/testMap/nx.png',
    '/textures/environmentMaps/testMap/py.png',
    '/textures/environmentMaps/testMap/ny.png',
    '/textures/environmentMaps/testMap/pz.png',
    '/textures/environmentMaps/testMap/nz.png',
]);

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Objects
// const material = new THREE.MeshStandardMaterial();
// material.metalness = 0;
// material.roughness = 1;
// material.metalnessMap = doorMetalnessTexture;
// material.roughnessMap = doorRoughnessTexture;
// material.map = doorColorTexture;
// material.aoMap = doorAmbientOcclusionTexture;
// material.aoMapIntensity = 1;
// material.displacementMap = doorHeightTexture;
// material.displacementScale = 0.05;
// material.normalMap = doorNormalTexture;
// material.normalScale.set(0.5, 0.5);
// material.alphaMap = doorAlphaTexture;
// material.transparent = true;

//* Environment Map - image of what is surrounding the scene, three.js only supports cube shaped maps
//* can be used for reflection/refraction but also for general lighting
//* supported by multiple materials, using MeshStandardMaterial here
const material = new THREE.MeshStandardMaterial();
material.metalness = 1;
material.roughness = 0;
//* envMap applies texture as environment
material.envMap = environmentMapTexture;

gui.add(material, 'metalness').min(0).max(1).step(0.0001);
gui.add(material, 'roughness').min(0).max(1).step(0.0001);
// gui.add(material, 'aoMapIntensity').min(0).max(10).step(0.0001);
// gui.add(material, 'displacementScale').min(0).max(1).step(0.0001);



const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), material);
const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 100, 100), material);
const torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 64, 128), material);

plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2));
sphere.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2));
torus.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2));

sphere.position.x = -1.5;
torus.position.x = 1.5;

scene.add(sphere, plane, torus);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;

scene.add(pointLight);

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

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime;
    plane.rotation.y = 0.1 * elapsedTime;
    torus.rotation.y = 0.1 * elapsedTime;

    sphere.rotation.x = 0.15 * elapsedTime;
    plane.rotation.x = 0.15 * elapsedTime;
    torus.rotation.x = 0.15 * elapsedTime;

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();


/* ----- MATERIALS NOTES ----- */
//* re-use material as often as possible for shared properties - performance improvement
//? MeshBasicMaterial - most basic, map applies texture on surface of geometry
// const material = new THREE.MeshBasicMaterial();
// material.map = doorColorTexture;
// material.transparent = true;
// material.alphaMap = doorAlphaTexture;
//* side lets you decide which side of a face is visible
//* THREE.FrontSide (default), THREE.BackSide, THREE.DoubleSide - shows front and back but poor performance
// material.side = THREE.DoubleSide

//* Assign material properties through dot notation
// material.map = doorColorTexture;
//* Color works differently because it is a class
// material.color.set('red');
//* -OR-
// material.color = new THREE.Color('red');

//* Assign material in params as an object
// const material = new THREE.MeshBasicMaterial({
//     map: doorColorTexture,
//     color: 'red',
//     wireframe: true,
// });

//? MeshNormalMaterial - display color for 'normal' texture (direction of the outside of the face)
//? normals can be used for lighting, reflection, refraction, etc. Useful for debugging normals
// const material = new THREE.MeshNormalMaterial();
//* flatShading is unique to THREE.MeshNormalMaterial()
// material.flatShading = true;

//? MeshMatcapMaterial - adjusts color on texture that looks like a sphere without light source - based on normals
//? great matcap source: https://github.com/nidorx/matcaps/
// const material = new THREE.MeshMatcapMaterial();
// material.matcap = matcapTexture;

//? MeshDepthMaterial - shows distance through white(near) and black(far) gradient
//? useful for many things: fog, preprocessing, etc
// const material = new THREE.MeshDepthMaterial();

//? MeshLambertMaterial - requires/reacts to light, great framerate but can show strange patterns on geometry
// const material = new THREE.MeshLambertMaterial();

//? MeshPhongMaterial - similar to MeshLambertMaterial() but shows light reflection
//? worse framerate but better looking, has unique properties
// const material = new THREE.MeshPhongMaterial();
//* shininess adjusts light reflection strength
// material.shininess = 100;
//* specular adjusts color of light reflection
// material.specular = new THREE.Color(0xff0000);

//? MeshToonMaterial - similar to MeshPhongMaterial but cartoonish
// const material = new THREE.MeshToonMaterial();
//* add gradient, removes cartoonish look because gradient is small and magFilter tries to fix it with minmapping
//* adjust cartoonish look with minFilter and magFilter
// gradientTexture.minFilter = THREE.NearestFilter;
// gradientTexture.magFilter = THREE.NearestFilter;
//* when using THREE.NearestFilter, don't forget to turn off generateMipmaps for performance
// gradientTexture.generateMipmaps = false;
// material.gradientMap = gradientTexture;

//? MeshStandardMaterial - uses physically based rendering principles (PBR)
//? supports lights with a more realistic algorithm and better params like roughness and metalness
// const material = new THREE.MeshStandardMaterial();
//* material.metalness and material.metalnessMap should not be combined, they affect each other
// material.metalness = 0;
// material.roughness = 1;
// material.metalnessMap = doorMetalnessTexture;
// material.roughnessMap = doorRoughnessTexture;
// material.map = doorColorTexture;
//* aoMap = ambient occlusion map property, adds shadows where texture is dark
//* BUT requires second set of UV coordinates named uv2
//* in this case, default UV is the same as what we need, so we can re-use
// material.aoMap = doorAmbientOcclusionTexture;
//* adjust aoMap black shading intensity
// material.aoMapIntensity = 1;
//* displacementMap moves vertices to create relief (height = displacement)
//* will look bad if lacking vertices
// material.displacementMap = doorHeightTexture;
//* adjust displacementScale based on height map (white goes up, black goes down)
// material.displacementScale = 0.05;
//* normalMap adds even more texture
// material.normalMap = doorNormalTexture;
//* use normalScale to adjust intensity of normalMap
// material.normalScale.set(0.5, 0.5);
//* alphaMap controls opacity across surface (white = opaque, black = transparent)
//* requires transparent = true
// material.alphaMap = doorAlphaTexture;
// material.transparent = true;

//* add sliders to debugging gui to fine tune
// gui.add(material, 'metalness').min(0).max(1).step(0.0001);
// gui.add(material, 'roughness').min(0).max(1).step(0.0001);
// gui.add(material, 'aoMapIntensity').min(0).max(10).step(0.0001);
// gui.add(material, 'displacementScale').min(0).max(1).step(0.0001);

//? MeshPhysicalMaterial - same as MeshStandardMaterial but with support of a clear coat effect
//? useful for specific objects, but poor performance
// const material = new THREE.MeshPhysicalMaterial();

//? PointsMaterial - for particles

//? RawShaderMaterial & ShaderMaterial - both can be used to create your own materials