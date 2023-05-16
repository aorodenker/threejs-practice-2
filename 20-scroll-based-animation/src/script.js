import * as THREE from 'three';
import * as dat from 'lil-gui';
import gsap from 'gsap';

const gui = new dat.GUI();

const parameters = {
    materialColor: '#ffeded'
};

gui.addColor(parameters, 'materialColor').onChange(() => {
    material.color.set(parameters.materialColor)
    particlesMaterial.color.set(parameters.materialColor);
});

const textureLoader = new THREE.TextureLoader();

const gradientTexture = textureLoader.load('textures/gradients/3.jpg');
gradientTexture.magFilter = THREE.NearestFilter;

const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();

const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture
});

const objectsDistance = 4;

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
);
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
);
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
);

mesh1.position.y = - objectsDistance * 0;
mesh2.position.y = - objectsDistance * 1;
mesh3.position.y = - objectsDistance * 2;

mesh1.position.x = 2;
mesh2.position.x = - 2;
mesh3.position.x = 2;

scene.add(mesh1, mesh2, mesh3);

const sectionMeshes = [mesh1, mesh2, mesh3];

const particleCount = 200;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * 10;
    positions[i3+1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length;
    positions[i3+2] = (Math.random() - 0.5) * 10;
};

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particlesMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

const directionalLight = new THREE.DirectionalLight('#ffffff', 1);
directionalLight.position.set(1, 1, 0);

scene.add(directionalLight);

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

const cameraGroup = new THREE.Group();
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 6;
cameraGroup.add(camera);
scene.add(cameraGroup);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    const newSection = Math.round(scrollY / sizes.height);

    if (currentSection != newSection) {

        currentSection = newSection;

        gsap.to(sectionMeshes[currentSection].rotation, {
            duration: 1.5,
            ease: 'power2.inOut',
            x: '+=6',
            y: '+=3',
            z: '+=1.5'
        });
    };
});

const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - 0.5;
    cursor.y = e.clientY / sizes.height - 0.5;
});

const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    camera.position.y = - scrollY / sizes.height * objectsDistance;

    const parallaxX = cursor.x * 0.5;
    const parallaxY = - cursor.y * 0.5;

    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * deltaTime * 5;
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * deltaTime * 5;

    for (const mesh of sectionMeshes) {
        mesh.rotation.x += deltaTime * 0.1;
        mesh.rotation.y += deltaTime * 0.12;
    };

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();