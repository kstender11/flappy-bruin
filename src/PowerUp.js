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

    activate(player) {
        switch (this.type) {
            case 'life':
                break;
            case 'extraPoints':
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
            if (player.neutralizerActive) {
                player.neutralizerActive = false;
                console.log('Neutralizer deactivated after 10 seconds.');
            }
        }, 6000); // 10 seconds in milliseconds
    }

    // Extra points power-up: Increases player's score
    activateExtraPoints(player) {
        player.score += 50;
    }

    // Neutralizer power-up: Prevents collision with next 5 pipes
    activateNeutralizer(player) {
        console.log("Got here!")
        player.neutralizerActive = true;
        player.neutralizerPipeCount = 6;
        setTimeout(() => {
            player.neutralizerActive = false; // Deactivate after duration
        }, this.duration);
    }

    isNear(pipe) {
        const distance = Math.sqrt(
            (this.position.x - pipe.position.x) ** 2 +
            (this.position.y - pipe.position.y) ** 2
        );
        return distance < 5;
    }
}

export default PowerUp;