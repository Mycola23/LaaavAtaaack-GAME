import { MOVE_SPEED, WORLD_SIZE, PLAYER_SIZE, JUMP_FORCE, FRICTION, globalGravity } from '../enums/enum.js';
import { Player } from '../enums/Player.js';

export function runPhysics(p: Player, gravDir: globalGravity) {
    //
    if (gravDir.y !== 0) {
        // vertical gravity - move left-right
        if (p.input.left) p.vx -= MOVE_SPEED;
        if (p.input.right) p.vx += MOVE_SPEED;
    } else if (gravDir.x !== 0) {
        // horizontal gravity move up-down
        if (p.input.left) p.vy -= MOVE_SPEED;
        if (p.input.right) p.vy += MOVE_SPEED;
    }

    //JUMP
    if (p.input.jump) {
        const isOnBottom = gravDir.y > 0 && p.y >= WORLD_SIZE - PLAYER_SIZE - 1;
        const isOnTop = gravDir.y < 0 && p.y <= 1;
        const isOnLeft = gravDir.x < 0 && p.x <= 1;
        const isOnRight = gravDir.x > 0 && p.x >= WORLD_SIZE - PLAYER_SIZE - 1;

        if (isOnBottom || isOnTop || isOnLeft || isOnRight || p.canJumpOnPlatform) {
            p.canJumpOnPlatform = false;
            if (gravDir.y > 0) p.vy = JUMP_FORCE;
            else if (gravDir.y < 0) p.vy = -JUMP_FORCE;
            else if (gravDir.x > 0) p.vx = JUMP_FORCE;
            else if (gravDir.x < 0) p.vx = -JUMP_FORCE;
        }
    }

    p.vx += gravDir.x;
    p.vy += gravDir.y;
    p.vx *= FRICTION;
    p.vy *= FRICTION;

    p.x += p.vx;
    p.y += p.vy;
}
