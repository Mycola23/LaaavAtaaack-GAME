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
    container.prepend(el);
    return el;
}

export function updatePlatforms(state: any, platformElements: HTMLElement[], container: HTMLElement) {
    const serverPlatforms = state.platforms || [];

    serverPlatforms.forEach((p: any, index: number) => {
        if (!platformElements[index]) {
            platformElements[index] = createPlatformDOM(container);
        }

        const el = platformElements[index];

        const xPercent = (p.x / WORLD_SIZE) * 100;
        const yPercent = (p.y / WORLD_SIZE) * 100;
        const wPercent = (p.width / WORLD_SIZE) * 100;
        const hPercent = (p.height / WORLD_SIZE) * 100;

        const posX = xPercent * (container.clientWidth / 100);
        const posY = yPercent * (container.clientHeight / 100);
        const width = wPercent * (container.clientWidth / 100);
        const height = hPercent * (container.clientHeight / 100);

        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        el.style.backgroundColor = p.color;

        el.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
    });

    while (platformElements.length > serverPlatforms.length) {
        const el = platformElements.pop();
        if (el) el.remove();
    }
}

function createPlatformDOM(container: HTMLElement): HTMLElement {
    const el = document.createElement('div');
    el.className = 'platform';
    container.appendChild(el);
    return el;
}

export function createLava(container: HTMLElement): HTMLElement {
    const el = document.createElement('div');
    el.className = 'lava';
    container.appendChild(el);
    return el;
}

export function updateLava(state: any, lavaElement: HTMLElement, container: HTMLElement) {
    const lava = state.lava;
    const scale = container.clientWidth / WORLD_SIZE;

    lavaElement.style.width = `${lava.width * scale}px`;
    lavaElement.style.height = `${lava.height * scale}px`;
    lavaElement.style.backgroundColor = lava.color;
    lavaElement.style.transform = `translate3d(${lava.x * scale}px, ${lava.y * scale}px, 0)`;
}
