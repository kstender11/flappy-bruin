import * as THREE from 'three';

class Bruin {
    constructor() {
        this.jumpStrength = 0.1; 
        this.gravity = -0.006;
        this.velocity = 0;
        this.gameStarted = false;

        this.neutralizerActive = false;
        this.neutralizerPipeCount = 0;

        // Sphere for collision detection
        this.collisionSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 32, 32),
            new THREE.MeshBasicMaterial({ visible: false }) 
        );

        // Plane for the bear image
        const textureLoader = new THREE.TextureLoader();
        const bearTexture = textureLoader.load('./src/textures/bear_face.png');
        this.bearMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.6, 0.6), 
            new THREE.MeshBasicMaterial({
                map: bearTexture,
                transparent: true,
            })
        );


        this.bearMesh.position.set(0, 0, 0.01);


        this.mesh = new THREE.Group();
        this.mesh.add(this.collisionSphere);
        this.mesh.add(this.bearMesh);


        this.mesh.position.y = 0;


        this.boundingBox = new THREE.Box3().setFromObject(this.collisionSphere);
        this.gameOver = false;
        this.topBoundary = 5;
    }

    startGame() {
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.jump(); 
        }
    }

    jump() {
        if (this.gameStarted) {
            this.velocity = this.jumpStrength;
        }
    }

    jumpDown() {
        if(this.gameStarted) {
            this.velocity = this.jumpStrength * -0.25;
        }
    }

    update() {
        if (this.gameStarted && !this.gameOver) {
            this.velocity += this.gravity;

            const translationMatrix = new THREE.Matrix4();
            translationMatrix.makeTranslation(0, this.velocity, 0);

            this.mesh.applyMatrix4(translationMatrix);

            this.boundingBox.setFromObject(this.collisionSphere);

            if (this.mesh.position.y < -5 || this.mesh.position.y > this.topBoundary) {
                this.gameOver = true;
            }
        }
    }
}

export default Bruin;
