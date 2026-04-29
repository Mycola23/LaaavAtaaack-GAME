import { GAME_STATUS } from './enums/enum';

export function displayMessage(msg: string, container: HTMLElement) {
    const div = document.createElement('div');
    div.className = 'msg';
    div.innerText = msg;

    if (msg.includes('приєднав'))                                        div.classList.add('join');
    else if (msg.includes('вийшов') || msg.includes('впав'))             div.classList.add('leave');
    else if (msg.includes('штовхнув') || msg.includes('вдарив'))         div.classList.add('push');
    else if (msg.includes('почалась') || msg.includes('переміг'))        div.classList.add('game');

    container.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

export function updateUI(state: any, statusEl: HTMLElement, startBtn: HTMLButtonElement, isLeader: boolean) {
    statusEl.innerText = `Status: ${state.gameState.toUpperCase()}`;
    if (isLeader && state.gameState === GAME_STATUS.WAITING) {
        startBtn.style.display = 'block';
    } else {
        startBtn.style.display = 'none';
    }
}
