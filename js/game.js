// js/game.js
import { Player } from './player.js';
import { InputHandler } from './input.js';
import { Fish } from './fish.js';
import { LavaBurst } from './lava.js';
import { Arrow, Stone } from './projectiles.js';
import { Net } from './net.js'; 

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;

        // Átadom a vásznat az InputHandlernek a kattintások pontos méréséhez
        this.input = new InputHandler(this.canvas); 
        this.player = new Player(this.width, this.height);

        this.lastTime = 0;
        this.score = 0;

        this.accumulator = 0;
        this.timeStep = 1000 / 60; 

        // ÚJ: Játék állapotgép zóna ('MENU', 'PLAYING', 'GAMEOVER')
        this.gameState = 'MENU';

        // --- PLATFORMOK ---
        const pW = 120; 
        const pH = 20;  
        this.platforms = [];

        for (let floorX = 0; floorX < this.width; floorX += pW) {
            this.platforms.push({ x: floorX, y: this.height - pH, width: pW, height: pH });
        }

        this.platforms.push(
            { x: 60, y: 450, width: pW, height: pH },                         
            { x: this.width - 180, y: 450, width: pW, height: pH },           
            { x: this.width / 2 - 60, y: 370, width: pW, height: pH },        
            { x: 160, y: 280, width: pW, height: pH },                        
            { x: this.width - 280, y: 280, width: pW, height: pH },           
            { x: 40, y: 180, width: pW, height: pH },                          
            { x: this.width - 160, y: 180, width: pW, height: pH },            
            { x: this.width / 2 - 60, y: 100, width: pW, height: pH }         
        );

        // --- HÁROM FÜGGETLEN HAL RENDSZERE ---
        this.regFish = null;
        this.regCooldownTimer = 0;
        this.regCooldownTarget = 0; 
        this.regLifeTimer = 0;
        this.regFishLifeMax = 30000; 

        this.goldFish = null;
        this.goldCooldownTimer = 0;
        this.goldCooldownTarget = Math.random() * 5000 + 10000; 
        this.goldLifeTimer = 0;
        this.goldFishLifeMax = 4000; 

        this.eelFish = null;
        this.eelCooldownTimer = 0;
        this.eelCooldownTarget = Math.random() * 5000 + 8000; 
        this.eelLifeTimer = 0;
        this.eelFishLifeMax = 7000; 

        // --- LÁVAKITÖRÉS IDŐZÍTŐI ---
        this.lavaBursts = [];
        this.lavaCooldownTimer = 0;
        this.lavaCooldownTarget = Math.random() * 3000 + 4000; 

        // --- LÖVEDÉKEK IDŐZÍTŐI ÉS LISTÁI ---
        this.arrows = [];
        this.arrowCooldownTimer = 0;
        this.arrowCooldownTarget = Math.random() * 2000 + 4000; 

        this.stones = [];
        this.stoneCooldownTimer = 0;
        this.stoneCooldownTarget = Math.random() * 2000 + 4500; 

        // --- HÁLÓK LISTÁJA ÉS IDŐZÍTŐI ---
        this.nets = [];
        this.netCooldownTimer = 0;
        this.netCooldownTarget = Math.random() * 2000 + 3000;

        // KÉPEK
        this.bgImage = new Image();
        this.bgImage.src = 'assets/background.png';

        this.platImage = new Image();
        this.platImage.src = 'assets/platform.png';
    }

    // ÚJ: Teljes újraindításért felelős metódus
    resetGame() {
        this.score = 0;
        this.player = new Player(this.width, this.height);
        this.regFish = null;
        this.regCooldownTimer = 0;
        this.regCooldownTarget = 0; 
        this.regLifeTimer = 0;

        this.goldFish = null;
        this.goldCooldownTimer = 0;
        this.goldCooldownTarget = Math.random() * 5000 + 10000; 
        this.goldLifeTimer = 0;

        this.eelFish = null;
        this.eelCooldownTimer = 0;
        this.eelCooldownTarget = Math.random() * 5000 + 8000; 
        this.eelLifeTimer = 0;

        this.lavaBursts = [];
        this.lavaCooldownTimer = 0;
        this.lavaCooldownTarget = Math.random() * 3000 + 4000; 

        this.arrows = [];
        this.arrowCooldownTimer = 0;
        this.arrowCooldownTarget = Math.random() * 2000 + 4000; 

        this.stones = [];
        this.stoneCooldownTimer = 0;
        this.stoneCooldownTarget = Math.random() * 2000 + 4500; 

        this.nets = [];
        this.netCooldownTimer = 0;
        this.netCooldownTarget = Math.random() * 2000 + 3000;

        this.gameState = 'PLAYING';
    }

    generateValidFish(type) {
        const fishW = 30;
        const fishH = 20;
        let finalX = 0;
        let finalY = 0;
        let validPositionFound = false;
        let safetyAttempts = 0;

        while (!validPositionFound && safetyAttempts < 200) {
            safetyAttempts++;
            let randomX = Math.random() * (this.width - fishW - 40) + 20;
            let randomY = Math.random() * (this.height - fishH - 80) + 40; 

            let intersectsWithPlatform = false;
            for (let plat of this.platforms) {
                if (
                    randomX < plat.x + plat.width &&
                    randomX + fishW > plat.x &&
                    randomY < plat.y + plat.height &&
                    randomY + fishH > plat.y
                ) {
                    intersectsWithPlatform = true;
                    break; 
                }
            }

            if (!intersectsWithPlatform) {
                finalX = randomX;
                finalY = randomY;
                validPositionFound = true;
            }
        }

        if (!validPositionFound) {
            finalX = this.width / 2 - fishW / 2;
            finalY = 50; 
        }

        return new Fish(finalX, finalY, type);
    }

    spawnArrow() {
        let spawned = false;
        let attempts = 0;

        while (!spawned && attempts < 100) {
            attempts++;
            const side = Math.random() < 0.5 ? 'left' : 'right';
            const x = side === 'left' ? -40 : this.width + 10;
            const y = Math.random() * (this.height - 140) + 40; 

            const distance = Math.hypot(this.player.x - x, this.player.y - y);

            if (distance < 220) {
                continue; 
            }

            this.arrows.push(new Arrow(x, y, side));
            spawned = true;
        }
    }

    spawnStone() {
        let spawned = false;
        let attempts = 0;

        while (!spawned && attempts < 100) {
            attempts++;

            const angleDeg = Math.random() * (90 - 45) + 45;
            const angleRad = angleDeg * Math.PI / 180;
            const direction = Math.random() < 0.5 ? 1 : -1;

            const vy = 4.5;
            let vx = 0;

            if (angleDeg < 89.9) {
                vx = (vy / Math.tan(angleRad)) * direction;
            } else {
                vx = 0;
            }

            const startY = -40;
            const targetY = this.height; 
            const totalYDist = targetY - startY; 
            
            const totalFallTime = totalYDist / vy; 
            const deltaX = vx * totalFallTime; 

            let minX = 0;
            let maxX = this.width;

            if (deltaX > 0) {
                maxX = this.width - deltaX;
            } else {
                minX = -deltaX;
            }

            if (minX > maxX) continue;

            const x = Math.random() * (maxX - minX) + minX;
            const y = startY;

            const distance = Math.hypot(this.player.x - x, this.player.y - y);
            if (distance < 250) {
                continue;
            }

            this.stones.push(new Stone(x, y, vx));
            spawned = true;
        }
    }

    start() {
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop(timeStamp) {
        let deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;

        if (deltaTime > 250) deltaTime = 250;
        this.accumulator += deltaTime;

        while (this.accumulator >= this.timeStep) {
            // Kattintások és menü gombok leütéseinek kezelése
            const click = this.input.getClick();
            const actionKeyPressed = this.input.isJustPressed('Enter') || this.input.isJustPressed('Space');

            // --- JÁTÉKÁLLAPOTOK LOGIKÁJA ---
            if (this.gameState === 'MENU') {
                let startBtn = { x: this.width / 2 - 120, y: this.height / 2 + 20, width: 240, height: 50 };
                if (actionKeyPressed || (click && click.x >= startBtn.x && click.x <= startBtn.x + startBtn.width && click.y >= startBtn.y && click.y <= startBtn.y + startBtn.height)) {
                    this.gameState = 'PLAYING';
                }
            } 
            else if (this.gameState === 'GAMEOVER') {
                let retryBtn = { x: this.width / 2 - 120, y: this.height / 2 + 60, width: 240, height: 50 };
                if (actionKeyPressed || (click && click.x >= retryBtn.x && click.x <= retryBtn.x + retryBtn.width && click.y >= retryBtn.y && click.y <= retryBtn.y + retryBtn.height)) {
                    this.resetGame();
                }
            } 
            else if (this.gameState === 'PLAYING') {
                this.player.update(this.input, this.timeStep);
                this.handleCollisions(); 

                if (this.player.lives <= 0) {
                    this.gameState = 'GAMEOVER';
                    this.regFish = null;
                    this.goldFish = null;
                    this.eelFish = null;
                    this.lavaBursts = []; 
                    this.arrows = []; 
                    this.stones = [];
                    this.nets = []; 
                } else {
                    // --- 1. SIMA HAL ---
                    if (!this.regFish) {
                        if (this.regCooldownTarget === 0) {
                            this.regCooldownTarget = Math.random() * 700 + 300; 
                            this.regCooldownTimer = 0;
                        }
                        this.regCooldownTimer += this.timeStep;
                        if (this.regCooldownTimer >= this.regCooldownTarget) {
                            this.regFish = this.generateValidFish('regular');
                            this.regCooldownTarget = 0; 
                            this.regLifeTimer = 0;
                        }
                    } else {
                        this.regLifeTimer += this.timeStep;
                        if (this.regLifeTimer >= this.regFishLifeMax) {
                            this.regFish = null; 
                        }
                    }

                    // --- 2. ARANYHAL ---
                    if (!this.goldFish) {
                        this.goldCooldownTimer += this.timeStep;
                        if (this.goldCooldownTimer >= this.goldCooldownTarget) {
                            this.goldFish = this.generateValidFish('gold');
                            this.goldLifeTimer = 0;
                        }
                    } else {
                        this.goldLifeTimer += this.timeStep;
                        if (this.goldLifeTimer >= this.goldFishLifeMax) {
                            this.goldFish = null; 
                            this.goldCooldownTimer = 0;
                            this.goldCooldownTarget = Math.random() * 5000 + 10000; 
                        }
                    }

                    // --- 3. ANGOLNA ---
                    if (!this.eelFish) {
                        this.eelCooldownTimer += this.timeStep;
                        if (this.eelCooldownTimer >= this.eelCooldownTarget) {
                            this.eelFish = this.generateValidFish('eel');
                            this.eelLifeTimer = 0;
                        }
                    } else {
                        this.eelLifeTimer += this.timeStep;
                        if (this.eelFishLifeMax && this.eelLifeTimer >= this.eelFishLifeMax) {
                            this.eelFish = null;
                            this.eelCooldownTimer = 0;
                            this.eelCooldownTarget = Math.random() * 5000 + 8000; 
                        }
                    }

                    // --- 4. LÁVAKITÖRÉSEK (50 PONT FELETT) ---
                    if (this.score >= 50) {
                        this.lavaCooldownTimer += this.timeStep;
                        if (this.lavaCooldownTimer >= this.lavaCooldownTarget) {
                            const randomPlatform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
                            this.lavaBursts.push(new LavaBurst(randomPlatform));
                            
                            this.lavaCooldownTimer = 0;
                            
                            let minLava = 4000;
                            let maxLava = 7000;
                            if (this.score >= 75) {
                                let factor = Math.min((this.score - 75) / 25, 1);
                                minLava = 4000 - factor * 2200; 
                                maxLava = 7000 - factor * 3800; 
                            }
                            this.lavaCooldownTarget = Math.random() * (maxLava - minLava) + minLava; 
                        }
                    }

                    for (let i = this.lavaBursts.length - 1; i >= 0; i--) {
                        this.lavaBursts[i].update(this.timeStep);
                        if (this.lavaBursts[i].state === 'dead') {
                            this.lavaBursts.splice(i, 1);
                        }
                    }

                    // --- 5. NYILAK FRISSÍTÉSE ---
                    this.arrowCooldownTimer += this.timeStep;
                    if (this.arrowCooldownTimer >= this.arrowCooldownTarget) {
                        this.spawnArrow();
                        this.arrowCooldownTimer = 0;
                        
                        let minArrow = 1500;
                        let maxArrow = 3500;
                        if (this.score < 20) {
                            minArrow = 4000; 
                            maxArrow = 6000;
                        } else if (this.score < 50) {
                            minArrow = 2000;
                            maxArrow = 4000;
                        } else if (this.score >= 75) {
                            let factor = Math.min((this.score - 75) / 25, 1);
                            minArrow = 1500 - factor * 900;  
                            maxArrow = 3500 - factor * 2000; 
                        }
                        this.arrowCooldownTarget = Math.random() * (maxArrow - minArrow) + minArrow;
                    }
                    for (let i = this.arrows.length - 1; i >= 0; i--) {
                        this.arrows[i].update(this.timeStep);
                        if (this.arrows[i].x < -100 || this.arrows[i].x > this.width + 100) {
                            this.arrows.splice(i, 1);
                        }
                    }

                    // --- 6. KÖVEK FRISSÍTÉSE ---
                    this.stoneCooldownTimer += this.timeStep;
                    if (this.stoneCooldownTimer >= this.stoneCooldownTarget) {
                        this.spawnStone();
                        this.stoneCooldownTimer = 0;
                        
                        let minStone = 2000;
                        let maxStone = 4000;
                        if (this.score < 20) {
                            minStone = 4500; 
                            maxStone = 6500;
                        } else if (this.score < 50) {
                            minStone = 2500;
                            maxStone = 4500;
                        } else if (this.score >= 75) {
                            let factor = Math.min((this.score - 75) / 25, 1);
                            minStone = 2000 - factor * 1200; 
                            maxStone = 4000 - factor * 2200;
                        }
                        this.stoneCooldownTarget = Math.random() * (maxStone - minStone) + minStone;
                    }
                    for (let i = this.stones.length - 1; i >= 0; i--) {
                        this.stones[i].update(this.timeStep);
                        if (this.stones[i].y > this.height + 50 || this.stones[i].x < -100 || this.stones[i].x > this.width + 100) {
                            this.stones.splice(i, 1);
                        }
                    }

                    // --- 7. HÁLÓK FRISSÍTÉSE (20 PONT FELETT) ---
                    if (this.score >= 20) {
                        this.netCooldownTimer += this.timeStep;
                        if (this.netCooldownTimer >= this.netCooldownTarget) {
                            this.nets.push(new Net(this.width, this.height));
                            this.netCooldownTimer = 0;
                            
                            let minNet = 2500;
                            let maxNet = 5000;
                            if (this.score >= 75) {
                                let factor = Math.min((this.score - 75) / 25, 1);
                                minNet = 2500 - factor * 1500; 
                                maxNet = 5000 - factor * 3000;
                            }
                            this.netCooldownTarget = Math.random() * (maxNet - minNet) + minNet;
                        }
                    }
                    for (let i = this.nets.length - 1; i >= 0; i--) {
                        this.nets[i].update();
                        if (this.nets[i].isOutOfBounds(this.width, this.height)) {
                            this.nets.splice(i, 1);
                        }
                    }

                    this.handleFishCollisions();
                    this.handleLavaCollisions(); 
                    this.handleProjectileCollisions(); 
                    this.handleNetCollisions(); 
                }
            }

            this.accumulator -= this.timeStep;
        }

        // --- RENDERELÉS ---
        if (this.bgImage.complete && this.bgImage.naturalWidth !== 0) {
            this.ctx.drawImage(this.bgImage, 0, 0, this.width, this.height);
        } else {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }

        if (this.gameState === 'MENU') {
            this.drawMainMenu(); // Csak a menüt rajzoljuk ki
        } else {
            // A játékmenet vagy game over elemeinek kirajzolása
            this.drawPlatforms();

            if (this.regFish) this.regFish.draw(this.ctx);
            if (this.goldFish) this.goldFish.draw(this.ctx);
            if (this.eelFish) this.eelFish.draw(this.ctx);

            for (let lava of this.lavaBursts) {
                lava.draw(this.ctx);
            }

            for (let arrow of this.arrows) {
                arrow.draw(this.ctx);
            }
            for (let stone of this.stones) {
                stone.draw(this.ctx);
            }
            for (let net of this.nets) {
                net.draw(this.ctx);
            }

            this.player.draw(this.ctx);
            this.drawHUD();
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    handleFishCollisions() {
        if (this.regFish && this.checkCollision(this.player, this.regFish)) {
            this.score += 1;
            this.regFish = null; 
        }

        if (this.goldFish && this.checkCollision(this.player, this.goldFish)) {
            if (this.player.lives < 3) {
                this.player.lives += 1; 
            } else {
                this.score += 2; 
            }
            this.goldFish = null; 
            this.goldCooldownTimer = 0;
            this.goldCooldownTarget = Math.random() * 5000 + 10000; 
        }

        if (this.eelFish && this.checkCollision(this.player, this.eelFish)) {
            this.player.lives -= 1; 
            this.eelFish = null; 
            this.eelCooldownTimer = 0;
            this.eelCooldownTarget = Math.random() * 5000 + 8000; 
        }
    }

    handleLavaCollisions() {
        for (let lava of this.lavaBursts) {
            const hitbox = lava.getHitbox();
            if (!hitbox) continue; 

            if (this.checkCollision(this.player, hitbox)) {
                if (lava.state === 'eruption' && !lava.hasHitPlayerInEruption) {
                    this.player.lives -= 1;
                    lava.hasHitPlayerInEruption = true; 
                } 
                else if (lava.state === 'hot_ground' && !lava.hasHitPlayerInEruption && lava.hotGroundDamageCooldown <= 0) {
                    this.player.lives -= 1;
                    lava.hotGroundDamageCooldown = 800; 
                }
            }
        }
    }

    handleProjectileCollisions() {
        for (let i = this.arrows.length - 1; i >= 0; i--) {
            if (this.checkCollision(this.player, this.arrows[i])) {
                this.player.lives -= 1;
                this.arrows.splice(i, 1); 
            }
        }

        for (let i = this.stones.length - 1; i >= 0; i--) {
            if (this.checkCollision(this.player, this.stones[i])) {
                this.player.lives -= 1;
                this.stones.splice(i, 1); 
            }
        }
    }

    handleNetCollisions() {
        for (let i = this.nets.length - 1; i >= 0; i--) {
            if (this.checkCollision(this.player, this.nets[i])) {
                this.player.triggerNet(); 
                this.nets.splice(i, 1); 
            }
        }
    }

    handleCollisions() {
        if (this.player.vy >= 0) {
            let onAnyPlatform = false;

            for (let plat of this.platforms) {
                const previousBottom = this.player.y + this.player.height - this.player.vy;
                const currentBottom = this.player.y + this.player.height;

                if (
                    this.player.x + this.player.width > plat.x &&
                    this.player.x < plat.x + plat.width &&
                    previousBottom <= plat.y && 
                    currentBottom >= plat.y     
                ) {
                    this.player.y = plat.y - this.player.height;
                    this.player.vy = 0;
                    this.player.isGrounded = true;
                    this.player.hasDashedInAir = false;
                    onAnyPlatform = true;
                    break; 
                }
            }

            if (!onAnyPlatform) {
                this.player.isGrounded = false;
            }
        }
    }

    drawPlatforms() {
        const hasPlatTexture = this.platImage.complete && this.platImage.naturalWidth !== 0;

        for (let plat of this.platforms) {
            if (hasPlatTexture) {
                this.ctx.drawImage(this.platImage, plat.x, plat.y, plat.width, plat.height);
            } else {
                this.ctx.fillStyle = '#7f8c8d'; 
                this.ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            }
        }
    }

    // ÚJ: Főmenü kirajzolása placeholder gombstílussal
    drawMainMenu() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Játék címe
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.font = 'bold 42px "Courier New"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('POOR TOOTHLESS !!', this.width / 2, this.height / 2 - 90);
        this.ctx.fillStyle = '#2ecc71';
        
        // JÁTÉK INDÍTÁSA GOMB (Placeholder stílus)
        let startBtn = { x: this.width / 2 - 120, y: this.height / 2 + 20, width: 240, height: 50 };
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(startBtn.x, startBtn.y, startBtn.width, startBtn.height);
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(startBtn.x, startBtn.y, startBtn.width, startBtn.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 18px "Courier New"';
        this.ctx.fillText('JÁTÉK INDÍTÁSA', this.width / 2, startBtn.y + 31);
        
        // Irányítási infó
        this.ctx.fillStyle = '#bdc3c7';
        this.ctx.font = '14px "Courier New"';
        this.ctx.fillText('Irányítás: W, A, D / Nyilak / Space (Kattintás is működik)', this.width / 2, this.height - 40);
        
        this.ctx.restore();
    }

    drawHUD() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px "Courier New"';
        
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`HALAK: ${this.score}`, 20, 40);
        
        this.ctx.textAlign = 'right';
        let hearts = '';
        for(let i = 0; i < this.player.lives; i++) hearts += '❤️';
        if (this.player.lives <= 0) hearts = '💀';
        this.ctx.fillText(`ÉLET: ${hearts}`, this.width - 20, 40);

        this.ctx.textAlign = 'left';

        // MÓDOSÍTVA: Game Over overlay kezelése az új gombbal
        if (this.gameState === 'GAMEOVER') {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.font = 'bold 45px "Courier New"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 35);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '20px "Courier New"';
            this.ctx.fillText(`Megevett halak: ${this.score}`, this.width / 2, this.height / 2 + 15);

            // ÚJRAINDÍTÁS GOMB (Placeholder stílus)
            let retryBtn = { x: this.width / 2 - 120, y: this.height / 2 + 60, width: 240, height: 50 };
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.fillRect(retryBtn.x, retryBtn.y, retryBtn.width, retryBtn.height);
            this.ctx.strokeStyle = '#34495e';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(retryBtn.x, retryBtn.y, retryBtn.width, retryBtn.height);
            
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.font = 'bold 18px "Courier New"';
            this.ctx.fillText('ÚJRAINDÍTÁS', this.width / 2, retryBtn.y + 31);
            
            this.ctx.restore();
        }
    }
}