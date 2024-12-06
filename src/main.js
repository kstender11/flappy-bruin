import * as THREE from 'three';
import Bruin from './bruin.js';
import Pipe from './pipe.js';
import Cloud from './cloud.js';
import PowerUp from './PowerUp.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x000000); 

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
        side: THREE.DoubleSide 
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    

    sky.position.set(0, 0, -20); 
    scene.add(sky);
});

// const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); 
// directionalLight.position.set(10, 10, 10);
// scene.add(directionalLight);


// const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); 
// scene.add(ambientLight);

// const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 0.5); 
// scene.add(hemisphereLight); 

 
const bruin = new Bruin();
scene.add(bruin.mesh);


const bruinLight = new THREE.PointLight(0xffffff, 10, 100); // White light, intensity, distance
bruinLight.position.copy(bruin.mesh.position); // Set initial position to Bruin's position
scene.add(bruinLight);

let pipes = [];
let pipeSpawnInterval = 250;
let frameCount = 0;
let score = 0;


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

function checkBounds() {
    const topBound = camera.position.y + 3.5; // Adjust based on your scene
    const bottomBound = camera.position.y - 3.5; // Adjust based on your scene

    if (bruin.mesh.position.y > topBound) {
        bruin.mesh.position.y = topBound; // Keep it within bounds
        bruin.jumpDown();// Reverse direction
    } else if (bruin.mesh.position.y < bottomBound) {
        bruin.mesh.position.y = bottomBound; // Keep it within bounds
        bruin.jump() // Reverse direction
    }
}

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

    // Create the restart button
    const restartButton = document.createElement('button');
    restartButton.id = 'restartButton';
    restartButton.innerText = 'Restart';
    gameOverContainer.appendChild(restartButton);

    // Event listener for restarting the game
    restartButton.addEventListener('click', () => {
        window.location.reload(); // Reload the page to restart the game
    });

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
            lives--; // Reduce lives by 1
            livesDisplay.innerText = `Lives: ${lives}`; // Update lives display

            // Remove the pipe that was hit
            pipe.pipes.forEach(p => scene.remove(p));
            pipes = pipes.filter(p => p !== pipe); // Remove pipe from the array

            if (lives <= 0) {
                bruin.gameOver = true; // Set game over if no lives left
                displayGameOver(); // Call game over display
            }
            break; // Exit loop after collision
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

spawnInitialPipes();

let clouds = [];
const cloudCount = 50; 
const xStart = camera.position.x - 20; 
const xEnd = camera.position.x + 40; 
const yStart = -10; 
const yEnd = 10; 
const zStart = -15; 
const zEnd = -5; 
const cloudSpacing = 6; 

function generateRandomPosition(existingClouds) {
    let x, y, z;
    let isOverlapping;
    do {
        x = Math.random() * (xEnd - xStart) + xStart; 
        y = Math.random() * (yEnd - yStart) + yStart;
        z = Math.random() * (zEnd - zStart) + zStart;

 
        isOverlapping = existingClouds.some(cloud => {
            const dx = cloud.mesh.position.x - x;
            const dy = cloud.mesh.position.y - y;
            const dz = cloud.mesh.position.z - z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz) < cloudSpacing;
        });
    } while (isOverlapping);

    return { x, y, z };
} 


for (let i = 0; i < cloudCount; i++) {
    const { x, y, z } = generateRandomPosition(clouds);
    const cloud = new Cloud(x, y, z);
    scene.add(cloud.mesh);
    clouds.push(cloud);
}

// Array to hold active power-ups
let powerUps = [];

// Function to spawn a power-up at a random position
function spawnPowerUp() {
    if (pipes.length < 2) return; // Ensure there are at least two pipes

    const lastPipe = pipes[pipes.length - 1];
    const secondLastPipe = pipes[pipes.length - 2];

    // Calculate the middle position between the last two pipes
    const xPosition = (lastPipe.pipes[0].position.x + secondLastPipe.pipes[0].position.x) / 2;
    const gapHeight = 2 + Math.random() * 2; // Random height for the gap
    const gapYPosition = (Math.random() - 0.5) * 3; // Random Y position within a range

    const randomPosition = {
        x: xPosition, // Use the calculated x position
        y: gapYPosition // Use the random Y position
    };

    const randomType = ['shield', 'extraPoints', 'bomb'][Math.floor(Math.random() * 3)]; // Randomly select a type

    const newPowerUp = new PowerUp(randomType, randomPosition); // Create a new power-up instance
    newPowerUp.mesh = createPowerUpMesh(randomType); // Create the mesh for the power-up
    newPowerUp.mesh.position.set(randomPosition.x, randomPosition.y, 0); // Set the position of the mesh
    scene.add(newPowerUp.mesh); // Add the mesh to the scene
    powerUps.push(newPowerUp); // Add the new power-up to the array
}

// Function to update and render power-ups
function updatePowerUps() {
    powerUps.forEach((powerUp, index) => {
        // Move the power-up to the left
        powerUp.mesh.position.x -= 0.03; // Adjust speed as needed

        // Update the bounding box for the power-up
        powerUp.boundingBox = new THREE.Box3().setFromObject(powerUp.mesh);

        // Check if the player collects the power-up
        if (bruin.boundingBox.intersectsBox(powerUp.boundingBox)) {
            if(powerUp.type === "extraPoints") {
                score += 50;
            }
            if(powerUp.type === "bomb") {
                bruin.gameOver = true;
            }

            
            scene.remove(powerUp.mesh); // Remove the power-up mesh from the scene
            powerUps.splice(index, 1); // Remove the power-up from the array after activation
        }
    });

    // Remove off-screen power-ups
    powerUps = powerUps.filter(powerUp => {
        const isOnScreen = powerUp.mesh.position.x > -5; // Adjust based on your scene
        if (!isOnScreen) {
            scene.remove(powerUp.mesh); // Remove the mesh from the scene
        }
        return isOnScreen;
    });
}

// Function to start spawning power-ups at intervals
function startPowerUpSpawning() {
    setInterval(spawnPowerUp, 3000); // Spawn a new power-up every 5 seconds
}

// Call the function to start spawning power-ups
startPowerUpSpawning(); // Ensure this is called after defining the function

// Function to create a power-up mesh
function createPowerUpMesh(type) {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32); // Create a sphere geometry
    let color;

    // Assign colors based on the power-up type
    switch (type) {
        case 'shield':
            color = 0x00ff00; // Green for shield
            break;
        case 'extraPoints':
            color = 0xffff00; // Yellow for extra points
            break;
        case 'bomb':
            color = 0xff0000; // Red for bomb
            break;
        default:
            color = 0xffffff; // Default to white
    }

    const material = new THREE.MeshStandardMaterial({ 
        color: color, 
        emissive: color, // Slightly glow
        emissiveIntensity: 0.1 // Adjust intensity as needed
    }); // Create a material with the assigned color
    const mesh = new THREE.Mesh(geometry, material); // Create the mesh
    return mesh; // Return the mesh
}

let lives = 3; // Initialize lives
let livesDisplay = document.createElement('div');
livesDisplay.id = 'lives';
livesDisplay.innerText = `Lives: ${lives}`;
document.body.appendChild(livesDisplay);

// Add CSS styles for the lives display
const livesStyle = document.createElement('style');
livesStyle.textContent = `
    #lives {
        position: absolute;
        top: 20px;
        left: 20px;
        color: #ffffff;
        font-size: 1.5em;
        font-family: 'Arial', sans-serif;
        font-weight: bold;
    }
`;
document.head.appendChild(livesStyle);

// Update the animate function to include power-up updates
function animate() {
    if (bruin.gameOver) {
        displayGameOver();
        return;
    }

    requestAnimationFrame(animate);

    bruin.update();
    checkBounds();
    checkCollision();
    updatePowerUps(); // Update power-ups each frame
    bruinLight.position.copy(bruin.mesh.position);
    if (bruin.gameStarted) {
        if (frameCount === 0 || frameCount % pipeSpawnInterval === 0) {
            spawnPipe();
        }

        pipes.forEach(pipe => {
            pipe.update(0.03);

            if (!pipe.passed && bruin.mesh.position.x > pipe.basePipeTop.position.x) {
                score++;
                pipe.passed = true;
                updateScoreDisplay(score);
            } 
        });

        clouds.forEach(cloud => {
            cloud.mesh.position.x -= 0.02; 

            if (cloud.mesh.position.x < camera.position.x - 30) {
                repositionCloud(cloud);
            }
        });

        pipes = pipes.filter(pipe => {
            const isOnScreen = pipe.pipes[0].position.x > -5;
            if (!isOnScreen) {
                pipe.pipes.forEach(p => scene.remove(p));
            }
            return isOnScreen;
        });

        camera.position.x += (bruin.mesh.position.x + 2 - camera.position.x) * 0.03;
    } else {
        camera.position.x = bruin.mesh.position.x - 1;
    }

    renderer.render(scene, camera);
    frameCount++;
}


function repositionCloud(cloud) {
    cloud.mesh.position.x = camera.position.x + 30; 
    cloud.mesh.position.y = Math.random() * (yEnd - yStart) + yStart; 
    cloud.mesh.position.z = Math.random() * (zEnd - zStart) + zStart; 
}


// Start the animation loop
animate();