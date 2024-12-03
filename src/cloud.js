import * as THREE from 'three';

class Cloud {
    constructor(x, y, z) {

        this.mesh = new THREE.Group();

        const baseSize = 0.3 + Math.random() * 0.7; 
        const geometry = new THREE.SphereGeometry(baseSize, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff, 
            roughness: 0.8,
            transparent: true,
            opacity: 0.9, 
        });


        const numSpheres = 5 + Math.floor(Math.random() * 5); // 5 to 9 spheres
        for (let i = 0; i < numSpheres; i++) {
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(
                Math.random() * 1.5 - 0.75, 
                Math.random() * 1.5 - 0.75, 
                Math.random() * 0.5 - 0.25 
            );


            sphere.scale.set(
                1.5 + Math.random() * 1.5, 
                1.0 + Math.random() * 0.5, 
                1.0 
            );

            this.mesh.add(sphere);
        }

        this.mesh.position.set(x, y, z);
    }

    update(speed) {
   
        this.mesh.position.x -= speed;

        if (this.mesh.position.x < -20) {
            this.mesh.position.x = 20 + Math.random() * 10;
            this.mesh.position.y = Math.random() * 10 - 5;
        }
    }
}

export default Cloud;
