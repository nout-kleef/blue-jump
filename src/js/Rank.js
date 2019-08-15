function Rank(user, score, self) {
    this.user = user;
    this.score = score;
    if (self) {
        this.color = [255, 128, 0];
    } else {
        this.color = [255, 255, 255];
    }
}
