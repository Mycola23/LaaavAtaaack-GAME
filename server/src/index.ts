import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { GAME_STATUS, GRAVITY, Lava, Platform, TICK_RATE, WORLD_SIZE } from './enums/enum.js';
import { Player } from './enums/Player.js';
import { changeGravity, runPhysics } from './physics/physicEngine.js';
import { checkPlatformCollision, handleBoundaries, handleShove } from './logic/gameLogic.js';
import { addPlayer, removePlayer } from './logic/playerManager.js';
import { generateMap, updatePlatforms } from './logic/platformLogic.js';
import { generateLava, getLavaDirection, updateLava } from './logic/lavaLogic.js';

const app = express();
const httpServer = createServer(app);
const FRONTEND_URL = 'https://laaav-ataaaack-game.vercel.app';
app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true,
    }),
);

const io = new Server(httpServer, {
    cors: {
        origin: FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true,
    },
    allowEIO3: true,
});

let players: Record<string, Player> = {};
let gameState: GAME_STATUS = GAME_STATUS.WAITING;
let gravDir = { x: 0, y: GRAVITY };
let platforms: Platform[] = generateMap();
let lava: Lava = generateLava(getLavaDirection(gravDir));

let currentRound = 1;
const TOTAL_ROUNDS = 3;
let roundStartTime = 0;
let roundTimer = 0;

function resetRound() {
    Object.values(players).forEach(p => {
        p.isAlive = true;
        p.survivalTime = 0;
        p.x = WORLD_SIZE / 2;
        p.y = WORLD_SIZE / 2;
        p.vx = 0;
        p.vy = 0;
    });
    platforms = generateMap();
    lava = generateLava(getLavaDirection(gravDir));
    roundTimer = 0;
    roundStartTime = Date.now();
    lastGravityTime = Date.now();
    nextGravityChange = getRandomInterval();
}

function checkRoundEnd() {
    const playersArray = Object.values(players);
    if (playersArray.length === 0) return;

    const alivePlayers = playersArray.filter(p => p.isAlive);
    if (alivePlayers.length === 0) {
        if (currentRound < TOTAL_ROUNDS) {
            currentRound++;
            io.emit('message', `Round ${currentRound} starting!`);
            resetRound();
        } else {
            gameState = GAME_STATUS.WAITING;
            const winner = playersArray.reduce((prev, current) => (prev.totalSurvivalTime > current.totalSurvivalTime ? prev : current));
            io.emit('game_over', {
                winner: { name: winner.name, score: winner.totalSurvivalTime },
                allPlayers: playersArray.map(p => ({ name: p.name, totalSurvivalTime: p.totalSurvivalTime })),
            });
            io.emit('message', `Game Over! Winner: ${winner.name} with ${winner.totalSurvivalTime.toFixed(1)}s!`);
            currentRound = 1;
            playersArray.forEach(p => (p.totalSurvivalTime = 0));
        }
    }
}

io.on('connection', socket => {
    // ... (код join та input)
    socket.on('join', name => {
        const nameTaken = Object.values(players).some(p => p.name === name);
        if (nameTaken) {
            socket.emit('name_taken');
            return;
        }
        const player = addPlayer(players, socket.id, name);
        if (gameState === GAME_STATUS.PLAY) {
            player.isAlive = false;
        }
        socket.emit('init', { id: socket.id, isLeader: player.isLeader });
        io.emit('message', `${player.name} joined the camp!`);
    });

    socket.on('input', input => {
        if (players[socket.id]) players[socket.id].input = input;
    });

    socket.on('start_game', () => {
        if (players[socket.id]?.isLeader) {
            gameState = GAME_STATUS.PLAY;
            currentRound = 1;
            Object.values(players).forEach(p => (p.totalSurvivalTime = 0));
            resetRound();
            io.emit('message', 'Game Started!');
        }
    });

    socket.on('touched_lava', () => {
        if (players[socket.id] && players[socket.id].isAlive && gameState === GAME_STATUS.PLAY) {
            players[socket.id].isAlive = false;
            players[socket.id].survivalTime = roundTimer;
            players[socket.id].totalSurvivalTime += roundTimer;
            io.emit('message', `${players[socket.id].name} fell into lava!`);
            checkRoundEnd();
        }
    });

    socket.on('start_pause', () => {
        if (players[socket.id]?.isLeader) {
            gameState = GAME_STATUS.PAUSE;
            io.emit('message', `${players[socket.id].name} paused game!`);
            io.emit('show_pause-screen');
        }
    });

    socket.on('end_pause', () => {
        if (players[socket.id]?.isLeader) {
            gameState = GAME_STATUS.PLAY;
            io.emit('message', `${players[socket.id].name} continue game!`);
            io.emit('hide_pause-screen');
        }
    });

    socket.on('disconnect', () => {
        const player = players[socket.id];
        if (player && player.isAlive && gameState === GAME_STATUS.PLAY) {
            player.totalSurvivalTime += roundTimer;
        }
        const { name, newLeaderId } = removePlayer(players, socket.id);
        if (name) io.emit('message', `${name} left.`);
        if (newLeaderId) io.to(newLeaderId).emit('leader_update', true);
        if (gameState === GAME_STATUS.PLAY) checkRoundEnd();
    });
});

setInterval(() => {
    if (gameState === GAME_STATUS.PLAY) {
        roundTimer = (Date.now() - roundStartTime) / 1000;
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
            if (!player.isAlive) return;
            runPhysics(player, gravDir);
            const isStanding = checkPlatformCollision(player, platforms, gravDir);
            player.canJumpOnPlatform = isStanding;
            handleBoundaries(player);
            handleShove(player, playersArray);
        });
    }

    io.emit('state', { players, gameState, gravDir, platforms, lava, roundTimer, currentRound });
}, 1000 / TICK_RATE);

const PORT = process.env.PORT || 2567;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

let nextGravityChange = getRandomInterval();
function getRandomInterval(): number {
    return (Math.random() * 7 + 3) * 1000;
}
let lastGravityTime = Date.now();
