export function displayMessage(msg: string, container: HTMLElement) {
    const div = document.createElement('div');
    div.innerText = msg;
    container.appendChild(div);
    setTimeout(() => div.remove(), 5000);
}

export function updateUI(state: any, statusEl: HTMLElement, startBtn: HTMLButtonElement, isLeader: boolean) {
    statusEl.innerText = `Status: ${state.gameState.toUpperCase()}`;
    if (isLeader && state.gameState === 'waiting') {
        startBtn.style.display = 'block';
    } else {
        startBtn.style.display = 'none';
    }
}
