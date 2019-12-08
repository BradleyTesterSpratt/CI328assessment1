class Control {
  onUpdate(sprite) {}
}

class EntityFactory {
  constructor(spriteName) {
    const group = game.physics.add.group({
      defaultKey: spriteName
    });
    this.group = group;
  }

  spawnAsBullet(x, y, destX, destY) {
    if (!this.nextBulletTime) {
      this.nextBulletTime = 0;
    }

    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > this.nextBulletTime) {
      const sprite = this.group.create(x-1, y-2)
      this.setUpEntity(sprite);
      
      sprite.setOrigin(0.5, 0.5);
      sprite.setScale(0.05, 0.05);
      game.physics.moveToObject(sprite, new Phaser.Math.Vector2(destX, destY), 750);
      this.nextBulletTime = game.time.now + 75;
    }
  }

  setUpEntity(sprite) {
    sprite.controls = [];
    sprite.addControl = (control) => { sprite.controls.push(control); }
    sprite.updateControls = () => { sprite.controls.forEach(control => control.onUpdate(sprite)); }
  }

  updateAllExists() {
    this.group.children.iterate(function (sprite) {
      if (sprite) {
        sprite.updateControls(20);
      }
    })
  }

  destroyAllExists() {
    try {
      this.group.children.iterate(function (sprite) {
        sprite.destroy();
      });
    }
    catch(err) {
      console.log(err);
    }
  }

  // spawnAsEnemy(x, y) {
    // const sprite = this.group.create(x, y + 30);
    // this.setUpEntity(sprite);
    // sprite.setVelocity(Phaser.Math.Between(35, 55), Phaser.Math.Between(45, 100));
    // sprite.setOrigin(1.0, 1.0);
    // sprite.addControl(new EnemyControl());
  // }
}

class World {
  constructor(game) {
    // this.bg = game.add.image(0, 0, 'background_img');
    // this.bg.setOrigin(0, 0);
    this.player = new Player();
    // this.player.onDeath(gameOver);
    this.physTypeOne = new TypeOne();
    this.bulletFactory = new EntityFactory('bullet_img');
    this.enemies = game.physics.add.group();
    this.addEnemyToGroup(this.physTypeOne);
    this.map = game.make.tilemap({ key: 'testMap' });
    this.tileset = this.map.addTilesetImage('sciFiTiles', 'testTiles');
    this.background = this.map.createStaticLayer('background', this.tileset, 0, 0);
    this.foreground = this.map.createStaticLayer('foreground', this.tileset, 0, 0);
    this.foreground.setDepth(40);
    this.walls = game.physics.add.group({
      allowGravity: false,
      immovable: true
    });
    this.wallObjects = this.map.getObjectLayer('wallObjects')['objects'];
    this.wallObjects.forEach(wallObject => {
      let wall = this.walls.create(wallObject.x +16, wallObject.y+16, '').setOrigin(0, 0);
      wall.visible = false;
      wall.body.height = wallObject.height;
      wall.body.width = wallObject.width;
    });
    const wallhitSpark = game.add.sprite(0, 0, 'wandSpark');
    wallhitSpark.setDepth(20);
    wallhitSpark.setScale(0.5, 0.5);
    wallhitSpark.alpha = 0.75;
    this.wallHitSpark = wallhitSpark;
    this.wallHitSpark.visible = false;
    this.wallHit = false;
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
    this.wallHitSpark.tint = tint;
  }

  spawnBullet(x, y, destX, destY) {
    this.bulletFactory.spawnAsBullet(x, y, destX, destY);
  }

  addEnemyToGroup(enemy){
    this.enemies.add(enemy.enemySprite);
    enemy.enemySprite.setCollideWorldBounds(true);
  }
  
  update() {
    // this.bg.y += 2;
    // if (this.bg.y >= 0) {
    //   this.bg.y = -phaser.config.height;
    // }
    // this.tempEnemy.update();
    this.wallHitSpark.anims.play('wandSpark', true, parseInt(Math.random()*42));

    this.player.update();
    this.enemies.children.iterate(function (sprite) {
      if (sprite) {
        sprite.enemy.update();
      }
    })
    if(this.wallHit == true) {
      this.wallHitSpark.visible = true;
      this.randomiseSpark(parseInt(Math.random()*3));
    } else {
      this.wallHitSpark.visible = false
    }
    // this.enemyFactory.updateAllExists();
  }

  cleanup(factory) {
    factory.destroyAllExists();
  }

  // spawnEnemy(x, y) {
  //   this.enemyFactory.spawnAsEnemy(x, y);
  //   this.numEnemies++;
  // }
}

// class EnemyControl extends Control {
  // onUpdate(sprite) {
  //   if (sprite.x + sprite.width + sprite.width >= phaser.config.width) {
  //     sprite.setVelocityX(-Phaser.Math.Between(35, 55));
  //   }
    
  //   if (sprite.x <= 0) {
  //     sprite.setVelocityX(Phaser.Math.Between(35, 55));
  //   }
    
  //   if (sprite.y > phaser.config.height + 40) {
  //     sprite.destroy();
  //     world.numEnemies--;
  //   }
  // }
// }
