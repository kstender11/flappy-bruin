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

            // Translation matrix for the Y-axis movement
            const translationMatrix = new THREE.Matrix4();
            translationMatrix.makeTranslation(0, this.velocity, 0);

            // Translation matrix to the Bruin's mesh
            this.mesh.applyMatrix4(translationMatrix);
            
            // Bounding box after translation
            this.boundingBox.setFromObject(this.mesh);

            // If Bruin hits the bottom or top of the screen
            if (this.mesh.position.y < -5 || this.mesh.position.y > this.topBoundary) {
                this.gameOver = true;
            }
        }
    }
}

export default Bruin;
