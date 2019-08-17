class Text {
    constructor(
        text, beginSize, finalSize, transition, delay, colour, creation, x, y
    ) {
        this.text = text;
        this.finalSize = finalSize;
        this.currentSize = beginSize - (beginSize % finalSize); // TODO: check this
        this.decrease = (this.currentSize - this.finalSize) / transition;
        this.transition = transition;
        this.delay = delay;
        this.colour = colour;
        this.creation = creation;
        this.x = typeof x === 'undefined' ? width / 2 : x;
        this.y = typeof y === 'undefined' ? height / 2 : y;
    }

    update() {
        if (this.currentSize > this.finalSize) this.currentSize -= this.decrease;
    }

    show() {
        textSize(this.currentSize);
        textAlign(CENTER);
        fill(this.colour);
        stroke(255);
        strokeWeight(6);
        text(this.text, this.x, this.y);
    }

    shouldBeDeleted() {
        return frameCount <= this.transition + this.delay + this.creation;
    }
}
