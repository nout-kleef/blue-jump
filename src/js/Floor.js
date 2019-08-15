function Floor(img, imgWidth, imgHeight, frames, action) {
    this.image = new SpriteAnimation(img, imgWidth, imgHeight, frames, action, 0, 0, 30);
    this.repeats = Math.ceil(window.screen.width / imgWidth);
    this.show = function (origW, origH) {
        for (var i = 0; i < this.repeats; i++) {
            this.image.show(i * this.image.width, (isSafari ? windowHeight : window.screen.height) - this.image.height, origW, origH);
        }
    }
}
