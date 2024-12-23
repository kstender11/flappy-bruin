import * as THREE from 'three';
import Bruin from './Bruin.js';
import Pipe from './Pipe.js';
import Cloud from './cloud.js';
import PowerUp from './PowerUp.js';

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


const bruin = new Bruin();
scene.add(bruin.mesh);


const bruinLight = new THREE.PointLight(0xffffff, 8, 50);
bruinLight.position.copy(bruin.mesh.position); 
scene.add(bruinLight);

let pipe_arr = [];
let isBouncing = false;
let pipeSpawnInterval = 500;
let frameCount = 0;
let score = 0;
let speed = 0.03;
let bounceStartTime = 0;


let scoreDisplay = document.getElementById('score');
if (!scoreDisplay) {
    scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'score';
    scoreDisplay.innerText = 'Score: 0';
    document.body.appendChild(scoreDisplay);

    // CSS styles for the score display
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

// Pulsing effect when score updates
function updateScoreDisplay(newScore) {
    scoreDisplay.innerText = `Score: ${newScore}`;
    scoreDisplay.classList.add('pulse');  
    setTimeout(() => scoreDisplay.classList.remove('pulse'), 300); 
}

// Spawn pipes
function spawnPipe() {
    const lastPipe = pipe_arr[pipe_arr.length - 1];
    const pipeSpacing = 5;
    const gapHeight = 2 + Math.random() * 2;
    const gapYPosition = (Math.random() - 0.5) * 3;
    const xPosition = lastPipe ? lastPipe.pipes[0].position.x + pipeSpacing : camera.position.x + 10;

    const pipe = new Pipe(xPosition, gapHeight, gapYPosition);
    pipe.pipes.forEach(p => scene.add(p));
    if (Math.random() < 0.50) {
        spawnPowerUp();
    }

    pipe_arr.push(pipe);
}

// User input for jumping
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

//checking bounds for player
function checkBounds() {
    const topBound = camera.position.y + 3.5; 
    const bottomBound = camera.position.y - 3.5; 

    if (bruin.mesh.position.y > topBound) {
        bruin.mesh.position.y = topBound; 
        bruin.jumpDown();
    } else if (bruin.mesh.position.y < bottomBound) {
        bruin.mesh.position.y = bottomBound; 
        bruin.jump() 
    }
}

// Game over logic 
function displayGameOver() {
    const gameOverContainer = document.createElement('div');
    gameOverContainer.id = 'gameOverContainer';

    const gameOverText = document.createElement('div');
    gameOverText.id = 'gameOver';
    gameOverText.innerText = 'Game Over';

    gameOverContainer.appendChild(gameOverText);
    document.body.appendChild(gameOverContainer);

    const restartButton = document.createElement('button');
    restartButton.id = 'restartButton';
    restartButton.innerText = 'Restart';
    gameOverContainer.appendChild(restartButton);

    restartButton.addEventListener('click', () => {
        window.location.reload(); 
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




//handle collision logic for the bruin and the pipes 
function checkCollision() {
    if (bruin.neutralizerActive) { //neutralizer logic for the powerup
        pipe_arr.forEach((pipe) => {
            if (!pipe.neutralized) {
                pipe.basePipeTop.material.color.setHex(0x0000ff); 
                pipe.basePipeBottom.material.color.setHex(0x0000ff);
                pipe.neutralized = true; 
            }
        });

        
        return;
    }

    // Regular collision detection
    for (let pipe of pipe_arr) {
        if (
            bruin.boundingBox.intersectsBox(pipe.boundingBoxTop) ||
            bruin.boundingBox.intersectsBox(pipe.boundingBoxBottom)
        ) {
            if (pipe.neutralized) {
                console.log("Hit a neutralized pipe. No penalty.");
                continue; 
            }

            pipe.basePipeTop.material.color.setHex(0x8b0000); 
            pipe.basePipeBottom.material.color.setHex(0x8b0000);
            lives--;

            pipe.pipes.forEach(p => scene.remove(p));
            pipe_arr = pipe_arr.filter(p => p !== pipe);
            isBouncing = true;
            bounceStartTime = Date.now();
            if (lives <= 0) {
                bruin.gameOver = true;
                displayGameOver();
            }
            break;
        }
    }
}


// Spawn initial set of 5 pipes
function spawnInitialPipes() {
    const initialPipeCount = 5;
    const pipeSpacing = 5;

    for (let i = 0; i < initialPipeCount; i++) {
        const gapHeight = 2 + Math.random() * 2;
        const gapYPosition = (Math.random() - 0.5) * 3;
        const xPosition = camera.position.x + 6 + i * pipeSpacing;

        const pipe = new Pipe(xPosition, gapHeight, gapYPosition);
        pipe.pipes.forEach(p => scene.add(p));
        pipe_arr.push(pipe);
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



//spawning logic for the clouds
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



let powerUps = [];


//powerup spawning logic 
function spawnPowerUp() {
    if (pipe_arr.length < 2) return;

    const lastPipe = pipe_arr[pipe_arr.length - 1];
    const secondLastPipe = pipe_arr[pipe_arr.length - 2];

    const xPosition = (lastPipe.pipes[0].position.x + secondLastPipe.pipes[0].position.x) / 2;

    const existingPowerUp = powerUps.some(powerUp => 
        powerUp.mesh.position.x > secondLastPipe.pipes[0].position.x && 
        powerUp.mesh.position.x < lastPipe.pipes[0].position.x
    );

    if (!existingPowerUp) {

        const gapYPosition = (Math.random() - 0.5) * 3;

        const randomPosition = {
            x: xPosition,
            y: gapYPosition
        };

        const powerUpTypes = ['life', 'extraPoints', 'bomb', 'neutralizer'];
        const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        let chosenType = randomType;

        if(randomType === "neutralizer" ) {
            if(Math.random() >= 0.40) {
                chosenType = 'extraPoints'
            }
        }

        const newPowerUp = new PowerUp(chosenType, randomPosition);
        newPowerUp.mesh = createPowerUpMesh(chosenType);
        newPowerUp.mesh.position.set(randomPosition.x, randomPosition.y, 0);
        scene.add(newPowerUp.mesh);
        powerUps.push(newPowerUp);
    }
}



// Update and render power-ups
function updatePowerUps() {
    powerUps.forEach((powerUp, index) => {
        powerUp.mesh.position.x -= speed;
        powerUp.boundingBox = new THREE.Box3().setFromObject(powerUp.mesh);

        if (bruin.boundingBox.intersectsBox(powerUp.boundingBox)) {
            console.log(powerUp.type)
            if (powerUp.type === "extraPoints") {
                score += 20;
            }
            if (powerUp.type === "bomb") {
                bruin.gameOver = true;
            }

            if (powerUp.type === "life") {
                if (lives < 3) {
                    lives += 1;

                }
            }
            powerUp.activate(bruin);


            scene.remove(powerUp.mesh); 
            powerUps.splice(index, 1); 
        }
    });

    powerUps = powerUps.filter(powerUp => {
        const isOnScreen = powerUp.mesh.position.x > -5;
        if (!isOnScreen) {
            scene.remove(powerUp.mesh);
        }
        return isOnScreen;
    });
}




function createPowerUpMesh(type) {
    let path;

    switch (type) {
        case 'life':
            path =  './src/textures/heart_texture.jpg'; 
            break;
        case 'extraPoints':
            path =  './src/textures/star_texture.jpg'; 
            break;
        case 'bomb':
            path =  './src/textures/bomb_texture.jpg'; 
            break;
        case 'neutralizer':
            path = './src/textures/ucla_texture.jpg'; 
            break;
        default:
            path =  './src/textures/heart_texture.jpg'; 
    }

   
     const geometry = new THREE.SphereGeometry(0.5, 32, 32); 
     const material = new THREE.MeshBasicMaterial();
 
     textureLoader.load(path, (texture) => {
         material.map = texture; 
         material.needsUpdate = true; 
     });
 
     const mesh = new THREE.Mesh(geometry, material);
     mesh.rotation.y = 1.5;
     return mesh;
}

let lives = 3; 
let livesDisplay = document.createElement('div');
livesDisplay.id = 'lives';
livesDisplay.innerText = `Lives: ${lives}`;
document.body.appendChild(livesDisplay);



// CSS for the lives counter
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

let flag = true;
let pipes_passed = 0;



function animate() {

    livesDisplay.innerText = `Lives: ${lives}`;

    if (bruin.gameOver) {
        displayGameOver();
        return;
    }

    if (bruin.gameStarted && flag) {
        flag = false;
    }

    if (isBouncing) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - bounceStartTime;
        const BOUNCE_DISTANCE = speed * 2;
        
        if (elapsedTime < 300) {
            pipe_arr.forEach(pipe => {
                pipe.pipes.forEach(p => {
                    p.position.x += BOUNCE_DISTANCE;
                });
            });

            clouds.forEach(cloud => {
                cloud.mesh.position.x += BOUNCE_DISTANCE;
            });

            powerUps.forEach(powerUp => {
                powerUp.mesh.position.x += BOUNCE_DISTANCE;
            });
        } else {
            
            isBouncing = false;
        }
    }


    requestAnimationFrame(animate);

    bruin.update();
    const speedLevel = Math.floor(pipes_passed / 4);
    
    let speedMultiplier = 0.03 + (speedLevel * 0.005);
    
    speedMultiplier = Math.min(speedMultiplier, 0.08);
    speedMultiplier = Math.max(0.03, speedMultiplier);

    speed = speedMultiplier;

    console.log(speed)

    livesDisplay.innerText = `Lives: ${lives}`;
    checkBounds();
    checkCollision();
    updatePowerUps(); 
    bruinLight.position.copy(bruin.mesh.position);
    if (bruin.gameStarted) {
        if (pipe_arr.length < 5) {  
            spawnPipe();
        }

        pipe_arr.forEach(pipe => {
            pipe.update(speed);

            if (!pipe.passed && bruin.mesh.position.x > pipe.basePipeTop.position.x) {
                score++;
                pipe.passed = true;
                pipes_passed++;
                updateScoreDisplay(score);
            }
        });

        clouds.forEach(cloud => {
            cloud.mesh.position.x -= speed;

            if (cloud.mesh.position.x < camera.position.x - 30) {
                repositionCloud(cloud);
            }
        });

        // console.log("Pipe Length " + pipes.length)
        // console.log(bruin.neutralizerActive)
 
     
        pipe_arr = pipe_arr.filter(pipe => {
            const isOnScreen = pipe.pipes[0].position.x > -5;
            if (!isOnScreen) {
                pipe.pipes.forEach(p => scene.remove(p));
            }
            return isOnScreen;
        });

        camera.position.x += (bruin.mesh.position.x + 2 - camera.position.x) * speed;
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


animate();