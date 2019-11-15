class TypeOne extends Enemy {
  constructor() {
    super('physTypeOne', 4.0, 10, 'physTypeOne', true, 0.15);
    this.decisionDelay = 0.0;
    this.rand = parseInt(Math.random()*4);
    this.baseSpeed = this.speed;
    this.escapeSpeed = 10.0;
    // this.playerCollided = false;
    this.slime = this.collidePlayer.bind(this);
    this.slimeColour = 'purple';
    this.slimeStat = 'speed';
    this.hasCollided = false;
  }

  collidePlayer() {
    if (this.hasCollided == false) {
      this.speed = this.escapeSpeed;
      return [this.slimeColour, this.slimeStat]; 
    }
    this.hasCollided = true;
  }

  update() {
    this.decisionDelay += 0.016;
    if (this.decisionDelay > 1) {
      this.rand = parseInt(Math.random()*4);
      if (this.hasCollided == true) { this.hasCollided = false };
      this.decisionDelay = 0.0;
    }
    // if (this.playerCollided == true) {
    //   this.speed = this.speed + this.boostedSpeed;
    //   this.playerCollided = false;
    // }
    // console.log(this.boostedSpeed);
    this.speed -= 0.05;
    if (this.speed < this.baseSpeed) {
      this.speed = this.baseSpeed;
    }
    if (this.rand == 0) {
      this.left();
    } else if (this.rand == 1) {
      this.right();
    } else if (this.rand == 2) {
      this.up();
    } else if (this.rand == 3) {
      this.down();
    } else {
      this.idle();
    }
  }
}