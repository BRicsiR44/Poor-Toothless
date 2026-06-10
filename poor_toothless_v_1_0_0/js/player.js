// js/player.js
export class Player {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Fizikai Hitbox (Tökéletes 1:1 négyzet)
        this.width = 40; 
        this.height = 40; 

        // Alapértelmezett Vizuális Sprite Méret
        this.spriteWidth = 64; 
        this.spriteHeight = 64;

        // Kezdőpozíció és sebesség
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight - 100;
        this.vx = 0;
        this.vy = 0;

        // Fizikai konstansok
        this.gravity = 0.85;       
        this.speed = 7.5;          
        
        // Ugrás és Dash beállítások
        this.maxJumpForce = -18.5;    
        this.minJumpForce = -9.25;     
        this.jumpHoldTimer = 0;
        this.maxJumpHoldDuration = 130; 

        this.dashSpeed = 20;       
        this.dashDurationMax = 180;    
        this.dashDurationMin = 90;     
        this.dashTimer = 0;

        // Állapotok
        this.isGrounded = false;
        this.hasDashedInAir = false;
        this.lives = 3;
        this.facing = 'right'; 
        this.rootTimer = 0;      

        // Coyote Time
        this.coyoteTimeMax = 100; 
        this.coyoteTimer = 0;     

        this.currentState = 'idle'; 

        // Textúrák előkészítése
        this.textures = {
            idle: new Image(),
            running: new Image(),
            jumping: new Image(),
            dashing: new Image(),
            rooted_air: new Image(),     
            rooted_ground: new Image(),
            dead: new Image() 
        };

        this.textures.idle.src = 'assets/player_idle.png';
        this.textures.running.src = 'assets/player_running.png';
        this.textures.jumping.src = 'assets/player_jumping.png';
        this.textures.dashing.src = 'assets/player_dashing.png';
        this.textures.rooted_air.src = 'assets/player_rooted_air.png';
        this.textures.rooted_ground.src = 'assets/player_rooted_ground.png';
        this.textures.dead.src = 'assets/player_dead.png'; 
    }

    update(input, deltaTime) {
        // VÉDELEM: Ha a game.js nem ad át deltaTime-ot, kap egy fix 16.66ms (60 FPS) értéket
        const dt = typeof deltaTime === 'number' ? deltaTime : 16.66;

        if (this.rootTimer > 0) this.rootTimer -= dt;

        // VÉDELEM: Kezeljük, ha az input objektum vagy metódusai hiányoznának
        const isHoldingJump = input && typeof input.isHeld === 'function' && (input.isHeld('KeyW') || input.isHeld('Space') || input.isHeld('ArrowUp'));
        const isJumpJustPressed = input && typeof input.isJustPressed === 'function' && (input.isJustPressed('KeyW') || input.isJustPressed('Space') || input.isJustPressed('ArrowUp'));

        // Dash időzítő
        if (this.dashTimer > 0) {
            this.dashTimer -= dt;
            const elapsedDash = this.dashDurationMax - this.dashTimer;

            if (elapsedDash >= this.dashDurationMin && !isHoldingJump) {
                this.dashTimer = 0;
                this.vx *= 0.8; 
                if (this.vy < 0) this.vy *= 0.5; 
            }
        }

        // Coyote Time
        if (this.isGrounded) {
            this.coyoteTimer = this.coyoteTimeMax;
        } else {
            this.coyoteTimer -= dt;
        }

        // prioritized death state
        if (this.lives <= 0) {
            this.currentState = 'dead';
        } else if (this.rootTimer > 0) {
            this.currentState = this.isGrounded ? 'rooted_ground' : 'rooted_air';
        } else if (this.dashTimer > 0) {
            this.currentState = 'dashing';
        } else if (!this.isGrounded) {
            this.currentState = 'jumping';
        } else if (this.vx !== 0) {
            this.currentState = 'running';
        } else {
            this.currentState = 'idle';
        }

        // Mozgáslogika
        if (this.rootTimer <= 0 && this.lives > 0) {
            if (this.dashTimer <= 0) {
                let targetVx = 0;
                if (input && typeof input.isHeld === 'function') {
                    if (input.isHeld('KeyA') || input.isHeld('ArrowLeft')) {
                        targetVx = -this.speed;
                        this.facing = 'left';
                    } else if (input.isHeld('KeyD') || input.isHeld('ArrowRight')) {
                        targetVx = this.speed;
                        this.facing = 'right';
                    }
                }

                if (targetVx !== 0) {
                    if (Math.abs(this.vx) > this.speed && Math.sign(this.vx) === Math.sign(targetVx)) {
                        this.vx *= 0.92; 
                    } else {
                        this.vx = targetVx; 
                    }
                } else {
                    const friction = this.isGrounded ? 0.75 : 0.94; 
                    this.vx *= friction;
                    if (Math.abs(this.vx) < 0.1) this.vx = 0;
                }

                this.vy += this.gravity;

                // Dinamikus ugrás-tartás
                if (this.jumpHoldTimer > 0) {
                    if (isHoldingJump) {
                        const forceToAdd = (this.maxJumpForce - this.minJumpForce) * (dt / this.maxJumpHoldDuration);
                        this.vy += forceToAdd;
                        this.jumpHoldTimer -= dt;
                    } else {
                        this.jumpHoldTimer = 0;
                    }
                }

                // Ugrás és Dash indítása
                if (isJumpJustPressed) {
                    if (this.isGrounded || this.coyoteTimer > 0) {
                        this.vy = this.minJumpForce;
                        this.jumpHoldTimer = this.maxJumpHoldDuration;
                        this.isGrounded = false;
                        this.coyoteTimer = 0; 
                    } else if (!this.hasDashedInAir) {
                        let dashDirX = 0;
                        if (input && typeof input.isHeld === 'function') {
                            if (input.isHeld('KeyA') || input.isHeld('ArrowLeft')) dashDirX = -1;
                            if (input.isHeld('KeyD') || input.isHeld('ArrowRight')) dashDirX = 1;
                        }

                        if (dashDirX !== 0) {
                            this.hasDashedInAir = true;
                            this.dashTimer = this.dashDurationMax; 
                            this.vx = dashDirX * this.dashSpeed * 0.866;
                            this.vy = -this.dashSpeed * 0.4; 
                        }
                    }
                }
            }
        } else {
            const friction = this.isGrounded ? 0.75 : 0.94; 
            this.vx *= friction;
            if (Math.abs(this.vx) < 0.1) this.vx = 0;
            this.vy += this.gravity;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Pálya szélei
        if (this.x < 0) {
            this.x = 0;
            this.vx = 0;
        }
        if (this.x + this.width > this.canvasWidth) {
            this.x = this.canvasWidth - this.width;
            this.vx = 0;
        }

        // Fix padló ütközés (-20 pixel az aljától)
        if (this.y + this.height > this.canvasHeight - 20) {
            this.y = this.canvasHeight - 20 - this.height;
            this.vy = 0;
            this.isGrounded = true;
            this.hasDashedInAir = false; 
            this.jumpHoldTimer = 0;
        }
    }

    triggerNet() {
        this.rootTimer = 1500;
        this.dashTimer = 0;
        this.jumpHoldTimer = 0;
    }

    draw(ctx) {
        ctx.save();
        const currentTexture = this.textures[this.currentState];

        // MÓDOSÍTVA: Határozzuk meg a rajzolási méretet állapot alapján
        let drawWidth = this.spriteWidth;   // Alapértelmezett: 64
        let drawHeight = this.spriteHeight; // Alapértelmezett: 64

        // Kérésre: Ha futunk, legyen picit nagyobb a modell
        if (this.currentState === 'running') {
            // Növeljük meg a méretet (pl. 64-ről 72-re, ami kb 12.5% növekedés)
            drawWidth = 72;
            drawHeight = 72;
        }

        // MÓDOSÍTVA: Vizuális eltolás ÚJRAszámítása a dinamikus méret alapján, hogy középen maradjon a 40x40 hitboxon
        const offsetX = (drawWidth - this.width) / 2;
        const offsetY = (drawHeight - this.height) / 2;

        if (currentTexture && currentTexture.complete && currentTexture.naturalWidth !== 0) {
            if (this.facing === 'left') {
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.scale(-1, 1);
                // MÓDOSÍTVA: Használjuk a dinamikus méreteket
                ctx.drawImage(currentTexture, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
            } else {
                // MÓDOSÍTVA: Használjuk a dinamikus méreteket és offseteket
                ctx.drawImage(currentTexture, this.x - offsetX, this.y - offsetY, drawWidth, drawHeight);
            }
        } else {
            // TARTALÉK / PLACEHOLDER MÓD
            switch (this.currentState) {
                case 'dead': ctx.fillStyle = '#ff0000'; break; 
                case 'rooted_air': ctx.fillStyle = '#7f8c8d'; break;    
                case 'rooted_ground': ctx.fillStyle = '#4a4a4a'; break; 
                case 'dashing': ctx.fillStyle = '#3498db'; break; 
                case 'jumping': ctx.fillStyle = '#9b59b6'; break; 
                case 'running': ctx.fillStyle = '#2ecc71'; break; 
                default: ctx.fillStyle = '#2c3e50'; 
            }
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            if (this.currentState !== 'dead') {
                ctx.fillStyle = '#f1c40f'; 
                if (this.facing === 'right') {
                    ctx.fillRect(this.x + this.width - 10, this.y + 10, 6, 6);
                } else {
                    ctx.fillRect(this.x + 4, this.y + 10, 6, 6);
                }
            }
        }
        ctx.restore();
    }
}