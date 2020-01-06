class World {
  constructor(game) {
    this.game = game;
    this.bulletFactory = new EntityFactory(game, 'bullet_img');
    this.spiritWorld = ['physTypeOne', 'physTypeOne', 'physTypeOne', 'physTypeOne', 'physTypeOne', 'physTypeOne'];
    this.enemies = game.physics.add.group();
    this.ghostGates = game.physics.add.group();
    this.groundMap = game.make.tilemap({ key: 'outsideMap' });
    this.tileset = this.groundMap.addTilesetImage('outside', 'outsideTiles');
    this.background = this.groundMap.createStaticLayer('background', this.tileset, 0, 0);
    // this.foreground = this.groundMap.createStaticLayer('foreground', this.tileset, 0, 0);
    // this.foreground.setDepth(100);
    // this.walls = game.physics.add.group({
    //   allowGravity: false,
    //   immovable: true
    // });
    this.spawners = this.groundMap.getObjectLayer('spawners')['objects'];
    let playerSpawner = parseInt(Math.random() * this.spawners.length);
    this.player = new Player(game, this.spawners[playerSpawner].x, this.spawners[playerSpawner].y);
    this.spawners.splice(playerSpawner, 1);
    
    // this.wallObjects = this.groundMap.getObjectLayer('wallObjects')['objects'];
    // this.wallObjects.forEach(wallObject => {
    //   let wall = this.walls.create(wallObject.x + 16, wallObject.y + 16, '').setOrigin(0, 0);
    //   wall.visible = false;
    //   wall.body.height = wallObject.height;
    //   wall.body.width = wallObject.width;
    // });
    this.setUpGates(4);
    const wallhitSpark = game.add.sprite(0, 0, 'wandSpark');
    wallhitSpark.setDepth(20);
    wallhitSpark.setScale(0.5, 0.5);
    wallhitSpark.alpha = 0.75;
    this.wallHitSpark = wallhitSpark;
    this.wallHitSpark.visible = false;
    this.wallHit = false;
    this.spawnTimer = 100;
    this.mapSize = {
      x: this.groundMap.tileWidth * this.groundMap.width,
      y: this.groundMap.tileHeight * this.groundMap.height
    };
    this.game.physics.world.setBounds(0, 0, this.mapSize.x, this.mapSize.y, true, true, true, true);
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
      this.addEnemyToGroup(new TypeOne(this.game, spawnLocation));
        break;
      default: 
        console.log('no Type');
        break;
    }
  }

  setUpGates(numOfGates) {
    for(let i = 0; (i < numOfGates); i++) {
      let randomNumber = parseInt(Math.random() * this.spawners.length);
      let newGate = new EnemyGate(this.game, this.chooseGateType(), {x: this.spawners[randomNumber].x, y: this.spawners[randomNumber].y}, true)
      newGate.gate.tint = this.chooseGateColour();
      newGate.gate.rotation = parseInt(Math.random() * 360);
      this.ghostGates.add(newGate.gate);
      this.spawners.splice(randomNumber, 1);
    }
  }

  chooseGateColour() {
    switch(parseInt(Math.random() * 2)) {
      case 0:
        return Constants.colour.greenSlime;
      case 1:
        return Constants.colour.pinkSlime;
      default:
        return Constants.colour.blackSlime;
    }
  }

  chooseGateType() {
    switch(parseInt(Math.random() * 1)) {
      case 0:
        return 'slime';
      default:
        return 'glow';
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
