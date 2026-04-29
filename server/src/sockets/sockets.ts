import { WORLD_SIZE } from '../enums/enum.js';
import { Player } from '../enums/Player.js';

export function createPlayer(id: string, name: string, isLeader: boolean): Player {
    return {
        id,
        name: name.substring(0, 10),
        x: WORLD_SIZE / 2,
        y: WORLD_SIZE / 2,
        vx: 0,
        vy: 0,
        isLeader,
        input: { up: false, down: false, left: false, right: false, jump: false, shove: false, jetpack: false },
        shoveCooldown: 0,
        jetpackCooldown: 0,
        canJumpOnPlatform: false,
        survivalTime: 0,
        totalSurvivalTime: 0,
        isAlive: true,
    };
}
