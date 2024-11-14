import * as THREE from 'three';
import Bruin from './Bruin.js';
import Pipe from './Pipe.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1); 
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

const bruin = new Bruin();
scene.add(bruin.mesh);

let pipes = [];
let pipeSpawnInterval = 250;
let frameCount = 0;

function spawnPipe() {
    const lastPipe = pipes[pipes.length - 1];
    const pipeSpacing = 5; 
    const gapHeight = 2 + Math.random() * 2;
    const gapYPosition = (Math.random() - 0.5) * 3;
    const xPosition = lastPipe ? lastPipe.pipes[0].position.x + pipeSpacing : camera.position.x + 10;

    const pipe = new Pipe(xPosition, gapHeight, gapYPosition);
    pipe.pipes.forEach(p => scene.add(p));
    pipes.push(pipe);
}

window.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowUp' || event.code === 'Space') {
        if (!bruin.gameStarted) {
            bruin.startGame();
        }
        bruin.jump();
    }
});

window.addEventListener('mousedown', (event) => {
    if (event.button === 0) { 
        if (!bruin.gameStarted) {
            bruin.startGame();
        }
        bruin.jump();
    }
});

function displayGameOver() {
    const gameOverText = document.createElement('div');
    gameOverText.style.position = 'absolute';
    gameOverText.style.top = '50%';
    gameOverText.style.left = '50%';
    gameOverText.style.transform = 'translate(-50%, -50%)';
    gameOverText.style.color = 'red';
    gameOverText.style.fontSize = '2em';
    gameOverText.style.fontFamily = 'Arial, sans-serif';
    gameOverText.innerHTML = 'Game Over';
    document.body.appendChild(gameOverText);
}

function checkCollision() {
    for (let pipe of pipes) {
        // Check if object hits boxes
        if (bruin.boundingBox.intersectsBox(pipe.boundingBoxTop) || bruin.boundingBox.intersectsBox(pipe.boundingBoxBottom)) {
            bruin.gameOver = true;
            break;
        }
    }
}

function spawnInitialPipes() {
    const initialPipeCount = 5; 
    const pipeSpacing = 5; // distance between each pipe 

    for (let i = 0; i < initialPipeCount; i++) {
        const gapHeight = 2 + Math.random() * 2;
        const gapYPosition = (Math.random() - 0.5) * 3;
        const xPosition = camera.position.x + 6 + i * pipeSpacing;

        const pipe = new Pipe(xPosition, gapHeight, gapYPosition);
        pipe.pipes.forEach(p => scene.add(p));
        pipes.push(pipe);
    }
}

spawnInitialPipes();

function animate() {
    if (bruin.gameOver) {
        displayGameOver();
        return;
    }

    requestAnimationFrame(animate);

    bruin.update();

    if (bruin.gameStarted) {
        // Spawn the first pipe immediately, then follow the regular interval
        if (frameCount === 0 || frameCount % pipeSpawnInterval === 0) {
            spawnPipe();
        }

        pipes.forEach(pipe => pipe.update(0.03));
        pipes = pipes.filter(pipe => {
            const isOnScreen = pipe.pipes[0].position.x > -5;
            if (!isOnScreen) {
                pipe.pipes.forEach(p => scene.remove(p)); // Remove pipes off-screen to the left
            }
            return isOnScreen;
        });

        checkCollision();

        camera.position.x += (bruin.mesh.position.x + 2 - camera.position.x) * 0.03;
    } else {
        camera.position.x = bruin.mesh.position.x - 1;
    }

    renderer.render(scene, camera);
    frameCount++;
}


animate();
