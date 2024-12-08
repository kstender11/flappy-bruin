import * as THREE from 'three';

class PowerUp {
    constructor(type, position) {
        this.type = type; 
        this.position = position; 
        this.active = true; 
        this.duration = 5000;
        this.boundingBox = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(position.x, position.y, 0),
            new THREE.Vector3(1, 1, 1) 
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

    activateShield(player) {
        player.shielded = true;
        setTimeout(() => {
            player.shielded = false;
        }, this.duration);
    }

    activateExtraPoints(player) {
        player.score += 50;
    }

    activateNeutralizer(player) {
        player.neutralizerActive = true;
        player.neutralizerPipeCount = 5;
        setTimeout(() => {
            if (player.neutralizerActive) {
                player.neutralizerActive = false;
                pipe_arr.forEach(pipe => {
                    if (pipe.neutralized) {
                        pipe.resetColor();
                        pipe.neutralized = false;
                    }
                });
                console.log('Neutralizer deactivated after 6 seconds.');
            }
        }, 1000);
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