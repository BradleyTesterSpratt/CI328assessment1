class Player {
  constructor() {
    const playerSprite = game.physics.add.sprite(phaser.config.width / 2, phaser.config.height /2, 'buster_sp');
    playerSprite.setScale(0.40, 0.40);
    playerSprite.setOrigin(0.5, 0.5);
    playerSprite.setCollideWorldBounds(true);
    const wandSprite = game.physics.add.sprite(playerSprite.x, playerSprite.y, 'wand_sp')
    wandSprite.setScale(0.40, 0.40);
    wandSprite.setOrigin(0.5, 0.5);
    this.facing = 0;
    this.sprites = [playerSprite, wandSprite]
    this.sprites[0].setDepth(10);
    this.sprites[1].setDepth(20); 
  }
    
  left() {
    this.sprites[0].x -= 5;
    this.sprites[1].x = this.sprites[0].x;
    if (this.facing == 0) {
      this.sprites[0].anims.play('walkLeft', true);
    }
    else {
      this.sprites[0].anims.play('walkBackLeft', true);
    }
  }

  right() {
    this.sprites[0].x += 5;
    this.sprites[1].x = this.sprites[0].x;
    if (this.facing == 0) {
      this.sprites[0].anims.play('walkRight', true);
    }
    else {
      this.sprites[0].anims.play('walkBackRight', true);
    }
  }

  up() {
    this.sprites[0].y -= 5;
    this.sprites[1].y = this.sprites[0].y;
    this.facing = 1;
    this.sprites[1].setDepth(5)
    this.sprites[0].anims.play('walkBack', true);
  }

  down() {
    this.sprites[0].y += 5;
    this.sprites[1].y = this.sprites[0].y;
    this.facing = 0;
    this.sprites[1].setDepth(20)
    this.sprites[0].anims.play('walkForward', true);
  }

  idle() {
    if (this.facing == 0) {
      this.sprites[0].anims.play('idleForward', true);
    }
    else {
      this.sprites[0].anims.play('idleBack', true);
    }
  }

  updateWand(angle) {
    switch(true) {
      case (-180 <= angle && angle <= -135):
        this.sprites[1].setTexture('wand_sp', '270deg.png');
        break;
      case (-135 < angle && angle <= -90):
        this.sprites[1].setTexture('wand_sp', '315deg.png');
        break;
      case (-90 < angle && angle < -60):
        this.sprites[1].setTexture('wand_sp', '350deg.png');
        break;
      case (-60 <= angle && angle <= -30):
        this.sprites[1].setTexture('wand_sp', '010deg.png');
        break;
      case (-30 < angle && angle <= 0):
        this.sprites[1].setTexture('wand_sp', '045deg.png');
        break;
      case (0 < angle && angle <= 50):
        this.sprites[1].setTexture('wand_sp', '090deg.png');
        break;
      case (50 < angle && angle <= 90):
        this.sprites[1].setTexture('wand_sp', '135deg.png');
        break;
      case (90 < angle && angle <= 120):
        this.sprites[1].setTexture('wand_sp', '170deg.png');
        break;
      case (120 < angle && angle <= 150):
        this.sprites[1].setTexture('wand_sp', '190deg.png');
        break;
      case (150 < angle && angle <= 180):
        this.sprites[1].setTexture('wand_sp', '225deg.png');
        break;
      default:
        this.sprites[1].setTexture('wand_sp', '090deg.png');
    }
  }

  onDeath(callback) {
    //this.sprite.events.onKilled.add(callback);
  }
}
