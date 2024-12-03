import * as THREE from 'three';

class Pipe {
    constructor(xPosition, gapHeight = 2, gapYPosition = 0) {
        const pipeRadius = 0.5;
        const pipeHeight = 10;


        const textureLoader = new THREE.TextureLoader();
        const pipeTexture = textureLoader.load('./src/textures/pipe_texture.jpg');
        pipeTexture.wrapS = THREE.RepeatWrapping; 
        pipeTexture.wrapT = THREE.RepeatWrapping; 
        pipeTexture.repeat.set(1, 5);


        const pipeMaterial = new THREE.MeshPhongMaterial({
            map: pipeTexture,
            color: 0x8b0000, 
            shininess: 10, 
        });


        const pipeGeometry = new THREE.CylinderGeometry(pipeRadius, pipeRadius, pipeHeight, 32);

        // Top pipe
        this.basePipeTop = new THREE.Mesh(pipeGeometry, pipeMaterial);
        this.basePipeTop.position.set(xPosition, gapYPosition + gapHeight / 2 + pipeHeight / 2, 0);
        this.basePipeTop.rotation.set(0, 0, 0); // Explicitly reset any rotation

        // Bottom pipe
        this.basePipeBottom = new THREE.Mesh(pipeGeometry, pipeMaterial);
        this.basePipeBottom.position.set(xPosition, gapYPosition - gapHeight / 2 - pipeHeight / 2, 0);
        this.basePipeBottom.rotation.set(0, 0, 0); // Explicitly reset any rotation

        // Collision detection
        this.boundingBoxTop = new THREE.Box3().setFromObject(this.basePipeTop);
        this.boundingBoxBottom = new THREE.Box3().setFromObject(this.basePipeBottom);

        // Add both the top and bottom pipes to the array
        this.pipes = [this.basePipeTop, this.basePipeBottom];
    }

    update(speed) {
        this.pipes.forEach(pipe => {
            pipe.position.x -= speed;
            pipe.rotation.set(0, 0, 0); 
        });

     
        this.boundingBoxTop.setFromObject(this.basePipeTop);
        this.boundingBoxBottom.setFromObject(this.basePipeBottom);
    }
}

export default Pipe;
