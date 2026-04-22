import { io } from 'socket.io-client';
import { setupInput } from './input.ts';
import { updatePlayers } from './renderer.ts';
import { displayMessage, updateUI } from './ui.ts';
let lastState: any = null;
const socket = io('http://localhost:2567');

const container = document.getElementById('game-container')!;
const statusEl = document.getElementById('status')!;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const messagesEl = document.getElementById('messages')!;

let myId: string;
let isLeader = false;
const playerElements: Record<string, HTMLElement> = {};

const name = prompt('Enter your name:') || 'Quadrober';
socket.emit('join', name);

//
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
    updateUI(state, statusEl, startBtn, isLeader);
    updatePlayers(state, playerElements, container, myId);
});

startBtn.onclick = () => socket.emit('start_game');

window.onresize = () => {
    if (!lastState) return;
    updatePlayers(lastState, playerElements, container, myId);
    console.log('Resized: positions recalculated');
};
