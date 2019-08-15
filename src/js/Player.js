function Player(x, y) {
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
        y: GRAVITY
    };
    this.activities = [];
    this.activity = 0;
    this.activities.push(new SpriteAnimation(arguments[2][0], arguments[2][1], arguments[2][2], arguments[2][3], arguments[2][4], arguments[2][5], arguments[2][6]));
    this.stand = function () {
        this.activity = 0;
    }
    if (arguments[3] !== undefined) {
        this.activities.push(new SpriteAnimation(arguments[3][0], arguments[3][1], arguments[3][2], arguments[3][3], arguments[3][4], arguments[3][5], arguments[3][6]));
        this.walk = function () {
            this.activity = 1;
        }
    }
    if (arguments[4] !== undefined) {
        this.activities.push(new SpriteAnimation(arguments[4][0], arguments[4][1], arguments[4][2], arguments[4][3], arguments[4][4], arguments[4][5], arguments[4][6]));
    }
    if (arguments[5] !== undefined) {
        this.activities.push(new SpriteAnimation(arguments[5][0], arguments[5][1], arguments[5][2], arguments[5][3], arguments[5][4], arguments[5][5], arguments[5][6]));
    }
    if (arguments[6] !== undefined) {
        this.activities.push(new SpriteAnimation(arguments[6][0], arguments[6][1], arguments[6][2], arguments[6][3], arguments[6][4], arguments[6][5], arguments[6][6]));
    }
    this.falling = true;
    this.fall = function () {
        this.falling = true;
        this.a.y = GRAVITY;
    }
    this.stats = {
        score: 0,
        pixelsTraversed: 0,
        barriersJumped: 0,
        alive: true
    };
    this.getTraversedPixels = function () {
        this.highestY = this.highestY > this.p.y ? this.p.y : this.highestY;
        return Math.round(this.stats.pixelsTraversed + this.initialP.y - this.highestY);
    }
    this.getScore = function () {
        var s = 3 * this.getTraversedPixels() + 400 * (this.stats.barriersJumped - 1) * 0.7;
        return Math.round(s);
    }
    this.update = function () {
        if ((autojump || keyDown(32)) && !this.falling) {
            this.jump();
        }
        if (this.stats.alive) {
            this.stand();
        }
        this.v.x = 0;
        if (CONTROLS === 0) { // keyboard controls
            if ((keyDown(37) || keyDown('a')) !== (keyDown(39) || keyDown('d'))) {
                if (this.stats.alive) {
                    this.walk();
                }
                if (keyDown(37) || keyDown('a')) {
                    this.v.x = -HORIZONTAL_SPEED;
                } else {
                    this.v.x = HORIZONTAL_SPEED;
                }
            }
        } else if (CONTROLS === 1) { // mobile controls (device draaien)
            this.v.x = HORIZONTAL_SPEED * orientedMovement;
        } else { // tap controls

        }
        this.p.x = constrain(this.p.x + this.v.x, 0, width - this.activities[this.activity].width);
        this.p.y = constrain(this.p.y + this.v.y, 0, height - this.activities[this.activity].height);
        this.v.x += this.a.x;
        this.v.y += this.a.y;
        if (this.p.y < height / 3) {
            var exceedance = height / 3 - this.p.y;
            this.stats.pixelsTraversed += exceedance;
            this.p.y = height / 3;
            for (var i3 = 0; i3 < barriers.length; i3++) {
                barriers[i3].p.y += exceedance;
                if (barriers[i3].p.y >= height - 40) {
                    barriers.splice(i3, 1);
                }
            }
            for (var i4 = 0; i4 < fakeBarriers.length; i4++) {
                fakeBarriers[i4].p.y += exceedance / fakeBarriers[i4].p.z;
                if (fakeBarriers[i4].p.y >= height - 50) {
                    fakeBarriers.splice(i4, 1);
                }
            }
        }
        this.fall();
        if (this.falling) {
            if (this.p.y + this.activities[this.activity].height >= height) {
                if (this.stats.alive) {
                    this.land();
                    this.die();
                } else {
                    this.bury();
                }
            }
        }
        for (var i = 0; i < barriers.length; i++) {
            if (this.collide(barriers[i])) {
                if (this.p.y + this.activities[this.activity].height >= barriers[i].p.y &&
                    this.p.y + this.activities[this.activity].height - barriers[i].p.y <= LANDING_THRESHOLD &&
                    this.v.y > 0) {
                    this.land(barriers[i].p.y - this.activities[this.activity].height, barriers[i].v.x);
                    if (!barriers[i].jumped) {
                        this.stats.barriersJumped++;
                    }
                    barriers[i].jumped = true;
                }
            }
        }
        this.stats.score = this.getScore();
    }
    this.jump = function () {
        var power = arguments[0] !== undefined ? arguments[0] : JUMP_POWER;
        this.fall();
        this.v.y -= power;
    }
    this.land = function () {
        this.falling = false;
        this.a.y = 0;
        this.v.y = 0;
        if (arguments[0] !== undefined) {
            this.p.y = arguments[0];
        }
        if (arguments[1] !== undefined) {
            this.p.x += 2 * arguments[1];
        }
    }
    this.collide = function (target) {
        return this.p.x + this.activities[this.activity].width - this.activities[this.activity].padding.right >= target.p.x &&
            this.p.x + this.activities[this.activity].padding.left <= target.p.x + target.width &&
            this.p.y + this.activities[this.activity].height >= target.p.y &&
            this.p.y <= target.p.y + target.height;
    }
    this.die = function () {
        this.shouldUpdate = false;
        this.activity = 3;
        this.p.y = (isSafari ? windowHeight : window.screen.height) - 3 * BARRIER_SCALE / 3;
        textAnimations.push(new TextAnimation(3, width * 0.8, 2 * txtSize, frameRate() / 3, 2 * frameRate() / 3, [0, 0, 0], frameCount));
        setTimeout(function () {
            textAnimations.push(new TextAnimation(2, width * 0.8, 2 * txtSize, frameRate() / 3, 2 * frameRate() / 3, [0, 0, 0], frameCount));
        }, 1000);
        setTimeout(function () {
            textAnimations.push(new TextAnimation(1, width * 0.8, 2 * txtSize, frameRate() / 3, 2 * frameRate() / 3, [0, 0, 0], frameCount));
        }, 2000);
        setTimeout(function () {
            player.stats.alive = false;
            player.activity = 2;
            player.jump(2.2 * JUMP_POWER);
            player.shouldUpdate = true;
            textAnimations.push(new TextAnimation("SECOND CHANCE!", width * 0.8, 1.5 * txtSize, frameRate() / 3, 2 * frameRate(), [0, 0, 0], frameCount));
        }, 3200);
    }
    this.resurrect = function () {
        this.stats.alive = true;
        this.activity = 0;
    }
    this.burying;
    this.bury = function () {
        // pushRank(this.stats.score);
        // getRanks();
        this.shouldUpdate = false;
        this.burying = setInterval(function () {
            player.p.y += 2;
            if (player.p.y >= (isSafari ? windowHeight : window.screen.height) - BARRIER_SCALE / 3) {
                clearInterval(player.burying);
                player.activity = 4;
                player.burying = setInterval(function () {
                    player.p.y--;
                    if (player.p.y <= (isSafari ? windowHeight : window.screen.height) - 2.7 * BARRIER_SCALE / 3) {
                        clearInterval(player.burying);
                        textAnimations.push(new TextAnimation("GAME OVER!", width * 0.8, 1.5 * txtSize, frameRate() / 3, Infinity, [0, 0, 0], frameCount, width / 2, 100));
                        gameMode(1);
                        this.buried = true;
                    }
                }, 1000 / frameRate());
            }
        }, 1000 / frameRate());
    }
}
