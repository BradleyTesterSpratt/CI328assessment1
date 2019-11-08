class TypeOne extends Enemy {
  constructor() {
    super('physTypeOne', 4, 10, 'physTypeOne', true, 0.15)
    this.decisionDelay = 0.0;
    this.rand = parseInt(Math.random()*4);
  }

  update(){
    this.decisionDelay += 0.016;
    if (this.decisionDelay > 1) {
      this.rand = parseInt(Math.random()*4);    
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