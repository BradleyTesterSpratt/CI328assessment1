class Enemy {
  constructor(sprite, speed, escapeSpeed, hitPoints, type, physical, scale) {
    this.baseSpeed = speed;
    this.speed = speed;
    this.maxHP = hitPoints;
    this.currentHP = this.maxHP;
    this.type = type;
    const enemySprite = game.physics.add.sprite(phaser.config.width /3, phaser.config.height /3, sprite);
    enemySprite.setScale(scale, scale);
    enemySprite.setOrigin(0.5, 0.5);
    this.physical = physical;
    this.facing = 0;
    //set depth to match player just in case it is necassary
    this.enemySprite = enemySprite
    this.enemySprite.setDepth(10);
    this.moving = false;
    this.enemySprite.enemy = this;
    this.slime = this.collidePlayer.bind(this);
    this.leash = this.collideBullet.bind(this);
    this.escapeSpeed = escapeSpeed;
    this.isLeashed = false;
  }

  collideBullet() {
    this.isLeashed = true;
  }

  collidePlayer() {
    if (this.hasCollided == false) {
      this.speed = this.escapeSpeed;
      this.enemySprite.alpha = 0.5;
      return [this.slimeColour, this.slimeStat]; 
    }
    this.hasCollided = true;
  }

  onDeath(callback) {
    //this.enemySprite.events.onKilled.add(callback);
  }

  left() {
    if (this.isLeashed) {return this.hurt()};
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
    if (this.isLeashed) {return this.hurt()};
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
    if (this.isLeashed) {return this.hurt()};
    this.enemySprite.anims.play(`${this.type}WalkBack`, true);
  }

  down() {
    this.moving = true;
    this.enemySprite.y += this.speed;
    this.facing = 0;
    if (this.isLeashed) {return this.hurt()};
    this.enemySprite.anims.play(`${this.type}WalkForward`, true);
  }

  idle() {
    if (this.isLeashed) {return this.hurt()};
    if (this.facing == 0) {
      this.enemySprite.anims.play(`${this.type}IdleForward`, true);
    }
    else {
      this.enemySprite.anims.play(`${this.type}IdleBack`, true);
    }
  }

  hurt() {
    if (this.facing == 1) {
      try {
        this.enemySprite.anims.play(`${this.type}BackHit`, true);
      }
      catch(err) {
        this.enemySprite.anims.play(`${this.type}Hit`, true);
      }
    } else {
      this.enemySprite.anims.play(`${this.type}Hit`, true);
    }
  }

  update() {
    this.speed -= 0.05;
    if (this.speed < this.baseSpeed) {
      this.enemySprite.alpha = 1.0;
      this.speed = this.baseSpeed;
    }
  }
}

