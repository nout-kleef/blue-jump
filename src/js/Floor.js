class Floor {
    constructor(img, displayWidth, displayHeight, framesCount, action) {
        this.sprite = new SpriteAnimation(
            img, displayWidth, displayHeight, framesCount, action, 0, 0, 30
        );
        this.repeats = Math.ceil(window.screen.width / displayWidth);
    }

    show(origWidth, origHeight) {
        for (let i = 0; i < this.repeats; i++)
            this.image.show(
                i * this.image.width,
                (BlueJumpGame.IS_SAFARI ? windowHeight : window.screen.height) - this.image.height,
                origWidth,
                origHeight
            );
    }
}
