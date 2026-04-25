import { Player } from '../enums/Player.js';
import { WORLD_SIZE, PLAYER_SIZE, PUSH_FORCE, Platform, globalGravity } from '../enums/enum.js';

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

export function checkPlatformCollision(p: Player, platforms: Platform[], gravDir: globalGravity): boolean {
    const SNAP_TOLERANCE = 15;

    for (const plat of platforms) {
        const overlapX = p.x < plat.x + plat.width && p.x + PLAYER_SIZE > plat.x;
        const overlapY = p.y < plat.y + plat.height && p.y + PLAYER_SIZE > plat.y;

        if (!overlapX || !overlapY) continue;

        const relVx = p.vx - plat.vx;
        const relVy = p.vy - plat.vy;

        // --- vertical gravity---
        if (gravDir.y !== 0) {
            if (gravDir.y > 0 && relVy >= 0) {
                if (p.y + PLAYER_SIZE <= plat.y + SNAP_TOLERANCE) {
                    p.y = plat.y - PLAYER_SIZE;
                    p.vy = plat.vy;
                    p.x += plat.vx;
                    return true;
                }
            }
            if (gravDir.y < 0 && relVy <= 0) {
                if (p.y >= plat.y + plat.height - SNAP_TOLERANCE) {
                    p.y = plat.y + plat.height;
                    p.vy = plat.vy;
                    p.x += plat.vx;
                    return true;
                }
            }
        }

        // --- horizontal gravity ---
        if (gravDir.x !== 0) {
            if (gravDir.x > 0 && relVx >= 0) {
                if (p.x + PLAYER_SIZE <= plat.x + SNAP_TOLERANCE) {
                    p.x = plat.x - PLAYER_SIZE;
                    p.vx = plat.vx;
                    p.y += plat.vy;
                    return true;
                }
            }
            if (gravDir.x < 0 && relVx <= 0) {
                if (p.x >= plat.x + plat.width - SNAP_TOLERANCE) {
                    p.x = plat.x + plat.width;
                    p.vx = plat.vx;
                    p.y += plat.vy;
                    return true;
                }
            }
        }
    }

    return false;
}
