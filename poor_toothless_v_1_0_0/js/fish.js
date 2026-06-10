// js/fish.js
export class Fish {
    constructor(x, y, type = 'regular') {
        this.width = 30;
        this.height = 20;
        this.x = x;
        this.y = y;
        this.type = type; // 'regular', 'gold' vagy 'eel'

        // Textúra kiválasztása típus alapján
        this.texture = new Image();
        if (this.type === 'gold') {
            this.texture.src = 'assets/goldfish.png';
        } else if (this.type === 'eel') {
            this.texture.src = 'assets/eel.png'; // Saját textúra előkészítése
        } else {
            this.texture.src = 'assets/fish.png';
        }
    }

    draw(ctx) {
        if (this.texture.complete && this.texture.naturalWidth !== 0) {
            ctx.drawImage(this.texture, this.x, this.y, this.width, this.height);
        } else {
            // PLACEHOLDER MÓD
            ctx.save();
            
            // Színbeállítás típus alapján
            let bodyColor = '#e67e22'; // Sima hal: Narancs
            let finColor = '#d35400';
            
            if (this.type === 'gold') {
                bodyColor = '#f1c40f';  // Aranyhal: Arany/Sárga
                finColor = '#f39c12';
            } else if (this.type === 'eel') {
                bodyColor = '#e74c3c';  // ANGOLNA PLACEHOLDER: Vadító Piros
                finColor = '#c0392b';
            }

            // Hal teste
            ctx.fillStyle = bodyColor; 
            ctx.fillRect(this.x, this.y, this.width - 8, this.height);

            // Hal uszonya
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.height / 2);
            ctx.lineTo(this.x - 6, this.y);
            ctx.lineTo(this.x - 6, this.y + this.height);
            ctx.closePath();
            ctx.fillStyle = finColor;
            ctx.fill();

            // Hal szeme
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(this.x + this.width - 14, this.y + 4, 4, 4);

            ctx.restore();
        }
    }
}