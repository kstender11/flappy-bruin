import * as THREE from 'three';

class PowerUp {
    constructor(type, position) {
        this.type = type; // Type of power-up (shield, extraPoints, bomb, neutralizer)
        this.position = position; // Position of the power-up in the game
        this.active = true; // Indicates if the power-up is active
        this.duration = 5000;
        this.boundingBox = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(position.x, position.y, 0),
            new THREE.Vector3(1, 1, 1) // Adjust size as needed
        );
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
            case 'neutralizer':
                this.activateNeutralizer(player);
                break;
            default:
                console.warn('Unknown power-up type');
        }
    }

    // Shield power-up: Protects the player from one hit
    activateShield(player) {
        player.shielded = true;
        setTimeout(() => {
            player.shielded = false;
        }, this.duration);
    }

    // Extra points power-up: Increases player's score
    activateExtraPoints(player) {
        player.score += 50;
    }

    // Neutralizer power-up: Prevents collision with next 5 pipes
    activateNeutralizer(player) {
        player.neutralizerActive = true;
        player.neutralizerPipeCount = 5;
        setTimeout(() => {
            player.neutralizerActive = false;
            player.neutralizerPipeCount = 0;
        }, this.duration);
    }

    // Check if the power-up is near a pipe
    isNear(pipe) {
        const distance = Math.sqrt(
            (this.position.x - pipe.position.x) ** 2 +
            (this.position.y - pipe.position.y) ** 2
        );
        return distance < 5;
    }
}

export default PowerUp;