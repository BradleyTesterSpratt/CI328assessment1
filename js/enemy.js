class Enemy {
  constructor(sprite, speed, hitPoints, type, physical) {
    this.speed = speed;
    this.maxHP = hitPoints;
    this.currentHP = this.maxHP;
    this.type = type;
    const enemySprite = game.physics.add.sprite(phaser.config.width / 2, phaser.config.height /2, sprite);
    enemySprite.setScale(0.10, 0.10);
    enemySprite.setOrigin(0.5, 0.5);
    enemySprite.setCollideWorldBounds(physical);
    this.facing = 0;
    //set depth to match player just in case it is necassary
    this.enemySprite = enemySprite
    this.enemySprite.setDepth(10);
    this.moving = false; 
  }

  slime() {
    //action when it hits a player
  }

  onDeath(callback) {
    //this.enemySprite.events.onKilled.add(callback);
  }

  left() {
    this.moving = true;
    this.enemySprite.x -= this.speed;
    // if (this.facing == 0) {
      this.enemySprite.anims.play(`${this.type}WalkLeft`, true);
    // }
    // else {
      // this.enemySprite.anims.play(`${this.type}WalkBackLeft`, true);
    // }
  }

  right() {
    this.moving = true;
    this.enemySprite.x += this.speed;
    // if (this.facing == 0) {
      this.enemySprite.anims.play(`${this.type}WalkRight`, true);
    // }
    // else {
      // this.enemySprite.anims.play(`${this.type}WalkBackRight`, true);
    // }
  }

  up() {
    this.moving = true;
    this.enemySprite.y -= this.speed;
    this.facing = 1;
    this.enemySprite.anims.play(`${this.type}WalkBack`, true);
  }

  down() {
    this.moving = true;
    this.enemySprite.y += this.speed;
    this.facing = 0;
    this.enemySprite.anims.play(`${this.type}WalkForward`, true);
  }

  idle() {
    if (this.facing == 0) {
      this.enemySprite.anims.play(`${this.type}IdleForward`, true);
    }
    else {
      this.enemySprite.anims.play(`${this.type}IdleBack`, true);
    }
  }

  update() {
    //enemy behaviour goes here
  }
}

