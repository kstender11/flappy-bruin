import * as THREE from 'three';

class Bruin {
    constructor() {
        this.jumpStrength = 0.1; 
        this.gravity = -0.006;
        this.velocity = 0;
        this.gameStarted = false;
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0x8b4513 }) 
        );
        this.mesh.position.y = 0; //start in middle of screen

        this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
        this.gameOver = false;
        this.topBoundary = 5; 
    }

    startGame() {
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.jump(); //jump to start the game
        }
    }

    jump() {
        if (this.gameStarted) {
            this.velocity = this.jumpStrength;
        }
    }

    update() {
        if (this.gameStarted && !this.gameOver) {
            this.velocity += this.gravity;
            this.mesh.position.y += this.velocity;
            this.boundingBox.setFromObject(this.mesh);

            //check if the Bruin hits the bottom or the top of the screen
            if (this.mesh.position.y < -5 || this.mesh.position.y > this.topBoundary) {
                this.gameOver = true;
            }
        }
    }
}

export default Bruin;
