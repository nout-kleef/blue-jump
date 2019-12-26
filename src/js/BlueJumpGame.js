class BlueJumpGame {
    constructor() {
        this.gameMode;
        this.dirtBlock;
        this.brickBlock;
        this.barriers = [];
        this.fakeBarriers = [];
        this.textAnimations = [];
        this.colours = [];
        this.orientedMovement = 0;
        this.rotation = 0;
        this.highest = 0;
        this.fullScreenActive = false;
        this.returned = false;

        this._initControls();
        this._initGame();
        this._initBarriers();
        // finalise
        this._pickNewHighest(0, true);
        this._setGameMode(-1);
        // finish loading assets
        this._loadAssetPixels();
        // set up colour pallette
        colorMode(RGB);
        this.colours = [
            color(64, 112, 184),
            color(191, 218, 235),
            color(90, 0, 0),
            color(200, 0, 0)
        ];
    }

    loop(debug) {
        this._showBackground();
        // barriers
        const highest = this._showBarriers(true);
        if (highest.p.y > -100 && BlueJumpGame.LEVELCREATION)
            this._pickNewHighest(highest.p, false);
        // character
        this.player.activities[this.player.activity].show(
            this.player.p.x, this.player.p.y,
            100, 100
        );
        // floor
        this._showFloor(this.player.stats.alive);
        // text animations
        for (let i = 0; i < this.textAnimations.length; i++) {
            if (this.textAnimations[i].shouldBeDeleted()) {
                this.textAnimations[i].update();
                this.textAnimations[i].show();
            } else this.textAnimations.splice(i, 1);
        }
        // handle gameMode-specific stuff
        this._handleGameMode(this.gameMode);
        // show score
        this._showScore(this.player.stats.score);
        // show credits
        this._showCredits();
        // debugging
        if (debug) {
            textAlign(RIGHT);
            textSize(18);
            stroke(0);
            fill(255, 255, 0);
            text("score: " + this.player.getScore(), width - 60, 60);
            text("barriers jumped: " + this.player.stats.barriersJumped, width - 60, 90);
            text("Pixels traversed vertically: " + this.player.getTraversedPixels(), width - 60, 120);
            text("FPS: " + Math.round(frameRate()), width - 60, 150);
            text("mobile controls: " + BlueJumpGame.MOBILE_CONTROLS, width - 60, 210);
            text("rotation: " + this.rotation.toFixed(3), width - 60, 240);
            text("orientedMovement: " + this.orientedMovement.toFixed(3), width - 60, 270);
            text("# of fake barriers: " + this.fakeBarriers.length, width - 60, 300);
            text("width: " + window.screen.width, width - 60, 330);
            text("height: " + (BlueJumpGame.IS_SAFARI ? windowHeight : window.screen.height), width - 60, 360);
            text("mouseX, mouseY: " + Math.round(mouseX) + ", " + Math.round(mouseY), width - 60, 390);
        }
    }

    _initControls() {
        if (BlueJumpGame.MOBILE_CONTROLS) {
            window.addEventListener(
                'deviceorientation',
                this.deviceOrientationHandler
            );
            BlueJumpGame.BARRIER_SCALE *= 2.5;
            BlueJumpGame.MOVEMENT *= 2.5;
            BlueJumpGame.ARROW_SCALE *= 2.5;
            BlueJumpGame.CONTROLS_MSG = 'Tilt your device to move';
            BlueJumpGame.TIP = 'TIP: use portrait mode!';
            BlueJumpGame.JUMP_POWER = 20;
        } else {
            BlueJumpGame.CONTROLS_MSG = 'Use arrow keys (< and >) or \'A\' ' +
                'and \'D\' to move';
            BlueJumpGame.TIP = 'TIP: press \'esc\' to pause the game';
            BlueJumpGame.JUMP_POWER = 30;
        }
    }

    _initGame() {
        // initialise player
        this.player = new Player( // TODO: refactor this. drastically.
            width / 2 - BlueJumpGame.BARRIER_SCALE / 3,
            height * 3 / 4,
            BlueJumpGame.blueGuy02,
            BlueJumpGame.blueGuy03,
            BlueJumpGame.blueGuy04,
            BlueJumpGame.transition,
            BlueJumpGame.grave
        );
        // create the floors
        BlueJumpGame.spikesFloor = new Floor(
            BlueJumpGame.spikes[0],
            BlueJumpGame.spikes[1],
            BlueJumpGame.spikes[2],
            BlueJumpGame.spikes[3],
            BlueJumpGame.spikes[4]
        );
        BlueJumpGame.lavaFloor = new Floor(
            BlueJumpGame.lava[0],
            BlueJumpGame.lava[1],
            BlueJumpGame.lava[2],
            BlueJumpGame.lava[3],
            BlueJumpGame.lava[4]
        );
    }

    _initBarriers() {
        this.barriers.push( // TODO: refactor this too
            new Barrier(
                this.player.p.x + 0.5 * this.player.activities[this.player.activity].width - 0.5 * BlueJumpGame.BARRIER_SCALE,
                this.player.p.y + this.player.activities[this.player.activity].height,
                1,
                0,
                0,
                0,
                BlueJumpGame.BARRIER_SCALE,
                0.25 * BlueJumpGame.BARRIER_SCALE,
                new Sprite(
                    BlueJumpGame.dirtblock[0],
                    BlueJumpGame.dirtblock[1],
                    BlueJumpGame.dirtblock[2],
                    BlueJumpGame.dirtblock[3],
                    BlueJumpGame.dirtblock[4],
                    BlueJumpGame.dirtblock[5],
                    BlueJumpGame.dirtblock[6]),
                150,
                46
            )
        );
    }

    _showBackground() {
        noStroke();
        for (let bg = 0; bg < 1; bg += 1 / BlueJumpGame.BACKGROUND_SHADES) {
            const origin = this.player.stats.alive ? 0 : 2; // 01:alive, 23:dead
            const shade = lerpColor(
                this.colours[origin], this.colours[origin + 1], bg
            );
            fill(shade);
            rect(0, height * bg, width, height * (bg + 1));
        }
    }

    _showBarriers(showFakes) {
        if (showFakes) {
            let highestFake = this.fakeBarriers[0];
            for (let fb = 0; fb < this.fakeBarriers.length; fb++) {
                if (this.fakeBarriers[fb].p.y < highestFake.p.y)
                    highestFake = this.fakeBarriers[fb]; // TODO: is this right?
                this.fakeBarriers[fb].show();
            }
            if (this.fakeBarriers.length < BlueJumpGame.MAX_BARRIERS)
                this._pickNewHighest(
                    highestFake.p,
                    true,
                    this.fakeBarriers.length < BlueJumpGame.MAX_BARRIERS - 2
                );
        }
        // draw the real barriers & find the highest
        let highest = this.barriers[0];
        for (let b = 0; b < this.barriers.length; b++) {
            if (this.barriers[b].p.y < highest.p.y)
                highest = this.barriers[b]; // TODO: is this right?
            this.barriers[b].show();
        }
        return highest;
    }

    _showFloor(alive) {
        if (alive) BlueJumpGame.spikesFloor.show(150, 46);
        else BlueJumpGame.lavaFloor.show(150, 50);
    }

    _showScore(score) {
        fill(0);
        strokeWeight(3);
        stroke(255);
        textAlign(CENTER);
        textSize(0.9 * BlueJumpGame.TEXT_SIZE);
        text(score, width / 2, 0.8 * BlueJumpGame.TEXT_SIZE);
    }

    _showCredits() {
        textAlign(RIGHT);
        textFont('arial');
        textSize(0.3 * BlueJumpGame.TEXT_SIZE);
        noStroke();
        text('\u00A9', width - 0.3 * BlueJumpGame.BARRIER_SCALE - 2 * BlueJumpGame.TEXT_SIZE, height / 2);
        textFont(BlueJumpGame.FONT);
        textSize(0.2 * BlueJumpGame.TEXT_SIZE);
        text('| 2016 | Nout Kleef', width - 0.3 * BlueJumpGame.BARRIER_SCALE, height / 2);
    }

    _loadAssetPixels() {
        // images
        BlueJumpGame.dirtblock[0].loadPixels();
        BlueJumpGame.spikes[0].loadPixels();
        BlueJumpGame.brickblock0[0].loadPixels();
        BlueJumpGame.brickblock1[0].loadPixels();
        BlueJumpGame.transition[0].loadPixels();
        BlueJumpGame.grave[0].loadPixels();
        // sprites
        BlueJumpGame.blueGuy02[0].loadPixels();
        BlueJumpGame.blueGuy03[0].loadPixels();
        BlueJumpGame.blueGuy04[0].loadPixels();
        BlueJumpGame.lava[0].loadPixels();
    }

    _setGameMode(mode) {
        switch (mode) {
            case -1:
                this.gameMode = -1;
                this.player.shouldUpdate = false;
                break;
            case 0:
                this.gameMode = 0;
                this.player.shouldUpdate = true;
                break;
            case 1:
                this.gameMode = 1;
                this.player.shouldUpdate = false;
        }
    }

    _handleGameMode(mode) {
        switch (mode) {
            case 0:
                if (!(BlueJumpGame.IS_SAFARI || // TODO: split off
                        BlueJumpGame.prefix(document, "FullScreen") ||
                        BlueJumpGame.prefix(document, "IsFullScreen"))) {
                    // not in fullscreen mode
                    this._setGameMode(-1);
                    this.fullScreenActive = false;
                }
                for (let i = 0; i < this.barriers.length; i++) {
                    this.barriers[i].update();
                }
                if (this.player.shouldUpdate && this.fullScreenActive) {
                    this.player.update();
                }
                break;
            case -1:
                noStroke();
                fill('rgba(0,0,0,0.8)'); // TODO: is there an actual function for this?
                rect(0, 0, window.screen.width, (BlueJumpGame.IS_SAFARI ? windowHeight : window.screen.height));
                fill(200, 200, 0);
                strokeWeight(BlueJumpGame.ARROW_SCALE * 0.125);
                stroke(255);
                // draw an arrow pointing to "play" button
                this._showInstructions();
                break;
            case 1:
                // TODO: cleanup
                console.warn("deprecated gameMode detected");
                break;
                noStroke();
                fill("rgba(0, 0, 0, 0.4)"); // TODO: is there an actual function for this?
                rect(0, 0, window.screen.width, (BlueJumpGame.IS_SAFARI ? windowHeight : window.screen.height));
                const xoff = width / 2 - 4.87 * BlueJumpGame.TEXT_SIZE;
                if (!this.returned) {
                    textSize(BlueJumpGame.TEXT_SIZE);
                    textAlign(CENTER);
                    if (floor(frameCount / 2) % 4 === 0) {
                        text('loading', width / 2, height / 2);
                    } else if (floor(frameCount / 2) % 4 === 1) {
                        text('loading.', width / 2, height / 2);
                    } else if (floor(frameCount / 2) % 4 === 2) {
                        text('loading..', width / 2, height / 2);
                    } else {
                        text('loading...', width / 2, height / 2);
                    }
                } else {
                    fill(255, 128, 0);
                    textSize(BlueJumpGame.TEXT_SIZE);
                    textAlign(CENTER);
                    textSize(0.5 * BlueJumpGame.TEXT_SIZE);
                    textAlign(LEFT);
                    text('#', xoff, 1.7 * BlueJumpGame.TEXT_SIZE + 115);
                    text('Player', xoff + 1.2 * BlueJumpGame.TEXT_SIZE, 1.7 * BlueJumpGame.TEXT_SIZE + 115);
                    text('Score', xoff + 8 * BlueJumpGame.TEXT_SIZE, 1.7 * BlueJumpGame.TEXT_SIZE + 115);
                    fill(255, 255, 255);
                    // showRanks(xoff);
                }
        }
    }

    _showInstructions() {
        push();
        translate(100, 30);
        beginShape();
        vertex(0, 0);
        vertex(
            BlueJumpGame.ARROW_SCALE * 1.05,
            0.27 * BlueJumpGame.ARROW_SCALE
        );
        vertex(
            0.62 * BlueJumpGame.ARROW_SCALE,
            0.55 * BlueJumpGame.ARROW_SCALE
        );
        vertex(
            1.65 * BlueJumpGame.ARROW_SCALE,
            2.085 * BlueJumpGame.ARROW_SCALE
        );
        vertex(
            1.18 * BlueJumpGame.ARROW_SCALE,
            2.41 * BlueJumpGame.ARROW_SCALE
        );
        vertex(
            0.18 * BlueJumpGame.ARROW_SCALE,
            0.79 * BlueJumpGame.ARROW_SCALE
        );
        vertex(
            -0.25 * BlueJumpGame.ARROW_SCALE,
            BlueJumpGame.ARROW_SCALE
        );
        endShape(CLOSE);
        pop();
        textAlign(LEFT);
        textSize(BlueJumpGame.TEXT_SIZE);
        fill(0);
        text("PLAY", 100, 30 + 3 * BlueJumpGame.ARROW_SCALE);
        strokeWeight(BlueJumpGame.ARROW_SCALE * 0.0675);
        textSize(0.5 * BlueJumpGame.TEXT_SIZE);
        text(BlueJumpGame.CONTROLS_MSG, 40, 4 * BlueJumpGame.ARROW_SCALE);
        text(BlueJumpGame.TIP, 40, 4.7 * BlueJumpGame.ARROW_SCALE);
    }

    play() {
        if (!BlueJumpGame.prefix(document, 'FullScreen') &&
            !BlueJumpGame.prefix(document, 'IsFullScreen')) {
            BlueJumpGame.prefix(
                document.getElementById('defaultCanvas0'),
                'RequestFullScreen'
            );
        }
        if (this.gameMode !== 1) {
            setTimeout(function () {
                this.fullScreenActive = true;
                this._setGameMode(0);
            }.bind(this), 1000);
        }
    }

    _pickNewHighest(oldPos, pickRandom, inSight) { // TODO: refactor
        let h, txtr;
        if (this.player.stats.alive) {
            txtr = BlueJumpGame.dirtblock;
            h = 46;
        } else {
            if (Math.random() < 0.25) {
                txtr = BlueJumpGame.brickblock0;
                h = 46;
            } else {
                txtr = BlueJumpGame.brickblock1;
                h = 33;
            }
        }
        if (!pickRandom) {
            const difficulty = Math.floor(this.player.stats.score / 2500) * 0.02 * BlueJumpGame.BARRIER_SCALE;
            difficulty = constrain(difficulty, 0, 0.5 * BlueJumpGame.BARRIER_SCALE);
            const constr = BlueJumpGame.MOBILE_CONTROLS ? 0.5 : 0.80;
            const dir = Math.random() < 0.5 ? 1 : -1;
            const maxY = 0.5 * (BlueJumpGame.JUMP_POWER * BlueJumpGame.JUMP_POWER + BlueJumpGame.JUMP_POWER) / BlueJumpGame.GRAVITY;
            const maxX = 1.7 * BlueJumpGame.JUMP_POWER * BlueJumpGame.HORIZONTAL_SPEED * constr * 1.2 + difficulty;
            maxX = constrain(maxX, 0, width);
            const increaseY = (0.3 + 0.7 * Math.random()) * maxY;
            const newX = constrain(oldPos.x + dir * (0.3 + 0.7 * Math.random()) * maxX, BlueJumpGame.MOVEMENT, width - BlueJumpGame.BARRIER_SCALE - BlueJumpGame.MOVEMENT);
            this.barriers.push(new Barrier(newX, oldPos.y - increaseY, 1, -3 + 6 * Math.random() * constr, 0, 0, BlueJumpGame.BARRIER_SCALE, 0.25 * BlueJumpGame.BARRIER_SCALE, new Sprite(txtr[0], txtr[1], txtr[2], txtr[3], txtr[4], txtr[5], txtr[6]), 150, h));
        } else {
            const x = 10 + Math.random() * (width - 110);
            const y = inSight ? -200 + Math.random() * ((BlueJumpGame.IS_SAFARI ? windowHeight : window.screen.height) + 200) : -200 + Math.random() * 175;
            const z = 2 + Math.random() * 1.1;
            this.fakeBarriers.push(new Barrier(x, y, z, 0, 0, 0, BlueJumpGame.BARRIER_SCALE, 0.25 * BlueJumpGame.BARRIER_SCALE, new Sprite(txtr[0], txtr[1] / z, txtr[2] / z, txtr[3], txtr[4], txtr[5], txtr[6]), 150, h));
        }
    }

    deviceOrientationHandler(e) {
        this.rotation = e.gamma;
        this.orientedMovement = e.gamma * 0.020444;
    }

    static prefix(obj, method) {
        let p = 0,
            m, t;
        while (p < BlueJumpGame.pfx.length && !obj[m]) {
            m = method;
            if (BlueJumpGame.pfx[p] === "") {
                m = m.substr(0, 1).toLowerCase() + m.substr(1);
            }
            m = BlueJumpGame.pfx[p] + m;
            t = typeof obj[m];
            if (t !== "undefined") {
                BlueJumpGame.pfx = [BlueJumpGame.pfx[p]];
                return (t === "function" ? obj[m]() : obj[m]);
            }
            p++;
        }
    }

    static isMobileDevice() {
        let check = false;
        (function (a) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true
        })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    }
}

BlueJumpGame.AUTOJUMP = true;
BlueJumpGame.DEBUG = true;
BlueJumpGame.LEVELCREATION = true;
BlueJumpGame.LANDING_THRESHOLD = 25;
BlueJumpGame.HORIZONTAL_SPEED = 11;
BlueJumpGame.GRAVITY = 1;
BlueJumpGame.BARRIER_SCALE = 0.07 * window.screen.width;
BlueJumpGame.ARROW_SCALE = 0.06 * window.screen.width;
BlueJumpGame.MOVEMENT = 0.75 * BlueJumpGame.BARRIER_SCALE;
BlueJumpGame.BACKGROUND_SHADES = 13;
BlueJumpGame.MAX_BARRIERS = 12; // maximum amount of (fake) barriers
BlueJumpGame.CONTROLS_MSG = '';
BlueJumpGame.TIP = '';
BlueJumpGame.MOBILE_CONTROLS = BlueJumpGame.isMobileDevice();
BlueJumpGame.JUMP_POWER;
BlueJumpGame.TEXT_SIZE = BlueJumpGame.BARRIER_SCALE * 0.5;
BlueJumpGame.FONT;
BlueJumpGame.pfx = ["webkit", "moz", "ms", "o", ""];
BlueJumpGame.field;
BlueJumpGame.IS_SAFARI = Object.prototype.toString
    .call(window.HTMLElement).indexOf('Constructor') > 0;
// load assets
BlueJumpGame.dirtblock = [
    null, // will be populated later - see preload()
    BlueJumpGame.BARRIER_SCALE,
    0.25 * BlueJumpGame.BARRIER_SCALE,
    1,
    false,
    0,
    0
];
BlueJumpGame.spikes = [
    null, // will be populated later - see preload()
    5 / 3 * BlueJumpGame.BARRIER_SCALE,
    0.513 * BlueJumpGame.BARRIER_SCALE,
    1,
    false,
    0,
    0
];
BlueJumpGame.lava = [
    null, // will be populated later - see preload()
    5 / 3 * BlueJumpGame.BARRIER_SCALE,
    0.558 * BlueJumpGame.BARRIER_SCALE,
    5,
    true,
    0,
    0
];
BlueJumpGame.brickblock0 = [
    null, // will be populated later - see preload()
    BlueJumpGame.BARRIER_SCALE,
    0.25 * BlueJumpGame.BARRIER_SCALE,
    1,
    false,
    0,
    0
];
BlueJumpGame.brickblock1 = [
    null, // will be populated later - see preload()
    BlueJumpGame.BARRIER_SCALE,
    0.25 * BlueJumpGame.BARRIER_SCALE,
    1,
    false,
    0,
    0
];
BlueJumpGame.blueGuy02 = [
    null, // will be populated later - see preload()
    2 * BlueJumpGame.BARRIER_SCALE / 3,
    2 * BlueJumpGame.BARRIER_SCALE / 3,
    7,
    true,
    18,
    18
];
BlueJumpGame.blueGuy03 = [
    null, // will be populated later - see preload()
    2 * BlueJumpGame.BARRIER_SCALE / 3,
    2 * BlueJumpGame.BARRIER_SCALE / 3,
    10,
    false,
    19,
    19
];
BlueJumpGame.blueGuy04 = [
    null, // will be populated later - see preload()
    2 * BlueJumpGame.BARRIER_SCALE / 3,
    2 * BlueJumpGame.BARRIER_SCALE / 3,
    6,
    false,
    19,
    19
];
BlueJumpGame.transition = [
    null, // will be populated later - see preload()
    2 * BlueJumpGame.BARRIER_SCALE / 3,
    2.2 * BlueJumpGame.BARRIER_SCALE / 3,
    1,
    false,
    0,
    0
];
BlueJumpGame.grave = [
    null, // will be populated later - see preload()
    2 * BlueJumpGame.BARRIER_SCALE / 3,
    2.2 * BlueJumpGame.BARRIER_SCALE / 3,
    1,
    false,
    0,
    0
];
