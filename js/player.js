class Player {
  constructor() {
    const playerSprite = game.physics.add.sprite(phaser.config.width / 2, phaser.config.height /2, 'buster_sp');
    playerSprite.setScale(0.40, 0.40);
    playerSprite.setOrigin(0.5, 0.5);
    playerSprite.setCollideWorldBounds(true);
    const wandSprite = game.add.sprite(playerSprite.x, playerSprite.y, 'wand_sp')
    wandSprite.setScale(0.40, 0.40);
    wandSprite.setOrigin(0.5, 0.5);
    this.facing = 0;
    this.playerBody = playerSprite;
    this.playerWand = wandSprite;
    this.playerBody.setDepth(10);
    this.playerWand.setDepth(20);
    this.moving = false; 
    this.scaleRatio = 0.0;
  }
    
  left() {
    this.moving = true;
    this.playerBody.x -= 5;
    this.playerWand.x = this.playerBody.x;
    if (this.facing == 0) {
      this.playerBody.anims.play('walkLeft', true);
    }
    else {
      this.playerBody.anims.play('walkBackLeft', true);
    }
  }

  right() {
    this.moving = true;
    this.playerBody.x += 5;
    this.playerWand.x = this.playerBody.x;
    if (this.facing == 0) {
      this.playerBody.anims.play('walkRight', true);
    }
    else {
      this.playerBody.anims.play('walkBackRight', true);
    }
  }

  up() {
    this.moving = true;
    this.playerBody.y -= 5;
    this.playerWand.y = this.playerBody.y;
    this.facing = 1;
    this.playerWand.setDepth(5)
    this.playerBody.anims.play('walkBack', true);
  }

  down() {
    this.moving = true;
    this.playerBody.y += 5;
    this.playerWand.y = this.playerBody.y;
    this.facing = 0;
    this.playerWand.setDepth(20)
    this.playerBody.anims.play('walkForward', true);
  }

  idle() {
    if (this.facing == 0) {
      this.playerBody.anims.play('idleForward', true);
    }
    else {
      this.playerBody.anims.play('idleBack', true);
    }
  }

  update () {
    if (this.moving == false) {
      this.idle();
    }
    this.updateWand(aimFromPlayerToPointer()); 
    this.moving = false;

    const playerBody = this.playerBody;

    this.scaleRatio += 0.016;

    if (this.scaleRatio >= 1.5) {
      this.scaleRatio = 0.0;
    }

    let start = 0.5;
    let end = 0.515;
    let t = this.scaleRatio;
    let tMax = 1.5;

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
      case ((157 < angle && angle <= 180) || (-180 <= angle && angle <= -158)):
        this.playerWand.setTexture('wand_sp', '270deg.png');
        break;
      case (-158 < angle && angle <= -113):
        this.playerWand.setTexture('wand_sp', '315deg.png');
        break;
      case (-113 < angle && angle < -90):
        this.playerWand.setTexture('wand_sp', '350deg.png');
        break;
      case (-90 <= angle && angle <= -67):
        this.playerWand.setTexture('wand_sp', '010deg.png');
        break;
      case (-67 < angle && angle <= -22):
        this.playerWand.setTexture('wand_sp', '045deg.png');
        break;
      case (-22 < angle && angle <= 23):
        this.playerWand.setTexture('wand_sp', '090deg.png');
        break;
      case (23 < angle && angle <= 67):
        this.playerWand.setTexture('wand_sp', '135deg.png');
        break;
      case (67 < angle && angle <= 90):
        this.playerWand.setTexture('wand_sp', '170deg.png');
        break;
      case (90 < angle && angle <= 112):
        this.playerWand.setTexture('wand_sp', '190deg.png');
        break;
      case (112 < angle && angle <= 157):
        this.playerWand.setTexture('wand_sp', '225deg.png');
        break;
      default:
        this.playerWand.setTexture('wand_sp', '090deg.png');
    }
  }

  onDeath(callback) {
    //this.sprite.events.onKilled.add(callback);
  }
}
