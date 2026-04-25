import { Platform, globalGravity, WORLD_SIZE, PLAYER_SIZE, FRICTION } from '../enums/enum.js';

const PLATFORM_SPEED = 2;
const PLATFORM_COLORS = ['#2D2A32', '#CCC9DC', '#A2D729', '#6FFFE9', '#5B7B7A', '#D7C8DB'];
export function updatePlatforms(platforms: Platform[], gravDir: globalGravity) {
    platforms.forEach(p => {
        p.vx = gravDir.x !== 0 ? -Math.sign(gravDir.x) * PLATFORM_SPEED : 0;
        p.vy = gravDir.y !== 0 ? -Math.sign(gravDir.y) * PLATFORM_SPEED : 0;

        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -50 && gravDir.y > 0) p.y = WORLD_SIZE + 50;
        if (p.y > WORLD_SIZE + 50 && gravDir.y < 0) p.y = -50;
        if (p.x < -150 && gravDir.x > 0) p.x = WORLD_SIZE + 150;
        if (p.x > WORLD_SIZE + 150 && gravDir.x < 0) p.x = -150;
    });
}

export function generateMap(): Platform[] {
    const platforms: Platform[] = [];
    const worldHeight = WORLD_SIZE;
    const worldWidth = WORLD_SIZE;
    const stepY = 130;

    for (let y = 0; y < worldHeight; y += stepY) {
        const count = Math.floor(Math.random() * 5) + 1;

        for (let i = 0; i < count; i++) {
            const pWidth = Math.random() * 205 + 85;
            const pHeight = Math.random() * 45 + 15;

            const x = Math.random() * (worldWidth - pWidth);

            const tooClose = platforms.some(p => p.y === y && Math.abs(p.x - x) < 150);

            if (!tooClose) {
                const colorIndex = Math.floor(Math.random() * PLATFORM_COLORS.length);
                platforms.push({
                    x,
                    y,
                    width: pWidth,
                    height: pHeight,
                    vx: 0,
                    vy: 0,
                    color: PLATFORM_COLORS[colorIndex],
                    friction: FRICTION,
                });
            }
        }
    }
    return platforms;
}
