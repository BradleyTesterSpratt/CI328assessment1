class Enemy {
  constructor(sprite, speed, hitPoints, type, physical, scale) {
    this.speed = speed;
    this.maxHP = hitPoints;
    this.currentHP = this.maxHP;
    this.type = type;
    const enemySprite = game.physics.add.sprite(phaser.config.width /3, phaser.config.height /3, sprite);
    enemySprite.setScale(scale, scale);
    enemySprite.setOrigin(0.5, 0.5);
    enemySprite.setCollideWorldBounds(physical);
    this.facing = 0;
    //set depth to match player just in case it is necassary
    this.enemySprite = enemySprite
    this.enemySprite.setDepth(10);
    this.moving = false;
    this.enemySprite.enemy = this;
  }

  slime() {
    //action when it hits a player
  }

  getSpeed() { 
    return this.speed;
  }

  onDeath(callback) {
    //this.enemySprite.events.onKilled.add(callback);
  }

  left() {
    this.moving = true;
    this.enemySprite.x -= this.speed;
    if (this.facing == 1) {
      try {
        this.enemySprite.anims.play(`${this.type}WalkBackLeft`, true);
      }
      catch(err) {
        this.enemySprite.anims.play(`${this.type}WalkLeft`, true);
      }
    } else {
      this.enemySprite.anims.play(`${this.type}WalkLeft`, true);
    }
  }

  right() {
    this.moving = true;
    this.enemySprite.x += this.speed;
    if (this.facing == 1) {
      try {
        this.enemySprite.anims.play(`${this.type}WalkBackRight`, true);
      }
      catch(err) {
        this.enemySprite.anims.play(`${this.type}WalkRight`, true);
      }
    } else {
      this.enemySprite.anims.play(`${this.type}WalkRight`, true);
    }
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

