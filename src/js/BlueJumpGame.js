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
        // initialise controls
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
        // initialise player
        this.player = new Player( // TODO: refactor this. drastically.
            width / 2 - BARRIER_SCALE / 3,
            height * 3 / 4,
            [
                document.getElementById("blueguy02"),
                2 * BARRIER_SCALE / 3,
                2 * BARRIER_SCALE / 3,
                7,
                true,
                18,
                18
            ], [
                document.getElementById("blueguy03"),
                2 * BARRIER_SCALE / 3,
                2 * BARRIER_SCALE / 3,
                10,
                false,
                19,
                19
            ], [
                document.getElementById("blueguy04"),
                2 * BARRIER_SCALE / 3,
                2 * BARRIER_SCALE / 3,
                6,
                false,
                19,
                19
            ], [
                document.getElementById("transition"),
                2 * BARRIER_SCALE / 3,
                2.2 * BARRIER_SCALE / 3,
                1,
                false,
                0,
                0
            ], [
                document.getElementById("grave"),
                2 * BARRIER_SCALE / 3,
                2.2 * BARRIER_SCALE / 3,
                1,
                false,
                0,
                0
            ]
        );
        // set up first barrier
        barriers.push( // TODO: refactor this too
            new Barrier(
                this.player.p.x + 0.5 * this.player.activities[this.player.activity].width - 0.5 * BARRIER_SCALE,
                this.player.p.y + this.player.activities[this.player.activity].height,
                1,
                0,
                0,
                0,
                BARRIER_SCALE,
                0.25 * BARRIER_SCALE,
                new SpriteAnimation(
                    dirtblock[0],
                    dirtblock[1],
                    dirtblock[2],
                    dirtblock[3],
                    dirtblock[4],
                    dirtblock[5],
                    dirtblock[6]),
                150,
                46
            )
        );
        // finalise
        this.pickNewHighest(0, true);
        this.gameMode(-1);
    }

    gameMode(mode) {
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

    play() {
        if (
            !BlueJumpGame.prefix(document, 'FullScreen') &&
            !BlueJumpGame.prefix(document, 'IsFullScreen')
        ) {
            BlueJumpGame.prefix(
                document.getElementById('defaultCanvas0'),
                'RequestFullScreen'
            );
        }
        if (this.gameMode !== 1) {
            setTimeout(() => {
                this.fullScreenActive = true;
                this.gameMode(0);
            }, 60);
        }
    }

    pickNewHighest(oldPos, pickRandom, inSight) { // TODO: refactor
        var h;
        if (player.stats.alive) {
            txtr = dirtblock;
            h = 46;
        } else {
            if (Math.random() < 0.25) {
                txtr = brickblock;
                h = 46;
            } else {
                txtr = brickblock2;
                h = 33;
            }
        }
        if (!pickRandom) {
            var difficulty = Math.floor(player.stats.score / 2500) * 0.02 * BARRIER_SCALE;
            difficulty = constrain(difficulty, 0, 0.5 * BARRIER_SCALE);
            var constr = CONTROLS === 1 ? 0.5 : 0.80;
            var dir = Math.random() < 0.5 ? 1 : -1;
            var maxY = 0.5 * (JUMP_POWER * JUMP_POWER + JUMP_POWER) / GRAVITY;
            var maxX = 1.7 * JUMP_POWER * HORIZONTAL_SPEED * constr * 1.2 + difficulty;
            maxX = constrain(maxX, 0, width);
            var increaseY = (0.3 + 0.7 * Math.random()) * maxY;
            var newX = constrain(oldPos.x + dir * (0.3 + 0.7 * Math.random()) * maxX, MOVEMENT, width - BARRIER_SCALE - MOVEMENT);
            barriers.push(new Barrier(newX, oldPos.y - increaseY, 1, -3 + 6 * Math.random() * constr, 0, 0, BARRIER_SCALE, 0.25 * BARRIER_SCALE, new SpriteAnimation(txtr[0], txtr[1], txtr[2], txtr[3], txtr[4], txtr[5], txtr[6]), 150, h));
        } else {
            var x = 10 + Math.random() * (width - 110);
            var y = inSight ? -200 + Math.random() * ((isSafari ? windowHeight : window.screen.height) + 200) : -200 + Math.random() * 175;
            var z = 2 + Math.random() * 1.1;
            fakeBarriers.push(new Barrier(x, y, z, 0, 0, 0, BARRIER_SCALE, 0.25 * BARRIER_SCALE, new SpriteAnimation(txtr[0], txtr[1] / z, txtr[2] / z, txtr[3], txtr[4], txtr[5], txtr[6]), 150, h));
        }
    }

    deviceOrientationHandler(e) {
        this.rotation = e.gamma;
        this.orientedMovement = e.gamma * 0.020444;
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
BlueJumpGame.IS_SAFARI = Object.prototype.toString
    .call(window.HTMLElement).indexOf('Constructor') > 0;
BlueJumpGame.prefix = (obj, method) => {
    let p = 0,
        m, t;
    while (p < BlueJumpGame.pfx.length && !obj[m]) {
        m = method;
        if (BlueJumpGame.pfx[p] === "") {
            m = m.substr(0, 1).toLowerCase() + m.substr(1);
        }
        m = BlueJumpGame.pfx[p] + m;
        t = typeof obj[m];
        if (t != "undefined") {
            BlueJumpGame.pfx = [BlueJumpGame.pfx[p]];
            return (t == "function" ? obj[m]() : obj[m]);
        }
        p++;
    }
};
BlueJumpGame.isMobileDevice = () => {
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))
};
// load assets
document.getElementById("dirtblock").onload = () => {
    BlueJumpGame.dirt0 = [
        document.getElementById("dirtblock"),
        BARRIER_SCALE,
        0.25 * BARRIER_SCALE,
        1,
        false,
        0,
        0
    ];
}
document.getElementById("spikes").onload = () => {
    BlueJumpGame.spikes = new Floor(
        document.getElementById("spikes"),
        5 / 3 * BARRIER_SCALE,
        0.513 * BARRIER_SCALE,
        1,
        false,
        0,
        0
    );
}
document.getElementById("lava02").onload = () => {
    BlueJumpGame.lava = new Floor(
        document.getElementById("lava02"),
        5 / 3 * BARRIER_SCALE,
        0.558 * BARRIER_SCALE,
        5,
        true,
        0,
        0
    );
}
document.getElementById("brickblock").onload = () => {
    BlueJumpGame.bricks0 = [
        document.getElementById("brickblock"),
        BARRIER_SCALE,
        0.25 * BARRIER_SCALE,
        1,
        false,
        0,
        0
    ];
}
document.getElementById("brickblock2").onload = () => {
    BlueJumpGame.bricks1 = [
        document.getElementById("brickblock2"),
        BARRIER_SCALE,
        0.25 * BARRIER_SCALE,
        1,
        false,
        0,
        0
    ];
}
