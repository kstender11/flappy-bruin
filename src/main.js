import * as THREE from 'three';
import Bruin from './Bruin.js';
import Pipe from './Pipe.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1); // Set background to white
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
    const gapHeight = 2 + Math.random() * 2;
    const gapYPosition = (Math.random() - 0.5) * 3;
    const pipe = new Pipe(6, gapHeight, gapYPosition);
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

function animate() {
    if (bruin.gameOver) {
        displayGameOver();
        return;
    }

    requestAnimationFrame(animate);

    bruin.update();

    if (bruin.gameStarted) {
        if (frameCount % pipeSpawnInterval === 0) {
            spawnPipe();
        }
        pipes.forEach(pipe => pipe.update(0.03));
        pipes = pipes.filter(pipe => pipe.pipes[0].position.x > -5);

        checkCollision();
        camera.position.x = bruin.mesh.position.x + 2;
    }

    renderer.render(scene, camera);
    frameCount++;
}

animate();
