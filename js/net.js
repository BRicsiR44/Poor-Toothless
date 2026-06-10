// js/net.js
export class Net {
    constructor(canvasWidth, canvasHeight) {
        // Vízszintesen relatív széles (90px), függőlegesen nagyon vékony (6px) hitbox / vonal
        this.width = 90;
        this.height = 6;
        
        // Fentről érkezik, teljesen véletlenszerű vízszintes pozícióból
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = -this.height;
        
        // Mozgás: csak függőlegesen lefelé, kifejezetten lassan
        this.vx = 0; 
        this.vy = Math.random() * 0.6 + 1.2; // 1.2 és 1.8 közötti lassú sebesség

        // Textúra előkészítése
        this.texture = new Image();
        this.texture.src = 'assets/net.png';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    // Ellenőrzi, hogy a háló teljesen elhagyta-e a képernyőt ALUL
    isOutOfBounds(canvasWidth, canvasHeight) {
        return this.y > canvasHeight;
    }

    draw(ctx) {
        if (this.texture.complete && this.texture.naturalWidth !== 0) {
            ctx.drawImage(this.texture, this.x, this.y, this.width, this.height);
        } else {
            // PLACEHOLDER: Vízszintes, széles téglalap / vastag vonal, ami pontosan a hitbox
            ctx.save();
            ctx.fillStyle = '#e67e22'; // Narancssárgás/barna hálószín
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // Finom rácsvonalak a placeholderen belül, hogy vizuálisan hálónak tűnjön
            ctx.strokeStyle = '#d35400';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = this.x + 10; i < this.x + this.width; i += 15) {
                ctx.moveTo(i, this.y);
                ctx.lineTo(i, this.y + this.height);
            }
            ctx.stroke();
            ctx.restore();
        }
    }
}