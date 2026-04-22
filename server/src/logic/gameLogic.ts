import { Player } from '../enums/Player.js';
import { WORLD_SIZE, PLAYER_SIZE, PUSH_FORCE } from '../enums/enum.js';

export function handleBoundaries(p: Player) {
    if (p.x < 0) {
        p.x = 0;
        p.vx = 0;
    }
    if (p.x > WORLD_SIZE - PLAYER_SIZE) {
        p.x = WORLD_SIZE - PLAYER_SIZE;
        p.vx = 0;
    }
    if (p.y < 0) {
        p.y = 0;
        p.vy = 0;
    }
    if (p.y > WORLD_SIZE - PLAYER_SIZE) {
        p.y = WORLD_SIZE - PLAYER_SIZE;
        p.vy = 0;
    }
}

export function handleShove(p: Player, allPlayers: Player[]) {
    if (p.input.shove && p.shoveCooldown <= 0) {
        allPlayers.forEach(victim => {
            if (p.id === victim.id) return;

            const dist = Math.hypot(p.x - victim.x, p.y - victim.y);
            if (dist < 60) {
                const angle = Math.atan2(victim.y - p.y, victim.x - p.x);
                victim.vx += Math.cos(angle) * PUSH_FORCE;
                victim.vy += Math.sin(angle) * PUSH_FORCE;
                p.shoveCooldown = 30; // === cooldown 0.5s
            }
        });
    }
    if (p.shoveCooldown > 0) p.shoveCooldown--;
}
