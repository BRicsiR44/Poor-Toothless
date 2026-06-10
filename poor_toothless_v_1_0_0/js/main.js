// js/main.js
import { Game } from './game.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("A gameCanvas elem nem található!");
        return;
    }
    
    const ctx = canvas.getContext('2d');

    // A játék példányosítása (átadjuk neki a vásznat és a rajzoló környezetet)
    const game = new Game(canvas, ctx);
    
    // BUMM! Elindítjuk a játékot
    game.start();
});