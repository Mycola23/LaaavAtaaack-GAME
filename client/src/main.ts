import { io } from 'socket.io-client';
import { setupInput } from './input.ts';
import { createLava, updateLava, updatePlatforms, updatePlayers } from './renderer.ts';
import { displayMessage, updateUI } from './ui.ts';
import { PLAYER_SIZE } from './enums/enum.ts';

let lastState: any = null;
const socket = io('http://localhost:2567');

const container = document.getElementById('game-container')!;
const statusEl = document.getElementById('status')!;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const messagesEl = document.getElementById('messages')!;

let myId: string;
let isLeader = false;
const playerElements: Record<string, HTMLElement> = {};
const platformElements: HTMLElement[] = [];
let lavaElement: HTMLElement | null = null;

const loginOverlay = document.getElementById('login-overlay')!;
const nameInput = document.getElementById('name-input') as HTMLInputElement;
const joinBtn = document.getElementById('join-btn') as HTMLButtonElement;
const uiContainer = document.getElementById('ui')!;

joinBtn.onclick = () => {
    const name = nameInput.value.trim() || 'Quadrober';
    socket.emit('join', name);
    loginOverlay.style.display = 'none';
    uiContainer.style.display = 'flex';
};

// Також дозволимо вхід по натисканню Enter
nameInput.onkeydown = (e) => {
    if (e.key === 'Enter') joinBtn.click();
};

socket.on('init', data => {
    myId = data.id;
    isLeader = data.isLeader;
    setupInput(socket);
});

socket.on('leader_update', status => {
    isLeader = status;
});

socket.on('message', msg => displayMessage(msg, messagesEl));

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
            player.x < lava.x + lava.width &&
            player.x + PLAYER_SIZE > lava.x &&
            player.y < lava.y + lava.height &&
            player.y + PLAYER_SIZE > lava.y;
        
        if (collided) {
            socket.emit('touched_lava');
        }
    }
});

startBtn.onclick = () => socket.emit('start_game');

window.onresize = () => {
    if (!lastState) return;
    updatePlayers(lastState, playerElements, container, myId);
    updatePlatforms(lastState, platformElements, container);
    if (lastState.lava && lavaElement) {
        updateLava(lastState, lavaElement, container);
    }
    console.log('Resized: positions recalculated');
};
