import { WORLD_SIZE } from './enums/enum';

export function updatePlayers(state: any, playerElements: Record<string, HTMLElement>, container: HTMLElement, myId: string) {
    for (const id in state.players) {
        const p = state.players[id];

        if (!playerElements[id]) {
            playerElements[id] = createPlayerDOM(p.name, container);
        }

        const el = playerElements[id];
        const isMe = id === myId;

        const xPercent = p.x / (WORLD_SIZE / 100);
        const yPercent = p.y / (WORLD_SIZE / 100);

        const posX = xPercent * (container.clientWidth / 100);
        const posY = yPercent * (container.clientHeight / 100);

        el.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
        el.style.background = isMe ? '#28a745' : '#007bff';
        el.style.zIndex = isMe ? '10' : '1';
    }

    for (const id in playerElements) {
        if (!state.players[id]) {
            playerElements[id].remove();
            delete playerElements[id];
        }
    }
}

function createPlayerDOM(name: string, container: HTMLElement): HTMLElement {
    const el = document.createElement('div');
    el.className = 'player';
    el.innerHTML = `<span class="player-name">${name}</span>`;
    container.appendChild(el);
    return el;
}
