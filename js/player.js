class Player {
  constructor() {
    const playerSprite = game.physics.add.sprite(phaser.config.width / 2 - 100, phaser.config.height /2, 'buster_sp');
    playerSprite.setScale(0.40, 0.40);
    playerSprite.setOrigin(0.5, 0.5);
    playerSprite.setCollideWorldBounds(true);
    const wandSprite = game.add.sprite(playerSprite.x, playerSprite.y, 'wand_sp');
    wandSprite.setScale(0.40, 0.40);
    wandSprite.setOrigin(0.5, 0.5);
    this.facing = 0;
    this.playerBody = playerSprite;
    this.playerWand = wandSprite;
    this.playerBody.setDepth(10);
    this.playerWand.setDepth(20);
    this.moving = 'idle'; 
    this.scaleRatio = 0.0;
    this.playerBody.player = this;
    this.baseSpeed = 5;
    this.speed = 5;
    this.currentSlimes = [];
    this.slime = this.collideGhost.bind(this);
    this.hasCollided = false;
    this.decisionDelay = 0.0;
    this.moveInputDelay = 0.0;
    const firstSlime = game.add.sprite(playerSprite.x, playerSprite.y, 'firstSlime');
    firstSlime.setDepth(11);
    firstSlime.setScale(0.4, 0.4);
    firstSlime.forwardScale = {x:0.4, y: 0.4};
    this.firstSlime = firstSlime;
    this.firstSlime.visible = false;
    const wandSpark = game.add.sprite(this.wandEndX, this.wandEndY, 'wandSpark')
    wandSpark.setDepth(20);
    wandSpark.setScale(0.3, 0.3);
    wandSpark.alpha = 0.75;
    this.wandSpark = wandSpark;
    this.wandSpark.visible = false;
    this.wandEndX = 0;
    this.wandEndY = 0;
    this.wandOffsetX = 0;
    this.wandOffsetY = 0;
    this.firing = false;
    this.hasHitWall = false;
    this.hitWall = this.hitWall.bind(this);
    this.hasMovedInput = false;
    this.setMove = this.setMove.bind(this);
    this.streamStrength = 1;
  }

  collideGhost(array) {
    if (this.hasCollided == false) {
      if (array[1] == 'speed') {
        this.firstSlime.tint = Constants.colour.pinkSlime;
        this.firstSlime.anims.play('slimeDripA', true);

        this.firstSlime.visible = true;
        this.speed = this.speed/2;
        this.currentSlimes.push([this.firstSlime, 'speed']);
        game.time.scene.time.delayedCall(6000, this.cleanSlime, [], this);
      }
    }
    this.hasCollided = true;
  }

  cleanSlime() {
    if (this.currentSlimes[0][1] == 'speed') {
      this.currentSlimes[0][0].visible = false;
      this.currentSlimes.shift();
      this.speed = this.baseSpeed;
    }
  }

  left() {
    this.playerBody.x -= this.speed;
    this.playerWand.x = this.playerBody.x;
    if (this.facing == 0) {
      this.playerBody.anims.play('walkLeft', true);
    }
    else {
      this.playerBody.anims.play('walkBackLeft', true);
    }
    this.hasMovedInput = true;
  }

  right() {
    this.playerBody.x += this.speed;
    this.playerWand.x = this.playerBody.x;
    if (this.facing == 0) {
      this.playerBody.anims.play('walkRight', true);
    }
    else {
      this.playerBody.anims.play('walkBackRight', true);
    }
    this.hasMovedInput = true;
  }

  up() {
    this.playerBody.y -= this.speed;
    this.playerWand.y = this.playerBody.y;
    this.facing = 1;
    this.playerWand.setDepth(5)
    this.playerBody.anims.play('walkBack', true);
    this.hasMovedInput = true;
  }

  down() {
    this.playerBody.y += this.speed;
    this.playerWand.y = this.playerBody.y;
    this.facing = 0;
    this.playerWand.setDepth(20)
    this.playerBody.anims.play('walkForward', true);
    this.hasMovedInput = true;
  }

  move() {
    switch(this.moving) {
      case 'up':
        this.up();
        break;
      case 'down':
        this.down();
        break;
      case 'left':
        this.left();
        break;
      case 'right':
        this.right();
        break;
      default:
        this.idle();
    }
  }

  idle() {
    if (this.facing == 0) {
      this.playerBody.anims.play('idleForward', true);
    }
    else {
      this.playerBody.anims.play('idleBack', true);
    }
  }

  updateSlime(slime) {
    slime.x = this.playerBody.x;
    slime.y = this.playerBody.y;
    this.facing == 0 ? slime.setScale(slime.forwardScale.x, slime.forwardScale.y): slime.setScale(slime.forwardScale.x*-1, slime.forwardScale.y);
  }

  randomiseSpark(int) {
    let tint = 0x000000
    switch(int) {
      case 0:
        tint = Constants.colour.streamWhite;
        break;
      case 1:
        tint = Constants.colour.streamRed;
        break;
      default:
        tint = Constants.colour.streamYellow;
    }
    this.wandSpark.tint = tint;
  }

  setMove(direction) {
    if (this.hasMovedInput == false) { this.moving = direction }
  }

  hitWall() {
    this.hasHitWall = true;
    switch(this.moving) {
      case "up":
        this.playerBody.y += this.speed;
        this.playerWand.y = this.playerBody.y;
        this.moving = 'idle';
        break;
      case "down":
        this.playerBody.y -= this.speed;
        this.playerWand.y = this.playerBody.y;
        this.moving = 'idle';
        break;
      case "left":
        this.playerBody.x += this.speed;
        this.playerWand.x = this.playerBody.x;
        this.moving = 'idle';
        break;
      case "right":
        this.playerBody.x -= this.speed;
        this.playerWand.x = this.playerBody.x;
        this.moving = 'idle';
        break;
      default:
        this.moving = 'idle';
    }
  }

  update () {
    this.wandSpark.anims.play('wandSpark', true, parseInt(Math.random()*42));
    var i;
    for (i = 0; i < this.currentSlimes.length; i++) {
      let slime = this.currentSlimes[i][0];
      this.updateSlime(slime);
    }
    if (this.firing == true) {
      this.wandSpark.visible = true;
      this.randomiseSpark(parseInt(Math.random()*3));
    } else { 
      this.wandSpark.visible = false;
    }
    this.decisionDelay += 0.016;
    this.moveInputDelay += 0.016;
    if (this.decisionDelay > 1) {
      if (this.hasCollided == true) { this.hasCollided = false };
      if (this.firing == true) { this.firing = false };
      this.decisionDelay = 0.0;
    }
    this.move();
    if (this.moveInputDelay > 0.16) {
      this.hasMovedInput = false;
      if (this.hasHitWall == false) {this.moving = 'idle'}
      this.moveInputDelay = 0.0;
    }
    // if (this.moving == 'idle') {
    //   this.idle();
    // }
    this.updateWand(aimFromPlayerToPointer());
    this.wandEndX = this.playerBody.x + this.wandOffsetX;
    this.wandEndY = this.playerBody.y + this.wandOffsetY;
    this.hasHitWall = false;
    this.wandSpark.x = this.wandEndX;
    this.wandSpark.y = this.wandEndY;

    // this.scaleRatio += 0.016;

    // if (this.scaleRatio >= 1.5) {
    //   this.scaleRatio = 0.0;
    // }

    // let start = 0.5;
    // let end = 0.515;
    // let t = this.scaleRatio;
    // let tMax = 1.5;

    // playerBody.scaleX = start + (end - start) * this.interpolate(t / tMax);
    // playerBody.scaleY = start + (end - start) * this.interpolate(t / tMax);
  }

  // interpolate(ratio) {
  //   return (ratio == 1.0) ? 1.0 : 1 - Math.pow(2.0, -10 * ratio);
  
  //   // if (ratio < 1/2.75) {
  //   //     return 7.5625*ratio*ratio;
  //   // } else if (ratio < 2/2.75) {
  //   //     var r = ratio - 1.5/2.75;
  //   //     return 7.5625*r*r+0.75;
  //   // } else if (ratio < 2.5/2.75) {
  //   //     var r = ratio-2.25/2.75;
  //   //     return 7.5625*r*r+0.9375;
  //   // } else {
  //   //     var r = ratio - 2.625/2.75;
  //   //     return 7.5625*r*r+0.984375;
  //   // }
  // }

  updateWand(angle) {
    switch(true) {
      case (157 < angle && angle <= 180):
      case (-180 <= angle && angle <= -158):
        this.playerWand.setTexture('wand_sp', '270deg.png');
        this.wandOffsetX = -35;
        this.wandOffsetY = -2;
        break;
      case (-158 < angle && angle <= -113):
        this.playerWand.setTexture('wand_sp', '315deg.png');
        this.wandOffsetX = -35;
        this.wandOffsetY = -22;
        break;
      case (-113 < angle && angle < -90):
        this.playerWand.setTexture('wand_sp', '350deg.png');
        this.wandOffsetX = -15;
        this.wandOffsetY = -35;
        break;
      case (-90 <= angle && angle <= -67):
        this.playerWand.setTexture('wand_sp', '010deg.png');
        this.wandOffsetX = 27;
        this.wandOffsetY = -35;
        break;
      case (-67 < angle && angle <= -22):
        this.playerWand.setTexture('wand_sp', '045deg.png');
        this.wandOffsetX = 37;
        this.wandOffsetY = 2;
        break;
      case (-22 < angle && angle <= 23):
        this.playerWand.setTexture('wand_sp', '090deg.png');
        this.wandOffsetX = 40;
        this.wandOffsetY = 30;
        break;
      case (23 < angle && angle <= 67):
        this.playerWand.setTexture('wand_sp', '135deg.png');
        this.wandOffsetX = 32;
        this.wandOffsetY = 37;
        break;
      case (67 < angle && angle <= 90):
        this.playerWand.setTexture('wand_sp', '170deg.png');
        this.wandOffsetX = 10;
        this.wandOffsetY = 40;
        break;
      case (90 < angle && angle <= 112):
        this.playerWand.setTexture('wand_sp', '190deg.png');
        this.wandOffsetX = -17;
        this.wandOffsetY = 40;
        break;
      case (112 < angle && angle <= 157):
        this.playerWand.setTexture('wand_sp', '225deg.png');
        this.wandOffsetX = -27;
        this.wandOffsetY = 35;
        break;
      default:
        this.playerWand.setTexture('wand_sp', '090deg.png');
    }
  }

  onDeath(callback) {
    //this.sprite.events.onKilled.add(callback);
  }
}
