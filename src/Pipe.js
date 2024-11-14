// src/Pipe.js
import * as THREE from 'three';

class Pipe {
    constructor(xPosition, gapHeight = 2, gapYPosition = 0) {
        const pipeWidth = 0.7;
        const pipeHeight = 10;

        // Red pipe 
        const redMaterial = new THREE.MeshBasicMaterial({ color: 0x8b0000 });
        const pipeGeometry = new THREE.BoxGeometry(pipeWidth, pipeHeight, 0.01);

        // Top pipe
        this.basePipeTop = new THREE.Mesh(pipeGeometry, redMaterial);
        this.basePipeTop.position.set(xPosition, gapYPosition + gapHeight / 2 + pipeHeight / 2, 0.02);

        // Bottom pipe
        this.basePipeBottom = new THREE.Mesh(pipeGeometry, redMaterial);
        this.basePipeBottom.position.set(xPosition, gapYPosition - gapHeight / 2 - pipeHeight / 2, 0.02);

        // Collision detection
        this.boundingBoxTop = new THREE.Box3().setFromObject(this.basePipeTop);
        this.boundingBoxBottom = new THREE.Box3().setFromObject(this.basePipeBottom);

        this.pipes = [this.basePipeTop, this.basePipeBottom];
    }

    update(speed) {
        this.pipes.forEach(pipe => pipe.position.x -= speed);
        this.boundingBoxTop.setFromObject(this.basePipeTop);
        this.boundingBoxBottom.setFromObject(this.basePipeBottom);
    }
}

export default Pipe;
