class World {
  constructor(game) {
    this.game = game;
    this.setDifficulty('normal');
    this.setLevelSize('medium');
    this.bulletFactory = new EntityFactory(game, 'bullet_img');
    this.spiritWorld = ['physTypeOne', 'physTypeOne', 'physTypeOne', 'physTypeOne', 'physTypeOne', 'physTypeOne'];
    this.enemies = game.physics.add.group();
    this.ghostGates = game.physics.add.group();
    this.playerSpawned = false;
    this.walls = game.physics.add.group({
      allowGravity: false,
      immovable: true
    });
    this.buildMap(game);
    this.setUpGates(this.numOfGates);
    this.game.physics.world.setBounds(0, 0, this.mapSize.x, this.mapSize.y, true, true, true, true);
    const wallhitSpark = game.add.sprite(0, 0, 'wandSpark');
    wallhitSpark.setDepth(20);
    wallhitSpark.setScale(0.5, 0.5);
    wallhitSpark.alpha = 0.75;
    this.wallHitSpark = wallhitSpark;
    this.wallHitSpark.visible = false;
    this.wallHit = false;
  }
  
  makeMapTileSet(game, mapKey, mapTileSetRef, tileKey) {
    let map = game.make.tilemap({ key: mapKey });
    let tiles = map.addTilesetImage(mapTileSetRef, tileKey);
    return {'map': map, 'tiles': tiles};
  }

  spawnPlayer(game, map) {
    let playerSpawner = parseInt(Math.random() * map.getObjectLayer('spawners')['objects'].length);
    this.player = new Player(
      game,
      map.getObjectLayer('spawners')['objects'][playerSpawner].x,
      map.getObjectLayer('spawners')['objects'][playerSpawner].y
    );
    map.getObjectLayer('spawners')['objects'].splice(playerSpawner, 1);
    this.playerSpawned = true;
  }

  buildMap(game) {
    this.spawners = [];
    this.mapSize = {x: 0, y: 0};
    this.simpleBuildingSpots = [];
    //add base maps
    let buildingCount = 0;
    this.levelMap.forEach(row => {
      this.mapSize.x = 0;
      let availableSpace = row;
      while (availableSpace > 0) {
        console.log('space' + availableSpace);
        let randNum = parseInt(Math.random() * Constants.baseMaps.length);
        while (!(Constants.baseMaps[randNum].size <= availableSpace)) {
          randNum = parseInt(Math.random() * Constants.baseMaps.length)
        }
        let set = Constants.baseMaps[randNum];
        // this.mapSets.push(this.makeMapTileSet(game, set.mapKey, set.mapTileSetRef, set.tileKey));
        let mapSet = this.makeMapTileSet(game, set.mapKey, set.mapTileSetRef, set.tileKey);
        if(mapSet.map.properties[0] != null && mapSet.map.properties[0].name == 'baseMap') {
          mapSet.map.getObjectLayer('simpleBuilding')['objects'].forEach(spot => {
            buildingCount ++;
          });
        }
        console.log('map placed');
        this.playerSpawned ? '' : this.spawnPlayer(game, mapSet.map);
        this.placeMap(mapSet, this.mapSize);
        this.mapSize.x = this.mapSize.x + (mapSet.map.tileWidth * mapSet.map.width);
        console.log(this.mapSize);

        availableSpace = parseInt(availableSpace - set.size);
      }
      this.mapSize.y = this.mapSize.y + 1568;

    })
    for (let i = 0; i < buildingCount; i ++) {
      let randNum = parseInt(Math.random() * Constants.simpleBuildingMaps.length);
      let set = Constants.simpleBuildingMaps[randNum];
      let mapSet = this.makeMapTileSet(game, set.mapKey, set.mapTileSetRef, set.tileKey);
      this.placeMap(mapSet);
    }
    this.game.physics.world.setBounds(0, 0, this.mapSize.x, this.mapSize.y, true, true, true, true);
  }

  placeMap(mapSet, spawnLocation = {x: 0, y: 0}) {
    let map = mapSet.map;
    let tiles = mapSet.tiles;
    if(map.properties[0] != null && map.properties[0].name == 'baseMap') {
      map.getObjectLayer('simpleBuilding')['objects'].forEach(spot => {
        spot.x += this.mapSize.x;
        spot.y += this.mapSize.y;
        this.simpleBuildingSpots.push(spot);
      });
    } else if (map.properties[0] != null && map.properties[0].name == 'simpleBuilding') {
      let spot = this.simpleBuildingSpots[0];
      let mapHeight = map.tileHeight * map.height;
      let mapWidth = map.tileWidth * map.width;
      spawnLocation.x = spot.x + (spot.width - mapWidth)/2;
      //spawn at the bottom of the area so that the first door is on the road.
      spawnLocation.y = spot.y + spot.height - mapHeight + 3;
      this.simpleBuildingSpots.shift();
    }
    map.createStaticLayer('background', tiles, spawnLocation.x, spawnLocation.y);
    let foreground = map.createStaticLayer('foreground', tiles, spawnLocation.x, spawnLocation.y);
    if(foreground != null) { foreground.setDepth(100) };
    if(map.getObjectLayer('wallObjects') != null) {
      let wallObjects = map.getObjectLayer('wallObjects')['objects'];
      wallObjects.forEach(wallObject => {
        let wall = this.walls.create(wallObject.x + 16 + spawnLocation.x, wallObject.y + 16 + spawnLocation.y, '').setOrigin(0, 0);
        wall.visible = false;
        wall.body.height = wallObject.height;
        wall.body.width = wallObject.width;
      });
    }
    map.getObjectLayer('spawners')['objects'].forEach(spawner => {
      spawner.x += spawnLocation.x;
      spawner.y += spawnLocation.y;
    });
    this.spawners = this.spawners.concat(map.getObjectLayer('spawners')['objects']);
  }

  setDifficulty(difficulty) {
    switch(difficulty) {
      case (difficulty == 'easy'):
        this.numOfGates = 2;
        this.spawnDelay = 300;
        this.spawnTimer = 300;
        break;
      case (difficulty == 'hard'):
        this.numOfGates = 6;
        this.spawnDelay = 150;
        this.spawnTimer = 150;
        break;
      default:
        //normal
        this.numOfGates = 4;
        this.spawnDelay = 200;
        this.spawnTimer = 200;
    }
  }

  setLevelSize(size) {
    switch(size) {
      case (size == 'tiny'):
        this.levelMap = [1];  
        break;
      case (size == 'small'):
        this.levelMap = [2];  
        break;
      case (size == 'large'):
        this.levelMap = [3, 3, 3];  
        break;
      default:
        //medium
        this.levelMap = [2, 2];
    }
  }

  levelSpaceCheck(needed, available) {
    return (needed <= available);
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
    if (this.spawnTimer > this.spawnDelay) {
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
