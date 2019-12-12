class EnemyGate {
  constructor(type, location, open) {
    const gate = game.physics.add.sprite(location.x, location.y, 'ghostGate');
    gate.setOrigin(0.5, 0.5);
    gate.setDepth(5);
    this.gate = gate;
    this.type = type.toLowerCase();
    this.open = open || false;
    this.gate.self = this;
  }

  setAnimation() {
    this.open ? this.gate.anims.play(`${this.type}Gate`, true) : this.gate.anims.play('closedGate', true)
  }

  alternateGate() {
    this.open = !this.open;
  }
}