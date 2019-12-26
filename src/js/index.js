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
    bj.loop(BlueJumpGame.DEBUG);
}
