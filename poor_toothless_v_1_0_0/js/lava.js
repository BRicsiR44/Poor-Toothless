// js/lava.js

// Képek betöltése globálisan
const lavaEruptionImg = new Image();
lavaEruptionImg.src = 'assets/lava_eruption.png';

const lavaHotGroundImg = new Image();
lavaHotGroundImg.src = 'assets/lava_hot_ground.png';

export class LavaBurst {
    constructor(platform) {
        this.platform = platform; //
        this.width = Math.min(60, platform.width); //
        this.x = platform.x + Math.random() * (platform.width - this.width); //
        this.y = platform.y; //

        this.state = 'warning'; //
        this.timer = 0; //

        this.warningMax = 1500;   //
        this.eruptionMax = 600;   //
        this.hotGroundMax = 1800; //
        this.eruptionHeight = 110; //

        this.hasHitPlayerInEruption = false; //
        this.hotGroundDamageCooldown = 0; //
    }

    update(deltaTime) {
        this.timer += deltaTime; //

        if (this.state === 'warning') { //
            if (this.timer >= this.warningMax) { //
                this.state = 'eruption'; //
                this.timer = 0; //
            }
        } else if (this.state === 'eruption') { //
            if (this.timer >= this.eruptionMax) { //
                this.state = 'hot_ground'; //
                this.timer = 0; //
            }
        } else if (this.state === 'hot_ground') { //
            if (this.hotGroundDamageCooldown > 0) { //
                this.hotGroundDamageCooldown -= deltaTime; //
            }
            if (this.timer >= this.hotGroundMax) { //
                this.state = 'dead'; //
            }
        }
    }

    draw(ctx) {
        ctx.save();
        
        if (this.state === 'warning') {
            // AZ EREDETI WARNING LOGIKA (mindig megmarad vektorosan, ahogy kérted)
            const pulse = Math.floor(this.timer / 120) % 2 === 0; //
            ctx.fillStyle = pulse ? '#f1c40f' : '#e67e22'; //
            ctx.fillRect(this.x, this.y - 4, this.width, 4); //
            
            ctx.strokeStyle = 'rgba(230, 126, 34, 0.3)'; //
            ctx.lineWidth = 2; //
            ctx.setLineDash([4, 6]); //
            ctx.beginPath(); //
            ctx.moveTo(this.x + this.width / 2, this.y); //
            ctx.lineTo(this.x + this.width / 2, this.y - 30); //
            ctx.stroke(); //

        } else if (this.state === 'eruption') {
            // KITÖRÉS FÁZIS
            if (lavaEruptionImg.complete && lavaEruptionImg.naturalWidth !== 0) {
                ctx.drawImage(lavaEruptionImg, this.x, this.y - this.eruptionHeight, this.width, this.eruptionHeight);
            } else {
                // EREDETI SZÍNATMENETES PLACEHOLDER FALLBACK
                let gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y - this.eruptionHeight); //
                gradient.addColorStop(0, '#e74c3c'); // Alul tűzvörös
                gradient.addColorStop(0.4, '#e67e22'); // Középen narancs
                gradient.addColorStop(1, 'rgba(241, 196, 15, 0.15)'); // A teteje elhalványuló sárga
                ctx.fillStyle = gradient; //
                ctx.fillRect(this.x, this.y - this.eruptionHeight, this.width, this.eruptionHeight); //
            }

        } else if (this.state === 'hot_ground') {
            // FORRÓ TALAJ FÁZIS
            if (lavaHotGroundImg.complete && lavaHotGroundImg.naturalWidth !== 0) {
                ctx.drawImage(lavaHotGroundImg, this.x, this.y - 6, this.width, 6);
            } else {
                // EREDETI PARÁZS EFFEKT PLACEHOLDER FALLBACK
                ctx.fillStyle = '#c0392b'; //
                ctx.fillRect(this.x, this.y - 6, this.width, 6); //
                if (Math.random() > 0.4) { //
                    ctx.fillStyle = '#f1c40f'; //
                    ctx.fillRect(this.x + Math.random() * this.width, this.y - 5, 2, 2); //
                }
            }
        }
        
        ctx.restore();
    }

    getHitbox() {
        if (this.state === 'eruption') { //
            return {
                x: this.x, //
                y: this.y - this.eruptionHeight, //
                width: this.width, //
                height: this.eruptionHeight //
            };
        } else if (this.state === 'hot_ground') { //
            return {
                x: this.x, //
                y: this.y - 6, //
                width: this.width, //
                height: 6 //
            };
        }
        return null; //
    }
}