class Sprite {
    constructor(
        img,
        displayWidth, displayHeight,
        framesCount,
        action,
        paddingLeft, paddingRight,
        fpsScale
    ) {
        this.img = img;
        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        this.framesCount = framesCount;
        this.action = action;
        this.count = 0;
        this.fpsScale = typeof fpsScale === 'undefined' ? 2 : fpsScale;
        this.padding = {
            left: typeof paddingLeft === 'undefined' ? 0 : paddingLeft,
            right: typeof paddingRight === 'undefined' ? 0 : paddingRight
        };
    }

    show(x, y, origWidth, origHeight) {
        const frameIndex =
            Math.floor(this.count / this.fpsScale) % this.framesCount;
        const srcWidth = typeof origWidth === 'undefined' ? this.displayWidth : origWidth;
        const srcHeight = typeof origHeight === 'undefined' ? this.displayHeight : origHeight;
        this.count++;
        // perform the action (such as blinking)
        if (this.action && frameIndex === this.framesCount - 1 && Math.random() > 0.25) {
            frameIndex = 0;
            this.count++;
        }
        BlueJumpGame.field.drawImage(
            this.img,
            frameIndex * srcWidth, 0,
            srcWidth, srcHeight,
            x, y,
            this.displayWidth, this.displayHeight
        );
    }
}
