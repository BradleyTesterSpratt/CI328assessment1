class Enemy {
  constructor(sprite, speed, hitPoints) {
    this.speed = speed;
    this.maxHP = hitPoints;
    this.currentHP = this.maxHP;
    enemySprite = game.physics.add.sprite(phaser.config.width / 2, phaser.config.height /2, sprite);
    // enemySprite.setScale(0.40, 0.40);
    enemySprite.setOrigin(0.5, 0.5);
    enemySprite.setCollideWorldBounds(true);
    this.facing = 0;
    //set depth to match player just in case it is necassary
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
    if (this.facing == 0) {
      this.enemySprite.anims.play('walkLeft', true);
    }
    else {
      this.enemySprite.anims.play('walkBackLeft', true);
    }
  }

  right() {
    this.moving = true;
    this.enemySprite.x += this.speed;
    if (this.facing == 0) {
      this.enemySprite.anims.play('walkRight', true);
    }
    else {
      this.enemySprite.anims.play('walkBackRight', true);
    }
  }

  up() {
    this.moving = true;
    this.enemySprite.y -= this.speed;
    this.facing = 1;
    this.enemySprite.anims.play('walkBack', true);
  }

  down() {
    this.moving = true;
    this.enemySprite.y += this.speed;
    this.facing = 0;
    this.enemySprite.anims.play('walkForward', true);
  }

  idle() {
    if (this.facing == 0) {
      this.enemySprite.anims.play('idleForward', true);
    }
    else {
      this.enemySprite.anims.play('idleBack', true);
    }
  }
}