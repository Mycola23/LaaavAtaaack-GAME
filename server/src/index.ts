import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { GAME_STATUS, GRAVITY, Lava, Platform, TICK_RATE } from './enums/enum.js';
import { Player } from './enums/Player.js';
import { changeGravity, runPhysics } from './physics/physicEngine.js';
import { checkPlatformCollision, handleBoundaries, handleShove } from './logic/gameLogic.js';
import { addPlayer, removePlayer } from './logic/playerManager.js';
import { generateMap, updatePlatforms } from './logic/platformLogic.js';
import { generateLava, getLavaDirection, updateLava } from './logic/lavaLogic.js';

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

let players: Record<string, Player> = {};
let gameState: GAME_STATUS = GAME_STATUS.WAITING;
let gravDir = { x: 0, y: GRAVITY };
let platforms: Platform[] = generateMap();
let lava: Lava = generateLava(getLavaDirection(gravDir));
io.on('connection', socket => {
    socket.on('join', name => {
        const player = addPlayer(players, socket.id, name);
        socket.emit('init', { id: socket.id, isLeader: player.isLeader });
        io.emit('message', `${player.name} joined the camp!`);
    });

    socket.on('input', input => {
        if (players[socket.id]) players[socket.id].input = input;
    });

    socket.on('start_game', () => {
        if (players[socket.id]?.isLeader) {
            gameState = GAME_STATUS.PLAY;
            io.emit('message', 'Game Started!');
        }
    });

    socket.on('disconnect', () => {
        const { name, newLeaderId } = removePlayer(players, socket.id);
        if (name) io.emit('message', `${name} left.`);
        if (newLeaderId) io.to(newLeaderId).emit('leader_update', true);
    });
});

setInterval(() => {
    if (gameState === GAME_STATUS.PLAY) {
        const now = Date.now();
        if (now - lastGravityTime >= nextGravityChange) {
            gravDir = changeGravity(gravDir);
            lava = generateLava(getLavaDirection(gravDir));
            lastGravityTime = now;
            nextGravityChange = getRandomInterval();
            io.emit('message', `Gravity shifted!`);
        }
        const playersArray = Object.values(players);
        updatePlatforms(platforms, gravDir);
        updateLava(lava);
        playersArray.forEach(player => {
            runPhysics(player, gravDir);
            const isStanding = checkPlatformCollision(player, platforms, gravDir);
            player.canJumpOnPlatform = isStanding;
            handleBoundaries(player);
            handleShove(player, playersArray);
        });
    }

    io.emit('state', { players, gameState, gravDir, platforms, lava });
}, 1000 / TICK_RATE);

httpServer.listen(2567, () => console.log('Server running on port 2567'));

let nextGravityChange = getRandomInterval();
function getRandomInterval(): number {
    return (Math.random() * 7 + 3) * 1000;
}
let lastGravityTime = Date.now();
