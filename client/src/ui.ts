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

export function updateUI(state: any, statusEl: HTMLElement, startBtn: HTMLButtonElement, isLeader: boolean, myId: string) {
    statusEl.innerText = `Status: ${state.gameState.toUpperCase()}`;
    if (isLeader && state.gameState === GAME_STATUS.WAITING) {
        startBtn.style.display = 'block';
    } else {
        startBtn.style.display = 'none';
    }

    let timerEl = document.getElementById('round-timer');
    if (!timerEl) {
        timerEl = document.createElement('div');
        timerEl.id = 'round-timer';
        timerEl.style.position = 'absolute';
        timerEl.style.top = '10px';
        timerEl.style.right = '10px';
        timerEl.style.fontSize = '28px';
        timerEl.style.fontWeight = 'bold';
        timerEl.style.color = '#ffcc00';
        timerEl.style.backgroundColor = 'rgba(0,0,0,0.7)';
        timerEl.style.padding = '10px 20px';
        timerEl.style.borderRadius = '8px';
        timerEl.style.border = '2px solid #ffcc00';
        document.body.appendChild(timerEl);
    }

    if (state.gameState === GAME_STATUS.PLAY) {
        const myPlayer = state.players[myId];
        let displayTime = 0;
        
        if (myPlayer) {
            // Якщо гравець живий, його час = сума за минулі раунди + час поточного раунду
            // Якщо мертвий, показуємо його фінальний totalSurvivalTime (який сервер зафіксував при смерті)
            if (myPlayer.isAlive) {
                displayTime = myPlayer.totalSurvivalTime + state.roundTimer;
            } else {
                displayTime = myPlayer.totalSurvivalTime;
            }
        }

        timerEl.innerHTML = `<div style="font-size: 14px; color: #aaa;">ROUND ${state.currentRound}/3</div>
                             <div>${displayTime.toFixed(1)}s</div>`;
        timerEl.style.display = 'block';
    } else {
        timerEl.style.display = 'none';
    }

    let leaderboardEl = document.getElementById('leaderboard');
    if (!leaderboardEl) {
        leaderboardEl = document.createElement('div');
        leaderboardEl.id = 'leaderboard';
        leaderboardEl.style.position = 'absolute';
        leaderboardEl.style.top = '60px';
        leaderboardEl.style.right = '10px';
        leaderboardEl.style.color = 'white';
        leaderboardEl.style.backgroundColor = 'rgba(0,0,0,0.5)';
        leaderboardEl.style.padding = '10px';
        leaderboardEl.style.borderRadius = '5px';
        leaderboardEl.style.fontSize = '14px';
        leaderboardEl.style.textAlign = 'right';
        document.body.appendChild(leaderboardEl);
    }

    if (state.gameState === GAME_STATUS.PLAY) {
        leaderboardEl.style.display = 'block';
        const playerList = (Object.values(state.players) as any[]).map(p => ({
            ...p,
            currentTotal: p.isAlive ? p.totalSurvivalTime + state.roundTimer : p.totalSurvivalTime
        }));
        playerList.sort((a, b) => b.currentTotal - a.currentTotal);
        
        leaderboardEl.innerHTML = '<strong>Leaderboard:</strong><br>' + 
            playerList.map(p => `${p.isAlive ? '🟢' : '💀'} ${p.name}: ${p.currentTotal.toFixed(1)}s`).join('<br>');
    } else {
        leaderboardEl.style.display = 'none';
    }
}
