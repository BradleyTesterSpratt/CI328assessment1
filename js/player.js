class Player {
  constructor() {
    this.facing = 0;
    this.moving = 'idle'; 
    this.scaleRatio = 0.0;
    this.baseSpeed = 5;
    this.speed = 5;
    this.slimes = [];
    // this.hasCollided = false;
    this.fireDelay = 0.0;
    this.moveInputDelay = 0.0;
    this.wandEnd = {x: 0, y: 0};
    this.wandOffset = {x: 0, y: 0};
    this.beltOffset = {x: 10, y: 25};
    this.firing = false;
    this.hasHitWall = false;
    this.hasMovedInput = false;
    this.streamStrength = 1;
    this.trapHeld = true;
    this.trapLocation = {x: 0, y: 0};
    const sprites = this.generateSprites();
    this.playerBody = sprites['player'];
    this.playerWand = sprites['wand'];
    this.firstSlime = sprites['firstSlime'];
    this.firstSlime.debuff = 'none';
    this.secondSlime = sprites['secondSlime'];
    this.secondSlime.debuff = 'none';
    this.thirdSlime = sprites['thirdSlime'];
    this.thirdSlime.debuff = 'none';
    this.slimes.push(this.firstSlime, this.secondSlime, this.thirdSlime);
    this.wandSpark = sprites['sparks'];
    this.trap = sprites['trap'];
    //allow the playerBody to access the whole class and it's functions
    this.playerBody.player = this;
    //bind so functions called from outside the class use 'this' correctly
    this.slime = this.collideGhost.bind(this);
    this.hitWall = this.hitWall.bind(this);
    this.setMove = this.setMove.bind(this);
    this.deployTrap = this.deployTrap.bind(this);
    this.grabTrap = this.grabTrap.bind(this);
    //the trap will not deploy     
  }

  generateSprites() {
    const playerSprite = game.physics.add.sprite(phaser.config.width / 2 - 100, phaser.config.height /2, 'buster_sp');
    playerSprite.setScale(0.40, 0.40);
    playerSprite.setOrigin(0.5, 0.5);
    playerSprite.setCollideWorldBounds(true);
    playerSprite.setDepth(10);
    const wandSprite = game.add.sprite(playerSprite.x, playerSprite.y, 'wand_sp');
    wandSprite.setScale(0.40, 0.40);
    wandSprite.setOrigin(0.5, 0.5);
    wandSprite.setDepth(20);
    const firstSlime = game.add.sprite(playerSprite.x, playerSprite.y, 'firstSlime');
    firstSlime.setDepth(11);
    firstSlime.setScale(0.4, 0.4);
    firstSlime.forwardScale = {x:0.4, y: 0.4};
    firstSlime.visible = false;
    const secondSlime = game.add.sprite(playerSprite.x, playerSprite.y, 'secondSlime');
    secondSlime.setDepth(11);
    secondSlime.setScale(0.4, 0.4);
    secondSlime.forwardScale = {x:0.4, y: 0.4};
    secondSlime.visible = false;
    const thirdSlime = game.add.sprite(playerSprite.x, playerSprite.y, 'secondSlime');
    thirdSlime.setDepth(11);
    thirdSlime.setScale(0.4, 0.4);
    thirdSlime.forwardScale = {x:0.4, y: 0.4};
    thirdSlime.visible = false;
    const wandSpark = game.add.sprite(this.wandEnd.x, this.wandEnd.y, 'wandSpark')
    wandSpark.setDepth(20);
    wandSpark.setScale(0.3, 0.3);
    wandSpark.alpha = 0.75;
    wandSpark.visible = false;
    const trap = game.physics.add.sprite(playerSprite.x, playerSprite.y, 'trap');
    trap.setDepth(11);
    trap.setScale(0.03, 0.03);
    trap.rotation = 90;
    trap.body.enable = false;
    return {
      'player': playerSprite,
      'wand': wandSprite,
      'firstSlime': firstSlime,
      'secondSlime': secondSlime,
      'thirdSlime': thirdSlime,
      'sparks': wandSpark,
      'trap': trap
    };
  }

  collideGhost(slimeInfo) {
    // this.hasCollided = true;
    let availableSlime = null;
    this.slimes.forEach(slime => {
      if(slime.visible == false) {
        availableSlime = slime;
      }
    })
    if (availableSlime != null) {
      availableSlime.debuff = slimeInfo['debuff'];
      availableSlime.tint = slimeInfo['colour'];
      availableSlime.visible = true;
      game.time.scene.time.delayedCall(6000, this.cleanSlime, [availableSlime], this);
    }
  }

  cleanSlime(slime) {
    slime.visible = false;
    slime.debuff = 'none';
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
    this.trap.setDepth(5)
    this.playerBody.anims.play('walkBack', true);
    this.hasMovedInput = true;
  }

  down() {
    this.playerBody.y += this.speed;
    this.playerWand.y = this.playerBody.y;
    this.facing = 0;
    this.playerWand.setDepth(20)
    this.trap.setDepth(11)
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

  updateSlimes() {
    this.slimes.forEach(slime => {
      slime.x = this.playerBody.x;
      slime.y = this.playerBody.y;
      this.facing == 0 ? slime.setScale(slime.forwardScale.x, slime.forwardScale.y): slime.setScale(slime.forwardScale.x*-1, slime.forwardScale.y);
    })
  }

  processDebuffs() {
    let currentSpeed = this.baseSpeed;
    this.slimes.forEach(slime => {
      if (slime.debuff == 'speed') {
        currentSpeed = currentSpeed * 0.5;
      }
    })
    this.speed = currentSpeed;
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
    this.processDebuffs();
    this.firstSlime.anims.play('slimeDripA', true);
    this.secondSlime.anims.play('slimeDripB', true);
    this.thirdSlime.anims.play('slimeDripC', true);
    this.wandSpark.anims.play('wandSpark', true, parseInt(Math.random()*42));
    this.updateSlimes();
    if (this.firing == true) {
      this.fireDelay += 0.016;
      this.wandSpark.visible = true;
      this.randomiseSpark(parseInt(Math.random()*3));
    } else { 
      this.wandSpark.visible = false;
    }
    if (this.fireDelay > 1) {
      this.firing = false;
      this.fireDelay = 0.0;
    }
    // if (this.hasCollided == true) {this.slimeDelay += 0.016};
    // if (this.slimeDelay > 2) {
    //   this.slimeDelay = 0.0;
    //   this.hasCollided = false;
    // }
    
    this.move();
    this.moveInputDelay += 0.016;
    if (this.moveInputDelay > 0.16) {
      this.hasMovedInput = false;
      if (this.hasHitWall == false) {this.moving = 'idle'}
      this.moveInputDelay = 0.0;
      this.hasHitWall = false;
    }
    this.updateWand(aimFromPlayerToPointer());
    this.wandEnd.x = this.playerBody.x + this.wandOffset.x;
    this.wandEnd.y = this.playerBody.y + this.wandOffset.y;
    this.wandSpark.x = this.wandEnd.x;
    this.wandSpark.y = this.wandEnd.y;
    if (this.trapHeld) {
      this.trap.x = this.playerBody.x + this.beltOffset.x;
      this.trap.y = this.playerBody.y + this.beltOffset.y;
      this.trap.anims.play('trapClosed', true);
    }
  }

  deployTrap(x, y) {
    this.trapHeld = false;
    this.trap.x = x;
    this.trap.y = y;
    this.trap.anims.play('trapOut', true)
    this.trap.setScale(0.06, 0.06);
    this.trap.rotation = 0;
    this.trap.body.enable = true;
  }
  
  grabTrap()
  {
    this.trapHeld = true;
    this.trap.anims.play('trapClosed', true)
    this.trap.setScale(0.03, 0.03);
    this.trap.rotation = 90;
    this.trap.body.enable = false;
  }

  updateWand(angle) {
    switch(true) {
      case (157 < angle && angle <= 180):
      case (-180 <= angle && angle <= -158):
        this.playerWand.setTexture('wand_sp', '270deg.png');
        this.wandOffset.x = -35;
        this.wandOffset.y = -2;
        break;
      case (-158 < angle && angle <= -113):
        this.playerWand.setTexture('wand_sp', '315deg.png');
        this.wandOffset.x = -35;
        this.wandOffset.y = -22;
        break;
      case (-113 < angle && angle < -90):
        this.playerWand.setTexture('wand_sp', '350deg.png');
        this.wandOffset.x = -15;
        this.wandOffset.y = -35;
        break;
      case (-90 <= angle && angle <= -67):
        this.playerWand.setTexture('wand_sp', '010deg.png');
        this.wandOffset.x = 27;
        this.wandOffset.y = -35;
        break;
      case (-67 < angle && angle <= -22):
        this.playerWand.setTexture('wand_sp', '045deg.png');
        this.wandOffset.x = 37;
        this.wandOffset.y = 2;
        break;
      case (-22 < angle && angle <= 23):
        this.playerWand.setTexture('wand_sp', '090deg.png');
        this.wandOffset.x = 40;
        this.wandOffset.y = 30;
        break;
      case (23 < angle && angle <= 67):
        this.playerWand.setTexture('wand_sp', '135deg.png');
        this.wandOffset.x = 32;
        this.wandOffset.y = 37;
        break;
      case (67 < angle && angle <= 90):
        this.playerWand.setTexture('wand_sp', '170deg.png');
        this.wandOffset.x = 10;
        this.wandOffset.y = 40;
        break;
      case (90 < angle && angle <= 112):
        this.playerWand.setTexture('wand_sp', '190deg.png');
        this.wandOffset.x = -17;
        this.wandOffset.y = 40;
        break;
      case (112 < angle && angle <= 157):
        this.playerWand.setTexture('wand_sp', '225deg.png');
        this.wandOffset.x = -27;
        this.wandOffset.y = 35;
        break;
      default:
        this.playerWand.setTexture('wand_sp', '090deg.png');
    }
  }
}
