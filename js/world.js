class World {
  constructor(game) {
    this.player = new Player(game);
    this.bulletFactory = new EntityFactory(game, 'bullet_img');
    this.spiritWorld = ['physTypeOne', 'physTypeOne', 'physTypeOne', 'physTypeOne', 'physTypeOne', 'physTypeOne'];
    this.enemies = game.physics.add.group();
    this.ghostGates = game.physics.add.group();
    const slimeGate = new EnemyGate(game, 'slime', {x: phaser.config.width /2 + 100, y: phaser.config.height /3}, true);
    const glowGate = new EnemyGate(game, 'glow', {x: phaser.config.width /2 - 100, y: phaser.config.height /3 * 2}, true);
    this.slimeGate = slimeGate;
    this.slimeGate.gate.tint = Constants.colour.greenSlime;
    this.slimeGate.gate.rotation = parseInt(Math.random() * 360);
    this.glowGate = glowGate;
    this.glowGate.gate.tint = Constants.colour.streamRed;
    this.glowGate.gate.rotation = parseInt(Math.random() * 360);
    this.ghostGates.add(this.slimeGate.gate);
    this.ghostGates.add(this.glowGate.gate);
    this.map = game.make.tilemap({ key: 'testMap' });
    this.tileset = this.map.addTilesetImage('sciFiTiles', 'testTiles');
    this.background = this.map.createStaticLayer('background', this.tileset, 0, 0);
    this.foreground = this.map.createStaticLayer('foreground', this.tileset, 0, 0);
    this.foreground.setDepth(100);
    this.walls = game.physics.add.group({
      allowGravity: false,
      immovable: true
    });
    this.wallObjects = this.map.getObjectLayer('wallObjects')['objects'];
    this.wallObjects.forEach(wallObject => {
      let wall = this.walls.create(wallObject.x + 16, wallObject.y + 16, '').setOrigin(0, 0);
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
    this.spawnTimer = 100;
  }

  randomiseSpark(int) {
    let tint = 0x000000;
    switch (int) {
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

  addEnemyToGroup(enemy) {
    this.enemies.add(enemy.enemySprite);
    enemy.enemySprite.setCollideWorldBounds(true);
  }

  spawnEnemy() {
    if (this.spiritWorld.length <= 0) {
      return console.log('game over');  
    }
    let enemy = this.spiritWorld.pop();
    let spawnGate = this.findRandomGate();
    while (spawnGate.self.open == false) {
      spawnGate = this.findRandomGate();
    }
    let spawnLocation = {
      x: spawnGate.x,
      y: spawnGate.y
    }
    switch(enemy) {
      case('physTypeOne'):
      this.addEnemyToGroup(new TypeOne(spawnLocation));
        break;
      default: 
        console.log('no Type');
        break;
    }
  }

  findRandomGate() {
    let randomEntry = parseInt(Math.random() * this.ghostGates.children.entries.length);
    return this.ghostGates.children.entries[randomEntry];
  }

  checkForOpenGates() {
    let result = false;
    this.ghostGates.children.entries.forEach(gate => {
      if (gate.self.open == true) { 
        result = true;
      }
    });
    return result;
  }

  update() {
    this.ghostGates.children.iterate(function (gate) {
      if (gate) {
        gate.self.setAnimation();
        gate.self.update();
      }
    });
    this.spawnTimer += 0.16;
    if (this.spawnTimer > 100) {
      if (this.checkForOpenGates() == true) {
        this.spawnEnemy();
        this.spawnTimer = 0;
      }
    }
    this.wallHitSpark.anims.play('wandSpark', true, parseInt(Math.random() * 42));
    this.player.update();
    this.enemies.children.iterate(function (sprite) {
      if (sprite) {
        sprite.enemy.update();
      }
    });
    if (this.wallHit == true) {
      this.wallHitSpark.visible = true;
      this.randomiseSpark(parseInt(Math.random() * 3));
    }
    else {
      this.wallHitSpark.visible = false;
    }
  }
  cleanup(factory) {
    factory.destroyAllExists();
  }
}
