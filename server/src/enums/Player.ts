export interface Player {
    id: string;
    name: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    isLeader: boolean;
    input: { up: boolean; down: boolean; left: boolean; right: boolean; jump: boolean; shove: boolean };
    shoveCooldown: number;
}
