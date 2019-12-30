class Enemy {
  constructor(location, sprite, speed, escapeSpeed, hitPoints, type, isPhysical, scale, behaviour) {
    this.baseSpeed = speed;
    this.speed = speed;
    this.maxHP = hitPoints;
    this.currentHP = this.maxHP;
    this.type = type;
    const enemySprite = game.physics.add.sprite(location.x, location.y, sprite);
    enemySprite.setScale(scale, scale);
    enemySprite.setOrigin(0.5, 0.5);
    this.isPhysical = isPhysical;
    this.facing = 0;
    //set depth to match player just in case it is necassary
    this.enemySprite = enemySprite
    this.enemySprite.setDepth(10);
    this.moving = 'idle';
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
    this.hasHitWall = false;
    this.enemySprite.enemy = this;
    this.hitWall = this.hitWall.bind(this);
    this.active = true;
    this.slimeDelay = 0.0;
    this.hasCollided = false;
  }

  collideBullet(streamStrength) {
    this.updateColliderScale(1.5);
    if (this.isLeashed == false) {
      this.currentHP = this.currentHP - streamStrength;
      this.isLeashed = true;
    }
    return {'hp': this.currentHP, 'x': this.enemySprite.x , 'y': this.enemySprite.y};
  }

  trap() {
    this.enemySprite.y -= 15;
    this.hurt();
    this.active = false;
  }

  updateColliderScale(scale) {
    this.enemySprite.setSize(this.baseColliderSize.x * scale, this.baseColliderSize.y * scale);
    scale == 1 ? this.enemySprite.setOrigin(0.5, 0.5) : this.enemySprite.setOrigin(0.5/scale, 0.5/scale);
  }

  collidePlayer() {
    if (this.hasCollided == false) {
      this.speed = this.escapeSpeed;
      this.enemySprite.alpha = 0.5;
      this.hasCollided = true;
      return {'colour': this.slimeColour, 'debuff': this.slimeStat}; 
    }
  }

  onDeath(callback) {
    //this.enemySprite.events.onKilled.add(callback);
  }

  left() {
    if (this.isLeashed) {return this.hurt()};
    this.moving = 'left';
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
    this.moving = 'right';
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
    this.moving = 'up';
    this.enemySprite.y -= this.speed;
    this.facing = 1;
    if (this.isLeashed) {return this.hurt()};
    this.enemySprite.anims.play(`${this.type}WalkBack`, true);
  }

  down() {
    this.moving = 'down';
    this.enemySprite.y += this.speed;
    this.facing = 0;
    if (this.isLeashed) {return this.hurt()};
    this.enemySprite.anims.play(`${this.type}WalkForward`, true);
  }

  idle() {
    this.moving = 'idle';
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
    if (this.active == true) {
      if (this.behaviour == 'dumb') {this.dumbBehaviour(this.behaviourRandomNumber)}
      if (this.hasHitWall == false) {this.moving = 'idle'}
    }
    if (this.hasCollided == true) {this.slimeDelay += 0.016};
    if (this.slimeDelay > 2) {
      this.slimeDelay = 0.0;
      this.hasCollided = false;
    }
}

  getRandomNumber(highestValue) {
    return parseInt(Math.random()*highestValue);
  }

  perFrameUpdate() {
    if (this.active == true) {
      // if (this.hasCollided == true) { this.hasCollided = false} ;
      if (this.isLeashed == false) {
        if (this.currentHP < this.maxHP) {
          this.currentHP += 1;
        }
      }
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
    } else {
      this.enemySprite.scaleX = (this.enemySprite.scaleX * 0.95);
      this.enemySprite.scaleY = (this.enemySprite.scaleY * 0.95);
      if (this.enemySprite.scaleX <= 0.01) {
        this.enemySprite.destroy();
      }
    }
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
        this.enemySprite.y += this.speed;
        this.idle();
        break;
      case "down":
        this.enemySprite.y -= this.speed;
        this.idle();
        break;
      case "left":
        this.enemySprite.x += this.speed;
        this.idle();
        break;
      case "right":
        this.enemySprite.x -= this.speed;
        this.idle();
        break;
      default:
        this.idle();
    }
  }
}

