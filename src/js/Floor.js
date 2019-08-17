class Floor {
    constructor(img, displayWidth, displayHeight, framesCount, action) {
        this.sprite = new Sprite(
            img, displayWidth, displayHeight, framesCount, action, 0, 0, 30
        );
        this.repeats = Math.ceil(window.screen.width / displayWidth);
    }

    show(origWidth, origHeight) {
        for (let i = 0; i < this.repeats; i++)
            this.sprite.show(
                i * this.sprite.displayWidth,
                (BlueJumpGame.IS_SAFARI ? windowHeight : window.screen.height) - this.sprite.displayHeight,
                origWidth,
                origHeight
            );
    }
}
