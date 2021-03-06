class EnemyGate {
  constructor(game, type, location, open) {
    const gate = game.physics.add.sprite(location.x, location.y, 'ghostGate');
    gate.setOrigin(0.5, 0.5);
    gate.setDepth(5);
    this.gate = gate;
    this.type = type.toLowerCase();
    this.open = open || false;
    this.gate.self = this;
    this.hp = 20;
    this.damageCooldown = 0;
    this.isAttacked = false;
  }

  update() {
    if (this.isAttacked) { this.damageCooldown += 0.16 };
    if (this.damageCooldown > 2) {
      this.damageCooldown = 0;
      this.isAttacked = false;
    }
  }

  setAnimation() {
    this.open ? this.gate.anims.play(`${this.type}Gate`, true) : this.gate.anims.play('closedGate', true)
  }

  damageGate(streamStrength) {
    if (this.isAttacked == false) {
      this.hp = this.hp - streamStrength;
      this.isAttacked = true;
      if (this.hp <= 0) { 
        this.alternateGate();
      };
    }
  }

  /**
   * currently there are no events that cause a gate to be reopened
   * this was implemented this way for future updates
   * i.e. certain ghosts or bosses may be able to open a gate.
   */
  alternateGate() {
    this.open = !this.open;
  }
}