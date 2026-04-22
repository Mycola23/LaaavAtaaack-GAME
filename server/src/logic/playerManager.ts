import { Player } from '../enums/Player.js';
import { createPlayer } from '../sockets/sockets.js';

export function addPlayer(players: Record<string, Player>, socketId: string, name: string) {
    const isLeader = Object.keys(players).length === 0;
    const player = createPlayer(socketId, name, isLeader);
    players[socketId] = player;
    return player;
}

export function removePlayer(players: Record<string, Player>, socketId: string) {
    const player = players[socketId];
    if (!player) return { name: null, newLeaderId: null };

    const name = player.name;
    delete players[socketId];

    const remainingIds = Object.keys(players);
    if (remainingIds.length > 0 && !players[remainingIds[0]].isLeader) {
        players[remainingIds[0]].isLeader = true;
        return { name, newLeaderId: remainingIds[0] };
    }

    return { name, newLeaderId: null };
}
