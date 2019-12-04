class TypeOne extends Enemy {
  constructor() {
    super('physTypeOne', 4.0, 10.0, 10, 'physTypeOne', true, 0.125);
    this.decisionDelay = 0.0;
    this.slimeColour = 'purple';
    this.slimeStat = 'speed';
    this.hasCollided = false;
  }

  update() {
    super.update();
  }

  perFrameUpdate() {
    super.perFrameUpdate();
  }
}