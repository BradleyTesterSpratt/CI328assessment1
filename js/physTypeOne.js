class TypeOne extends Enemy {
  constructor() {
    super('physTypeOne', 4.0, 10.0, 10, 'physTypeOne', true, 0.125);
    this.decisionDelay = 0.0;
    this.rand = parseInt(Math.random()*4);
    this.slimeColour = 'purple';
    this.slimeStat = 'speed';
    this.hasCollided = false;
  }

  update() {
    super.update();
    this.decisionDelay += 0.016;
    if (this.decisionDelay > 1) {
      this.rand = parseInt(Math.random()*4);
      if (this.hasCollided == true) { this.hasCollided = false} ;
      if (this.isLeashed == true) {
        this.isLeashed = false;
        this.speed = this.speed + ((this.rand+3) * ((this.rand+1)/10));
        //stops the enemy from standing still while being leashed
        if (this.rand == 4) { this.rand = parseInt(Math.random()*3)}
      };
      this.decisionDelay = 0.0;
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