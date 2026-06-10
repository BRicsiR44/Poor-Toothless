// js/projectiles.js

// Képek betöltése globálisan
const arrowRightImg = new Image();
arrowRightImg.src = 'assets/arrow_right.png';

const arrowLeftImg = new Image();
arrowLeftImg.src = 'assets/arrow_left.png';

const stoneImg = new Image();
stoneImg.src = 'assets/stone.png';

export class Arrow {
    constructor(x, y, side) {
        this.width = 35; //
        this.height = 8; //
        this.x = x; //
        this.y = y; //
        this.side = side; // 'left' vagy 'right'
        this.speed = 6.5; //
        this.vx = side === 'left' ? this.speed : -this.speed; //
    }

    update(timeStep) {
        const factor = timeStep / (1000 / 60); //
        this.x += this.vx * factor; //
    }

    draw(ctx) {
        ctx.save();
        
        // Kiválasztjuk a megfelelő irányú képet ellenőrzésre
        const currentImg = this.side === 'left' ? arrowRightImg : arrowLeftImg;

        // BIZTONSÁGI ELLENŐRZÉS: Csak akkor rajzolunk képet, ha az sikeresen betöltődött
        if (currentImg.complete && currentImg.naturalWidth !== 0) {
            if (this.side === 'left') {
                ctx.drawImage(arrowRightImg, this.x, this.y - 4, this.width + 10, this.height + 8);
            } else {
                ctx.drawImage(arrowLeftImg, this.x - 10, this.y - 4, this.width + 10, this.height + 8);
            }
        } else {
            // --- EREDETI BIZTONSÁGI PLACEHOLDER (Ha a kép még nincs meg, ez menti meg a játékot) ---
            ctx.fillStyle = '#8e44ad'; // Lila test
            ctx.fillRect(this.x, this.y, this.width, this.height); //

            ctx.fillStyle = '#f1c40f'; // Sárga nyílhegy
            ctx.beginPath(); //
            if (this.side === 'left') { //
                ctx.moveTo(this.x + this.width, this.y - 4); //
                ctx.lineTo(this.x + this.width + 10, this.y + this.height / 2); //
                ctx.lineTo(this.x + this.width, this.y + this.height + 4); //
            } else { //
                ctx.moveTo(this.x, this.y - 4); //
                ctx.lineTo(this.x - 10, this.y + this.height / 2); //
                ctx.lineTo(this.x, this.y + this.height + 4); //
            }
            ctx.fill(); //
        }
        
        ctx.restore();
    }
}

export class Stone {
    constructor(x, y, vx) {
        this.width = 24; //
        this.height = 24; //
        this.x = x; //
        this.y = y; //
        this.vx = vx; //
        this.vy = 4.5; //
    }

    update(timeStep) {
        const factor = timeStep / (1000 / 60); //
        this.x += this.vx * factor; //
        this.y += this.vy * factor; //
    }

    draw(ctx) {
        ctx.save();
        
        // Biztonsági ellenőrzés a kő képére
        if (stoneImg.complete && stoneImg.naturalWidth !== 0) {
            ctx.drawImage(stoneImg, this.x, this.y, this.width, this.height);
        } else {
            // EREDETI BIZTONSÁGI PLACEHOLDER (Szürke kör/kő forma)
            ctx.fillStyle = '#7f8c8d';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}