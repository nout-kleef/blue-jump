function SpriteAnimation(img, width, height, frames, action, paddingleft, paddingright, fpsScale) {
    this.fpsScale = fpsScale === undefined ? 2 : fpsScale;
    this.img = img;
    this.width = width;
    this.height = height;
    this.frames = frames;
    this.action = action;
    this.count = 0;
    this.padding = {
        left: (paddingleft = undefined ? 0 : paddingleft),
        right: (paddingright = undefined ? 0 : paddingright)
    };
    this.show = function (x, y, origW, origH) {
        var frame = Math.floor(this.count / this.fpsScale) % this.frames;
        this.count++;
        // voer de action van de foto uit (bijvoorbeeld ogen knipperen)
        if (this.action && frame === this.frames - 1) {
            if (Math.random() > 0.25) {
                frame = 0;
                this.count++;
            }
        }
        field.drawImage(
            this.img, // de sprite
            frame * (origW === undefined ? this.width : origW), // waar op de img pakken x
            0, // waar op de img pakken y
            (origW === undefined ? this.width : origW), // breedte van pakken
            (origH === undefined ? this.height : origH), // hoogte van pakken
            x, // x op canvas
            y, // y op canvas
            this.width, // breedte op canvas
            this.height // hoogte op canvas
        );
    }
}
