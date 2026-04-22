export const keys = { up: false, down: false, left: false, right: false, jump: false, shove: false };

export function setupInput(socket: any) {
    const updateKey = (code: string, pressed: boolean) => {
        let changed = false;
        if (code === 'KeyW' || code === 'ArrowUp') {
            keys.up = pressed;
            changed = true;
        }
        if (code === 'KeyS' || code === 'ArrowDown') {
            keys.down = pressed;
            changed = true;
        }
        if (code === 'KeyA' || code === 'ArrowLeft') {
            keys.left = pressed;
            changed = true;
        }
        if (code === 'KeyD' || code === 'ArrowRight') {
            keys.right = pressed;
            changed = true;
        }
        if (code === 'Space') {
            keys.jump = pressed;
            changed = true;
        }
        if (code === 'KeyE') {
            keys.shove = pressed;
            changed = true;
        }

        if (changed) {
            socket.emit('input', keys);
        }
    };

    window.onkeydown = e => updateKey(e.code, true);
    window.onkeyup = e => updateKey(e.code, false);
}
