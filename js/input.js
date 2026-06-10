// js/input.js
export class InputHandler {
    constructor(canvas) {
        this.keys = {};
        this.justPressed = {};
        this.click = null; // Ide mentjük a legutóbbi kattintást

        window.addEventListener('keydown', (e) => {
            const key = e.code;
            if (!this.keys[key]) {
                this.justPressed[key] = true;
            }
            this.keys[key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.justPressed[e.code] = false;
        });

        // Egérkattintás figyelése a Canvas-en belül
        if (canvas) {
            canvas.addEventListener('click', (e) => {
                const rect = canvas.getBoundingClientRect();
                // BIZTONSÁGI MATEMATIKA: Skálázzuk a kattintást a CSS-méretről a belső 950x600-as felbontásra
                const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                const y = (e.clientY - rect.top) * (canvas.height / rect.height);
                this.click = { x, y };
            });
        }
    }

    // Ellenőrzi, hogy a gomb le van-e nyomva (folyamatos mozgáshoz)
    isHeld(keyCode) {
        return !!this.keys[keyCode];
    }

    // Csak egyszer fut le a gomb megnyomásának pillanatában (ugráshoz/dash-hez)
    isJustPressed(keyCode) {
        if (this.justPressed[keyCode]) {
            this.justPressed[keyCode] = false; // Azonnal elfogyasztjuk az eseményt
            return true;
        }
        return false;
    }

    // Lekéri és azonnal törli a legutóbbi kattintást, hogy ne fusson le többször
    getClick() {
        const c = this.click;
        this.click = null;
        return c;
    }
}