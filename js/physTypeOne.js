class TypeOne extends Enemy {
  constructor() {
    super('physTypeOne', 4, 10, 'physTypeOne', true)
  }

  update(){
    this.rand = Math.random()*4;
    if (rand == 0) {
      this.left();
    } else if (rand == 1) {
      this.right();
    } else if (rand == 2) {
      this.up();
    } else if (rand == 3) {
      this.down();
    } else {
      this.idle();
    }
  }
}