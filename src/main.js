import * as THREE from 'three';
import Bruin from './bruin.js';
import Pipe from './Pipe.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

const textureLoader = new THREE.TextureLoader();
textureLoader.load('./src/textures/clouds.jpg', (cloudTexture) => {
    const skyGeometry = new THREE.PlaneGeometry(100, 60);
    const skyMaterial = new THREE.MeshBasicMaterial({
        map: cloudTexture,
        side: THREE.DoubleSide // Ensures the texture is visible from both sides
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    
    // Position the sky far back in the scene
    sky.position.set(0, 0, -20);  // Adjust depth as needed to fit your camera view
    scene.add(sky);
});
// Set up the Bruin character
const bruin = new Bruin();
scene.add(bruin.mesh);

// Array to store pipes and other variables
let pipes = [];
let pipeSpawnInterval = 250;
let frameCount = 0;
let score = 0;

// Create the score display if it doesn't already exist
let scoreDisplay = document.getElementById('score');
if (!scoreDisplay) {
    scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'score';
    scoreDisplay.innerText = 'Score: 0';
    document.body.appendChild(scoreDisplay);

    // Add CSS styles for the score display
    const style = document.createElement('style');
    style.textContent = `
        /* Keyframes for rotating UCLA gradient and pulsing on score change */
        @keyframes gradient-rotate {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }

        #score {
            position: absolute;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #2774AE, #FFD100);
            background-size: 300% 300%;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 1.8em;
            font-family: 'Arial', sans-serif;
            font-weight: bold;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
            text-align: center;
            transition: transform 0.2s;
            animation: gradient-rotate 5s linear infinite;
        }

        /* Apply pulse animation on hover or score update */
        #score.pulse {
            animation: pulse 0.3s;
        }
    `;
    document.head.appendChild(style);
}

// Function to add a pulsing effect when score updates
function updateScoreDisplay(newScore) {
    scoreDisplay.innerText = `Score: ${newScore}`;
    scoreDisplay.classList.add('pulse');  // Add the pulse class for animation
    setTimeout(() => scoreDisplay.classList.remove('pulse'), 300);  // Remove after animation
}

// Function to spawn pipes at intervals
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

// Handle user input for jumping
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

// Display "Game Over" message
// Display "Game Over" message and show the Restart button
function displayGameOver() {
    const gameOverContainer = document.createElement('div');
    gameOverContainer.id = 'gameOverContainer';
    
    const gameOverText = document.createElement('div');
    gameOverText.id = 'gameOver';
    gameOverText.innerText = 'Game Over';
    
    gameOverContainer.appendChild(gameOverText);
    document.body.appendChild(gameOverContainer);

    // Create the Restart button
    const restartButton = document.createElement('button');
    restartButton.id = 'restartButton';
    restartButton.innerText = 'Restart';
    gameOverContainer.appendChild(restartButton);

    // Event listener for restarting the game
    restartButton.addEventListener('click', () => {
        window.location.reload(); // Reload the page to restart the game
    });

    // CSS for the Game Over message, Restart button, and container
    const style = document.createElement('style');
    style.textContent = `
    /* Centering container */
    #gameOverContainer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
        z-index: 10;
    }

    /* Style for the Game Over message */
    #gameOver {
        color: #FFCC00; /* Gold color */
        font-size: 3em;
        font-family: 'Arial', sans-serif;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7); /* Add text shadow for visibility */
    }

    /* Style for the Restart button */
    #restartButton {
        background: linear-gradient(135deg, #FFCC00, #990000); /* Gold to Cardinal Red */
        color: #ffffff;
        padding: 15px 30px;
        border: none;
        border-radius: 12px;
        font-size: 1.5em;
        font-family: 'Arial', sans-serif;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.3s ease, transform 0.2s;
    }

    #restartButton:hover {
        background: linear-gradient(135deg, #990000, #FFCC00); /* Reverse the gradient */
        transform: scale(1.05); /* Slightly enlarge on hover */
    }
`;

    document.head.appendChild(style);
}


// Check for collisions between Bruin and pipes
function checkCollision() {
    for (let pipe of pipes) {
        if (bruin.boundingBox.intersectsBox(pipe.boundingBoxTop) || bruin.boundingBox.intersectsBox(pipe.boundingBoxBottom)) {
            bruin.gameOver = true;
            break;
        }
    }
}

// Spawn initial set of pipes
function spawnInitialPipes() {
    const initialPipeCount = 5;
    const pipeSpacing = 5;

    for (let i = 0; i < initialPipeCount; i++) {
        const gapHeight = 2 + Math.random() * 2;
        const gapYPosition = (Math.random() - 0.5) * 3;
        const xPosition = camera.position.x + 6 + i * pipeSpacing;

        const pipe = new Pipe(xPosition, gapHeight, gapYPosition);
        pipe.pipes.forEach(p => scene.add(p));
        pipes.push(pipe);
    }
}

// Start by spawning initial pipes
spawnInitialPipes();

// Main game loop
function animate() {
    if (bruin.gameOver) {
        displayGameOver();
        return;
    }

    requestAnimationFrame(animate);

    bruin.update();

    if (bruin.gameStarted) {
        if (frameCount === 0 || frameCount % pipeSpawnInterval === 0) {
            spawnPipe();
        }

        pipes.forEach(pipe => {
            pipe.update(0.03);

            // Update score if Bruin passes a pipe
            if (!pipe.passed && bruin.mesh.position.x > pipe.pipes[0].position.x + pipe.pipes[0].geometry.parameters.width / 2) {
                score++;
                pipe.passed = true;
                updateScoreDisplay(score); // Update score display with pulse effect
            }
        });

        // Remove pipes that have moved off-screen
        pipes = pipes.filter(pipe => {
            const isOnScreen = pipe.pipes[0].position.x > -5;
            if (!isOnScreen) {
                pipe.pipes.forEach(p => scene.remove(p));
            }
            return isOnScreen;
        });

        checkCollision();

        // Camera follows Bruin smoothly
        camera.position.x += (bruin.mesh.position.x + 2 - camera.position.x) * 0.03;
    } else {
        camera.position.x = bruin.mesh.position.x - 1;
    }

    renderer.render(scene, camera);
    frameCount++;
}

// Start the animation loop
animate();
