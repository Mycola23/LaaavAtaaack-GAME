export const GAME_STATUS = {
    PAUSE: 'PAUSE',
    PLAY: 'PLAY',
    WAITING: 'WAITING',
} as const;
export type GAME_STATUS = 'PAUSE' | 'PLAY' | 'WAITING';

export interface globalGravity {
    x: number;
    y: number;
}

export const TICK_RATE = 60;
export const WORLD_SIZE = 1000;
export const PLAYER_SIZE = 40;
export const GRAVITY = 0.5;
export const JUMP_FORCE = -12;
export const MOVE_SPEED = 0.6;
export const FRICTION = 0.92;
export const PUSH_FORCE = 15;
