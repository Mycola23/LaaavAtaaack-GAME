import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { GAME_STATUS, GRAVITY, TICK_RATE } from './enums/enum.js';
import { Player } from './enums/Player.js';
import { runPhysics } from './physics/physicEngine.js';
import { handleBoundaries, handleShove } from './logic/gameLogic.js';
import { addPlayer, removePlayer } from './logic/playerManager.js';

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

let players: Record<string, Player> = {};
let gameState: GAME_STATUS = GAME_STATUS.WAITING;
let gravDir = { x: 0, y: GRAVITY };

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
        const playersArray = Object.values(players);
        playersArray.forEach(player => {
            runPhysics(player, gravDir);
            handleBoundaries(player);
            handleShove(player, playersArray);
        });
    }

    io.emit('state', { players, gameState, gravDir });
}, 1000 / TICK_RATE);

httpServer.listen(2567, () => console.log('Server running on port 2567'));
