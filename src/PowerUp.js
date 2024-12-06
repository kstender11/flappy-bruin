// PowerUp.js

import * as THREE from 'three';

class PowerUp {
    constructor(type, position) {
        this.type = type; // Type of power-up (shield, extraPoints, bomb)
        this.position = position; // Position of the power-up in the game
        this.active = true; // Indicates if the power-up is active
        this.duration = 5000;
        this.boundingBox = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(position.x, position.y, 0),
            new THREE.Vector3(1, 1, 1) // Adjust size as needed
        ); // Duration for which the power-up is active (in milliseconds)
    }

    // Method to activate the power-up
    activate(player) {
        switch (this.type) {
            case 'shield':
                this.activateShield(player);
                break;
            case 'extraPoints':
                this.activateExtraPoints(player);
                break;
            case 'bomb':
                
                break;
            default:
                console.warn('Unknown power-up type');
        }
    }

    // Shield power-up: Protects the player from one hit
    activateShield(player) {
        player.shielded = true; // Set player shielded state
        setTimeout(() => {
            player.shielded = false; // Remove shield after duration
        }, this.duration);
    }

    // Extra points power-up: Increases player's score
    activateExtraPoints(player) {
        player.score += 50; // Add extra points to player's score
        // Optionally, you can add a visual effect or sound here
    }

   

    // Check if the power-up is near a pipe
    isNear(pipe) {
        const distance = Math.sqrt(
            (this.position.x - pipe.position.x) ** 2 +
            (this.position.y - pipe.position.y) ** 2
        );
        return distance < 5; // Adjust the distance threshold as needed
    }
}

// Export the PowerUp class
export default PowerUp;