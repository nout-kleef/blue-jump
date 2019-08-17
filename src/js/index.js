let bj;

function preload() {
    // images
    BlueJumpGame.dirtblock[0] = loadImage('assets/img/dirt0.png');
    BlueJumpGame.spikes[0] = loadImage('assets/img/spikes.png');
    BlueJumpGame.brickblock0[0] = loadImage('assets/img/bricks0.png');
    BlueJumpGame.brickblock1[0] = loadImage('assets/img/bricks1.png');
    BlueJumpGame.transition[0] = loadImage('assets/img/transition.png');
    BlueJumpGame.grave[0] = loadImage('assets/img/grave.png');
    // sprites
    BlueJumpGame.blueGuy02[0] = loadImage('assets/img/sprites/bouncing.png');
    BlueJumpGame.blueGuy03[0] = loadImage('assets/img/sprites/walking.png');
    BlueJumpGame.blueGuy04[0] = loadImage('assets/img/sprites/undead.png');
    BlueJumpGame.lava[0] = loadImage('assets/img/sprites/lava.png');
    // fonts
    BlueJumpGame.FONT = loadFont('assets/fonts/robot01.ttf');
}

function setup() {
    // finish up loading the assets
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
    // change behaviour depending on browser
    if (BlueJumpGame.IS_SAFARI) {
        createCanvas(window.screen.width, windowHeight);
    } else {
        createCanvas(window.screen.width, window.screen.height);
    }
    BlueJumpGame.field =
        document.getElementById("defaultCanvas0").getContext("2d");
    // initialise game instance
    bj = new BlueJumpGame();
    colorMode(RGB);
    bj.colours = [
        color(64, 112, 184),
        color(191, 218, 235),
        color(90, 0, 0),
        color(200, 0, 0)
    ];
    // keep speed similar across different devices
    if (BlueJumpGame.MOBILE_CONTROLS === 0) frameRate(30);
    else frameRate(27);
    // fix font
    textFont(BlueJumpGame.FONT);
}

function draw() {
    background(51);
    noStroke();
    // draw shaded background
    for (let bg = 0; bg < 1; bg += 1 / BlueJumpGame.BACKGROUND_SHADES) {
        const origin = bj.player.stats.alive ? 0 : 2; // 01:alive, 23:dead
        const shade = lerpColor(
            bj.colours[origin], bj.colours[origin + 1], bg
        );
        fill(shade);
        rect(0, height * bg, width, height * (bg + 1));
    }
    // draw the fake barriers
    let highestFake = bj.fakeBarriers[0];
    for (let fb = 0; fb < bj.fakeBarriers.length; fb++) {
        if (bj.fakeBarriers[fb].p.y < highestFake.p.y)
            highestFake = bj.fakeBarriers[fb]; // TODO: is this right?
        bj.fakeBarriers[fb].show();
    }
    if (bj.fakeBarriers.length < BlueJumpGame.MAX_BARRIERS)
        bj.pickNewHighest(
            highestFake.p,
            true,
            bj.fakeBarriers.length < BlueJumpGame.MAX_BARRIERS - 2
        );
    // draw the real barriers
    let highest = bj.barriers[0];
    for (let b = 0; b < bj.barriers.length; b++) {
        if (bj.barriers[b].p.y < highest.p.y)

            highest = bj.barriers[b]; // TODO: is this right?
        bj.barriers[b].show();
    }
    if (highest.p.y > -100 && BlueJumpGame.LEVELCREATION)
        bj.pickNewHighest(highest.p, false);
    // extra information
    if (BlueJumpGame.DEBUG) {
        textAlign(RIGHT);
        textSize(18);
        stroke(0);
        fill(255, 255, 0);
        text("Score: " + bj.player.getScore(), width - 60, 60);
        text("Barriers: " + bj.player.stats.barriersJumped, width - 60, 90);
        text("Pixels traversed vertically: " + bj.player.getTraversedPixels(), width - 60, 120);
        text("FPS: " + Math.round(frameRate()), width - 60, 150);
        text("Controls: " + BlueJumpGame.MOBILE_CONTROLS, width - 60, 210);
        text("rotation: " + bj.rotation.toFixed(3), width - 60, 240);
        text("orientedMovement: " + bj.orientedMovement.toFixed(3), width - 60, 270);
        text("barriersLength: " + bj.fakeBarriers.length, width - 60, 300);
        text("width: " + window.screen.width, width - 60, 330);
        text("height: " + (BlueJumpGame.IS_SAFARI ? windowHeight : window.screen.height), width - 60, 360);
        text("mouseX, mouseY: " + mouseX + ", " + mouseY, width - 60, 390);
    }
    // show character performing current activity
    bj.player.activities[bj.player.activity].show(
        bj.player.p.x, bj.player.p.y,
        100, 100
    );
    // display the floor
    if (bj.player.stats.alive) BlueJumpGame.spikesFloor.show(150, 46);
    else BlueJumpGame.lavaFloor.show(150, 50);
    // show any text "animations"
    for (let i = 0; i < bj.textAnimations.length; i++) {
        if (bj.textAnimations[i].shouldBeDeleted()) {
            bj.textAnimations[i].update();
            bj.textAnimations[i].show();
        } else bj.textAnimations[i].splice(i, 1);
    }
    // show stuff depending on current gameMode TODO: refactor this
    switch (bj.gameMode) {
        case 0:
            if (!BlueJumpGame.IS_SAFARI && // TODO: split off
                !BlueJumpGame.prefix(document, "FullScreen") &&
                !BlueJumpGame.prefix(document, "IsFullScreen")) {
                // not in fullscreen mode
                bj.setMode(-1);
                bj.fullScreenActive = false;
            }
            for (let i = 0; i < bj.barriers.length; i++) {
                bj.barriers[i].update();
            }
            if (bj.player.shouldUpdate && bj.fullScreenActive) {
                bj.player.update();
            }
            break;
        case -1:
            noStroke();
            fill('rgba(0,0,0,0.8)'); // TODO: is there an actual function for this?
            rect(0, 0, window.screen.width, (BlueJumpGame.IS_SAFARI ? windowHeight : window.screen.height));
            fill(200, 200, 0);
            strokeWeight(BlueJumpGame.ARROW_SCALE * 0.125);
            stroke(255);
            // teken een pijl
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
            break;
        case 1:
            noStroke();
            fill("rgba(0, 0, 0, 0.4)"); // TODO: is there an actual function for this?
            rect(0, 0, window.screen.width, (BlueJumpGame.IS_SAFARI ? windowHeight : window.screen.height));
            const xoff = width / 2 - 4.87 * BlueJumpGame.TEXT_SIZE;
            if (!bj.returned) {
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
    // show player's score
    fill(0);
    strokeWeight(3);
    stroke(255);
    textAlign(CENTER);
    textSize(0.9 * BlueJumpGame.TEXT_SIZE);
    text(bj.player.stats.score, width / 2, 0.8 * BlueJumpGame.TEXT_SIZE);
    // show credits
    textAlign(RIGHT);
    textFont('arial');
    textSize(0.3 * BlueJumpGame.TEXT_SIZE);
    noStroke();
    text('\u00A9', width - 0.3 * BlueJumpGame.BARRIER_SCALE - 2 * BlueJumpGame.TEXT_SIZE, height / 2);
    textFont(BlueJumpGame.FONT);
    textSize(0.2 * BlueJumpGame.TEXT_SIZE);
    text('| 2016 | Nout Kleef', width - 0.3 * BlueJumpGame.BARRIER_SCALE, height / 2);
}
