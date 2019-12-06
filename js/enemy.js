class Enemy {
  constructor(sprite, speed, escapeSpeed, hitPoints, type, isPhysical, scale, behaviour) {
    this.baseSpeed = speed;
    this.speed = speed;
    this.maxHP = hitPoints;
    this.currentHP = this.maxHP;
    this.type = type;
    const enemySprite = game.physics.add.sprite(phaser.config.width /2 + 100, phaser.config.height /3, sprite);
    enemySprite.setScale(scale, scale);
    enemySprite.setOrigin(0.5, 0.5);
    this.isPhysical = isPhysical;
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
    this.baseColliderSize = {x: this.enemySprite.width, y: this.enemySprite.height};
    this.decisionDelay = 0.0;
    //this needs chaning when more behaviours added
    this.behaviour = behaviour || 'dumb';
    this.behaviourRandomNumber = 4;
    this.hitWall = false;
    this.enemySprite.enemy = this;
  }

  collideBullet() {
    this.isLeashed = true;
    this.updateColliderScale(1.75);
  }

  updateColliderScale(scale) {
    this.enemySprite.setSize(this.baseColliderSize.x * scale, this.baseColliderSize.y * scale);
    scale == 1 ? this.enemySprite.setOrigin(0.5, 0.5) : this.enemySprite.setOrigin(0.5/scale, 0.5/scale);
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
    this.decisionDelay += 0.016;
    if (this.decisionDelay > 1) {
      this.perFrameUpdate();
    }
    if (this.behaviour == 'dumb') {this.dumbBehaviour(this.behaviourRandomNumber)}
  }

  getRandomNumber(highestValue) {
    return parseInt(Math.random()*highestValue);
  }

  perFrameUpdate() {
    if (this.hasCollided == true) { this.hasCollided = false} ;
    if (this.isLeashed == true) {
      this.isLeashed = false;
      let rand = this.getRandomNumber(4);
      this.speed = this.speed + ((rand+3) * ((rand+1)/10));
    } else {
      this.updateColliderScale(1);
    }
    this.decisionDelay = 0.0;
    this.behaviourRandomNumber = this.getRandomNumber(4);
    if (this.isLeashed && this.behaviour == 'dumb') {this.behaviourRandomNumber = parseInt(Math.random()*3)};
  }

  dumbBehaviour(randomNumber) {
    if (randomNumber == 0) {
      this.left();
    } else if (randomNumber == 1) {
      this.right();
    } else if (randomNumber == 2) {
      this.up();
    } else if (randomNumber == 3) {
      this.down();
    } else {
      this.idle();
    }
  }

  hitWall(direction) {
    this.hasHitWall = true;
    switch(direction) {
      case "up":
        this.playerBody.y += this.speed;
        this.playerWand.y = this.playerBody.y;
        this.idle();
        break;
      case "down":
        this.playerBody.y -= this.speed;
        this.playerWand.y = this.playerBody.y;
        this.idle();
        break;
      case "left":
        this.playerBody.x += this.speed;
        this.playerWand.x = this.playerBody.x;
        this.idle();
        break;
      case "right":
        this.playerBody.x -= this.speed;
        this.playerWand.x = this.playerBody.x;
        this.idle();
        break;
      default:
        this.idle();
    }
  }
}

