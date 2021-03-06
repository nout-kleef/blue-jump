class Player {
    constructor(x, y) {
        this.highestY = y;
        this.buried = false;
        this.shouldUpdate = true;
        this.initialP = {
            x: x,
            y: y
        };
        this.p = {
            x: x,
            y: y
        };
        this.v = {
            x: 0,
            y: 0
        };
        this.a = {
            x: 0,
            y: BlueJumpGame.GRAVITY
        };
        this.stats = {
            score: 0,
            pixelsTraversed: 0,
            barriersJumped: 0,
            alive: true
        };
        this.activity = 0;
        this.activities = [];
        for (let i = 2; i <= 6; i++) {
            if (typeof arguments[i] !== 'undefined') {
                this.activities.push(
                    new Sprite(
                        arguments[i][0], arguments[i][1], arguments[i][2], arguments[i][3], arguments[i][4], arguments[i][5], arguments[i][6]
                    )
                );
                this.walk = function () {
                    this.activity = 1;
                }
            }
        }
        this.falling = true;
    }

    fall() {
        this.falling = true;
        this.a.y = BlueJumpGame.GRAVITY;
    }

    stand() {
        this.activity = 0;
    }

    getTraversedPixels() {
        this.highestY = this.highestY > this.p.y ? this.p.y : this.highestY;
        return Math.round(this.stats.pixelsTraversed + this.initialP.y - this.highestY);
    }

    getScore() {
        const s = 3 * this.getTraversedPixels() + 400 * (this.stats.barriersJumped - 1) * 0.7;
        return Math.round(s);
    }

    showScore() {
        fill(0);
        strokeWeight(3);
        stroke(255);
        textAlign(CENTER);
        textSize(0.9 * BlueJumpGame.TEXT_SIZE);
        text(this.getScore(), width / 2, 0.8 * BlueJumpGame.TEXT_SIZE);
    }

    update() {
        if ((BlueJumpGame.AUTOJUMP || keyIsDown(32)) && !this.falling) {
            this.jump();
        }
        if (this.stats.alive) {
            this.stand();
        }
        this.v.x = 0;
        if (BlueJumpGame.MOBILE_CONTROLS) { // mobile controls
            this.v.x = BlueJumpGame.HORIZONTAL_SPEED * orientedMovement;
        } else { // keyboard controls
            if (
                (keyIsDown(37) || keyIsDown(65)) !== (keyIsDown(39) || keyIsDown(68))
            ) {
                if (this.stats.alive) this.walk();
                if (keyIsDown(37) || keyIsDown(65))
                    this.v.x = -BlueJumpGame.HORIZONTAL_SPEED;
                else this.v.x = BlueJumpGame.HORIZONTAL_SPEED;
            }
        }
        this.p.x = constrain(this.p.x + this.v.x, 0, width - this.activities[this.activity].displayWidth);
        this.p.y = constrain(this.p.y + this.v.y, 0, height - this.activities[this.activity].displayHeight);
        this.v.x += this.a.x;
        this.v.y += this.a.y;
        if (this.p.y < height / 3) {
            const exceedance = height / 3 - this.p.y;
            this.stats.pixelsTraversed += exceedance;
            this.p.y = height / 3;
            for (let b = 0; b < bj.barriers.length; b++) {
                bj.barriers[b].p.y += exceedance;
                if (bj.barriers[b].p.y >= height - 40)
                    bj.barriers.splice(b, 1);
            }
            for (let fb = 0; fb < bj.fakeBarriers.length; fb++) {
                bj.fakeBarriers[fb].p.y += exceedance / bj.fakeBarriers[fb].p.z;
                if (bj.fakeBarriers[fb].p.y >= height - 50)
                    bj.fakeBarriers.splice(fb, 1);
            }
        }
        this.a.y = BlueJumpGame.GRAVITY;
        if (this.p.y + this.activities[this.activity].displayHeight >= height) {
            if (this.stats.alive) {
                this.land();
                this.die();
            } else this.bury();
        }
        for (let b = 0; b < bj.barriers.length; b++) {
            if (this.collide(bj.barriers[b])) {
                if (
                    this.p.y + this.activities[this.activity].displayHeight >= bj.barriers[b].p.y &&
                    this.p.y + this.activities[this.activity].displayHeight - bj.barriers[b].p.y <= BlueJumpGame.LANDING_THRESHOLD &&
                    this.v.y > 0
                ) {
                    this.land(
                        bj.barriers[b].p.y - this.activities[this.activity].displayHeight,
                        bj.barriers[b].v.x
                    );
                    if (!bj.barriers[b].jumped) this.stats.barriersJumped++;
                    bj.barriers[b].jumped = true;
                }
            }
        }
        this.stats.score = this.getScore();
    }

    jump(F) {
        const power = typeof F !== 'undefined' ? F : BlueJumpGame.JUMP_POWER;
        this.fall();
        this.v.y -= power;
    }

    land(y, dX) {
        this.falling = false;
        this.a.y = 0;
        this.v.y = 0;
        if (typeof y !== 'undefined') this.p.y = y;
        if (typeof dX !== 'undefined') this.p.x += 2 * dX;
    }

    collide(target) {
        return this.p.x + this.activities[this.activity].displayWidth - this.activities[this.activity].padding.right >= target.p.x &&
            this.p.x + this.activities[this.activity].padding.left <= target.p.x + target.width &&
            this.p.y + this.activities[this.activity].displayHeight >= target.p.y &&
            this.p.y <= target.p.y + target.height;
    }

    die() {
        this.shouldUpdate = false;
        this.activity = 3;
        this.p.y = (BlueJumpGame.IS_SAFARI ? windowHeight : window.screen.height) - 3 * BlueJumpGame.BARRIER_SCALE / 3;
        bj.textAnimations.push(
            new Text(3, width * 0.8, 2 * BlueJumpGame.TEXT_SIZE, frameRate() / 3, 2 * frameRate() / 3, [0, 0, 0], frameCount)
        );
        setTimeout(() => {
            bj.textAnimations.push(
                new Text(2, width * 0.8, 2 * BlueJumpGame.TEXT_SIZE, frameRate() / 3, 2 * frameRate() / 3, [0, 0, 0], frameCount)
            );
        }, 1000);
        setTimeout(() => {
            bj.textAnimations.push(
                new Text(1, width * 0.8, 2 * BlueJumpGame.TEXT_SIZE, frameRate() / 3, 2 * frameRate() / 3, [0, 0, 0], frameCount)
            );
        }, 2000);
        setTimeout(() => {
            this.stats.alive = false;
            this.activity = 2;
            this.jump(2.2 * BlueJumpGame.JUMP_POWER);
            this.shouldUpdate = true;
            bj.textAnimations.push(new Text("SECOND CHANCE!", width * 0.8, 1.5 * BlueJumpGame.TEXT_SIZE, frameRate() / 3, 2 * frameRate(), [0, 0, 0], frameCount));
        }, 3200);
    }

    resurrect() {
        this.stats.alive = true;
        this.activity = 0;
    }

    bury() {
        this.shouldUpdate = false;
        this.burying = setInterval(() => {
            this.p.y += 2;
            if (this.p.y >= (BlueJumpGame.IS_SAFARI ? windowHeight : window.screen.height) - BlueJumpGame.BARRIER_SCALE / 3) {
                clearInterval(this.burying);
                this.activity = 4;
                this.burying = setInterval(() => {
                    this.p.y--;
                    if (this.p.y <= (BlueJumpGame.IS_SAFARI ? windowHeight : window.screen.height) - 2.7 * BlueJumpGame.BARRIER_SCALE / 3) {
                        clearInterval(this.burying);
                        bj.textAnimations.push(
                            new Text(
                                "GAME OVER!",
                                width * 0.8,
                                1.5 * BlueJumpGame.TEXT_SIZE,
                                frameRate() / 3,
                                Infinity,
                                [0, 0, 0],
                                frameCount,
                                width / 2,
                                100
                            )
                        );
                        this.buried = true;
                    }
                }, 1000 / frameRate());
            }
        }, 1000 / frameRate());
    }
}
