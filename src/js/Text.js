function TextAnimation(txt, beginSize, finalSize, transition, delay1, color, creation, x, y) {
    this.currentSize = beginSize - (beginSize % finalSize);
    this.finalSize = finalSize;
    this.decrease = (this.currentSize - this.finalSize) / transition;
    this.transition = transition;
    this.x = x;
    this.y = y;
    this.color = color;
    this.text = txt;
    this.delay1 = delay1;
    this.creation = creation;
    this.update = function () {
        if (this.currentSize > this.finalSize) {
            this.currentSize -= this.decrease
        }
    }
    this.show = function () {
        textSize(this.currentSize);
        textAlign(CENTER);
        fill(this.color);
        stroke(255);
        strokeWeight(6);
        text(this.text, (this.x === undefined ? width / 2 : this.x), (this.y === undefined ? height / 2 : this.y));
    }
    this.delete = function () {
        if (frameCount <= this.transition + this.delay1 + this.creation) {
            return true;
        } else {
            return false;
        }
    }
}
