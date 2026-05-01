import { io } from 'socket.io-client';
import { setupInput } from './input.ts';
import { createLava, updateLava, updatePlatforms, updatePlayers } from './renderer.ts';
import { displayMessage, updateUI } from './ui.ts';
import { GAME_STATUS, PLAYER_SIZE } from './enums/enum.ts';

let lastState: any = null;
const socket = io('http://localhost:2567');

const container = document.getElementById('game-container')!;
const statusEl = document.getElementById('status')!;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
const messagesEl = document.getElementById('messages')!;

let myId: string;
let isLeader: boolean = false;
const playerElements: Record<string, HTMLElement> = {};
const platformElements: HTMLElement[] = [];
let lavaElement: HTMLElement | null = null;

const loginOverlay = document.getElementById('login-overlay')!;
const nameInput = document.getElementById('name-input') as HTMLInputElement;
const joinBtn = document.getElementById('join-btn') as HTMLButtonElement;
const uiContainer = document.getElementById('ui')!;

joinBtn.onclick = () => {
    const name = nameInput.value.trim() || 'Quadrober';
    if (!name) {
        nameInput.placeholder = `Ім'я не може бути порожнім`;
        return;
    }
    socket.emit('join', name);
    loginOverlay.style.display = 'none';
    uiContainer.style.display = 'flex';
};

nameInput.onkeydown = e => {
    if (e.key === 'Enter') joinBtn.click();
};

socket.on('init', data => {
    myId = data.id;
    isLeader = data.isLeader;
    setupInput(socket);
});

socket.on('name_taken', () => {
    loginOverlay.style.display = `flex`;
    uiContainer.style.display = `none`;
    nameInput.value = '';
    nameInput.style.width = `325px`;
    nameInput.placeholder = `Ім'я зайняте, придумайте щось цікавіше`;
});

socket.on('leader_update', status => {
    isLeader = status;
});

socket.on('message', msg => displayMessage(msg, messagesEl));

const resultsScreen = document.getElementById('results-screen')!;
const winnerNameBig = document.getElementById('winner-name-big')!;
const winnerScoreBig = document.getElementById('winner-score-big')!;
const finalStatsList = document.getElementById('final-stats-list')!;
const restartBtnUi = document.getElementById('restart-btn-ui')!;

restartBtnUi.onclick = () => {
    location.reload();
};

socket.on('game_over', data => {
    winnerNameBig.innerText = data.winner.name;
    winnerScoreBig.innerText = `${data.winner.score.toFixed(1)}s`;

    finalStatsList.innerHTML = data.allPlayers
        .sort((a: any, b: any) => b.totalSurvivalTime - a.totalSurvivalTime)
        .map(
            (p: any) => `
            <div class="stat-item">
                <span>${p.name}</span>
                <span>${p.totalSurvivalTime.toFixed(1)}s</span>
            </div>
        `,
        )
        .join('');

    resultsScreen.style.display = 'flex';
});

socket.on('state', state => {
    lastState = state;
    updateUI(state, statusEl, startBtn, isLeader, myId);
    updatePlayers(state, playerElements, container, myId);
    updatePlatforms(state, platformElements, container);
    if (state.lava) {
        if (!lavaElement) {
            lavaElement = createLava(container);
        }
        updateLava(state, lavaElement, container);
    }

    if (myId && state.players[myId]?.isAlive && state.lava) {
        const player = state.players[myId];
        const lava = state.lava;
        const collided =
            player.x < lava.x + lava.width && player.x + PLAYER_SIZE > lava.x && player.y < lava.y + lava.height && player.y + PLAYER_SIZE > lava.y;

        if (collided) {
            socket.emit('touched_lava');
        }
    }
});

startBtn.onclick = () => socket.emit('start_game');
pauseBtn.onclick = () => {
    pauseBtn.blur();
    if (lastState.gameState !== GAME_STATUS.PAUSE) {
        socket.emit('start_pause');
        return;
    }
    socket.emit('end_pause');
    return;
};
window.onresize = () => {
    if (!lastState) return;
    updatePlayers(lastState, playerElements, container, myId);
    updatePlatforms(lastState, platformElements, container);
    if (lastState.lava && lavaElement) {
        updateLava(lastState, lavaElement, container);
    }
    console.log('Resized: positions recalculated');
};
