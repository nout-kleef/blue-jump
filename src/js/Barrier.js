function Barrier(x, y, z, xv, yv, zv, width, height, texture, origW, origH) {
    this.texture = texture;
    this.jumped = false;
    this.origW = origW;
    this.origH = origH;
    this.initialP = {
        x: x,
        y: y,
        z: z
    };
    this.p = {
        x: x,
        y: y,
        z: z
    };
    this.v = {
        x: xv,
        y: yv,
        z: zv
    };
    this.width = width / z;
    this.height = height / z;
    this.show = function () {
        this.texture.show(this.p.x, this.p.y, this.origW, this.origH);
    }
    this.update = function () {
        this.p.x += this.v.x;
        this.p.y += this.v.y;
        this.p.z += this.v.z;
        this.v.x = Math.abs(this.p.x - this.initialP.x) > MOVEMENT ? this.v.x * -1 : this.v.x;
    }
}
