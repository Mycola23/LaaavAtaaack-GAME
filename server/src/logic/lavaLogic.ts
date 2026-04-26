import { globalGravity, Lava, WORLD_SIZE } from '../enums/enum.js';

const LAVA_SPEED = 1;

export type LavaDirection = 'down' | 'up' | 'left' | 'right';

export function generateLava(direction: LavaDirection): Lava {
    switch (direction) {
        case 'down':
            return {
                x: 0,
                y: WORLD_SIZE,
                width: WORLD_SIZE,
                height: WORLD_SIZE,
                vx: 0,
                vy: -LAVA_SPEED,
                color: '#ff4500',
            };
        case 'up':
            return {
                x: 0,
                y: -WORLD_SIZE,
                width: WORLD_SIZE,
                height: WORLD_SIZE,
                vx: 0,
                vy: LAVA_SPEED,
                color: '#ff4500',
            };
        case 'left':
            return {
                x: -WORLD_SIZE,
                y: 0,
                width: WORLD_SIZE,
                height: WORLD_SIZE,
                vx: LAVA_SPEED,
                vy: 0,
                color: '#ff4500',
            };
        case 'right':
            return {
                x: WORLD_SIZE,
                y: 0,
                width: WORLD_SIZE,
                height: WORLD_SIZE,
                vx: -LAVA_SPEED,
                vy: 0,
                color: '#ff4500',
            };
    }
}

export function updateLava(lava: Lava) {
    lava.x += lava.vx;
    lava.y += lava.vy;
}

export function getLavaDirection(gravDir: globalGravity): LavaDirection {
    if (gravDir.y > 0) return 'down';
    if (gravDir.y < 0) return 'up';
    if (gravDir.x > 0) return 'right';
    if (gravDir.x < 0) return 'left';
    return 'down';
}
