class World {
  constructor(game, difficulty, levelSize) {
    this.loss = false;
    this.totalAttempts = 0;
    this.spawnTimer = 0;
    this.game = game;
    this.setDifficulty(difficulty);
    this.setLevelSize(levelSize);
    this.bulletFactory = new EntityFactory(game, 'bullet_img');
    this.spiritWorld = [];
    this.populateSpiritWorld(this.spiritWorldSize + this.initialSpawnedEnemies);
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

  update() {
    this.ghostGates.children.iterate(function (gate) {
      if (gate) {
        gate.self.setAnimation();
        gate.self.update();
      }
    });
    this.spawnTimer += 0.16;
    if (this.spawnTimer > this.spawnDelay) {
      if (this.checkForOpenGates() > 0) {
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

  setDifficulty(difficulty) {
    switch(difficulty) {
      case 'easy':
        this.numOfGates = 2;
        this.spawnDelay = 250;
        this.spiritWorldSize = 12;
        break;
      case 'hard':
        this.numOfGates = 6;
        this.spawnDelay = 100;
        this.spiritWorldSize = 3;
        break;
      default:
        //normal
        this.numOfGates = 4;
        this.spawnDelay = 150;
        this.spiritWorldSize = 6;
    }
  }

  setLevelSize(size) {
    switch(size) {
      case 'tiny':
        this.levelMap = [1];
        this.initialSpawnedEnemies = 4;
        break;
      case 'small':
        this.levelMap = [2];  
        this.initialSpawnedEnemies = 6;
        break;
      case 'large':
        this.levelMap = [3, 3, 3];  
        this.initialSpawnedEnemies = 10;
        break;
      default:
        //medium
        this.levelMap = [2, 2];
        this.initialSpawnedEnemies = 8;
    }
  }

  //the spirit world is our pool of enemies, once empty no more ene
  populateSpiritWorld(numberOfEnemies) {
    for(let i = 0; i < numberOfEnemies; i++) {
      let randNum = parseInt(Math.random() * Constants.enemyTypes.length);
      this.spiritWorld.push(Constants.enemyTypes[randNum]);
    }
  }

  buildMap(game) {
    this.spawners = [];
    this.mapSize = {x: 0, y: 0};
    this.simpleBuildingSpots = [];
    this.modularBuildings = {};
    let buildingCount = 0;
    //build the each row of the base map
    this.levelMap.forEach(row => {
      this.mapSize.x = 0;
      let availableSpace = row;
      while (availableSpace > 0) {
        //choose a random base map
        let randNum = parseInt(Math.random() * Constants.baseMaps.length);
        //if the base map's size is bigger than the remaining available space then choose another
        while (!(Constants.baseMaps[randNum].size <= availableSpace)) {
          randNum = parseInt(Math.random() * Constants.baseMaps.length);
        }
        let set = Constants.baseMaps[randNum];
        let mapSet = this.makeMapTileSet(game, set.mapKey, set.mapTileSetRef, set.tileKey);
        //count how many simple buildings are on the current base map and keep a total
        let simpleBuildings = mapSet.map.getObjectLayer('simpleBuilding');
        if(simpleBuildings != null) {
          simpleBuildings['objects'].forEach(spot => {
            buildingCount += 1;
          });
        }
        //check for a modular building spawn spots
        let modularBuilding = mapSet.map.getObjectLayer('modularBuilding');
        if(modularBuilding != null) {
          this.modularBuildingCount >= 0 ? this.modularBuildingCount += 1 : this.modularBuildingCount = 0;
          //name the building and add it to to the modulat building opbject
          let buildingName = `building${this.modularBuildingCount}`;
          if (!(buildingName in this.modularBuildings)) {this.modularBuildings[buildingName] = []};
          let building = this.modularBuildings[buildingName];
          /**
           * for each plot of the builiding position it correctly,
           * assign directions that other plots can connect to
           * assign an x,y co-ordinate for it's position in the building
           */
          //for each plot of the builiding position it correctly, assign directions that
          modularBuilding['objects'].forEach(plot => {
            plot.x += this.mapSize.x;
            plot.y += this.mapSize.y - 61;
            plot.openDirections = ['north', 'south', 'east', 'west'];
            plot.properties.forEach(prop => {
              if (prop.name == 'column') {
                plot.column = prop.value;
              } else if (prop.name == 'row') {
                plot.row = prop.value;
              };
            });
            building.push(plot)
          });
        }
        this.playerSpawned ? '' : this.spawnPlayer(game, mapSet.map);
        this.placeMap(mapSet, this.mapSize);
        this.mapSize.x = this.mapSize.x + (mapSet.map.tileWidth * mapSet.map.width);
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
    for (const building in this.modularBuildings) {
      this.buildModularBuilding(this.modularBuildings[building]);
    }
    //adjust the game world to the new map size;
    this.game.physics.world.setBounds(0, 0, this.mapSize.x, this.mapSize.y, true, true, true, true);
  }

  //build the tile map and return a reference to both parts
  makeMapTileSet(game, mapKey, mapTileSetRef, tileKey) {
    let map = game.make.tilemap({ key: mapKey });
    let tiles = map.addTilesetImage(mapTileSetRef, tileKey);
    return {'map': map, 'tiles': tiles};
  }

  placeMap(mapSet, spawnLocation = {x: 0, y: 0}, backgroundDepth = 0) {
    let map = mapSet.map;
    let tiles = mapSet.tiles;
    if(map.properties[0] != null && map.properties[0].name == 'baseMap') {
      let simpleBuildings = map.getObjectLayer('simpleBuilding');
      if(simpleBuildings != null) {
        //add a simple building spawn spot to the list if there is one
        simpleBuildings['objects'].forEach(spot => {
          spot.x += this.mapSize.x;
          spot.y += this.mapSize.y;
          this.simpleBuildingSpots.push(spot);
        });
      }
    } else if (map.properties[0] != null && map.properties[0].name == 'simpleBuilding') {
      //get a spawn location from the list of simple buildings
      let spot = this.simpleBuildingSpots[0];
      let mapHeight = map.tileHeight * map.height;
      let mapWidth = map.tileWidth * map.width;
      spawnLocation.x = spot.x + (spot.width - mapWidth)/2;
      //spawn at the bottom of the area so that the first door is on the road.
      spawnLocation.y = spot.y + spot.height - mapHeight + 3;
      //get rid of the now used spawn spot 
      this.simpleBuildingSpots.shift();
    }
    //render the graphics of the maps
    let background = map.createStaticLayer('background', tiles, spawnLocation.x, spawnLocation.y);
    /**
     * change the depth for modular buildings, 
     * preventing walls that should be hidden under another room being shown
     */
    background.setDepth(backgroundDepth);
    let foreground = map.createStaticLayer('foreground', tiles, spawnLocation.x, spawnLocation.y);
    if(foreground != null) { foreground.setDepth(100) };
    if(map.getObjectLayer('wallObjects') != null) {
      //if there are walls to build, add bodies for them so the player and ghosts can collide
      let wallObjects = map.getObjectLayer('wallObjects')['objects'];
      wallObjects.forEach(wallObject => {
        let wall = this.walls.create(wallObject.x + 16 + spawnLocation.x, wallObject.y + 16 + spawnLocation.y, '').setOrigin(0, 0);
        wall.visible = false;
        wall.body.height = wallObject.height;
        wall.body.width = wallObject.width;
      });
    }
    if(map.getObjectLayer('spawners') != null) {
      //add player or gate spawn locations
      map.getObjectLayer('spawners')['objects'].forEach(spawner => {
        spawner.x += spawnLocation.x;
        spawner.y += spawnLocation.y;
      });
      this.spawners = this.spawners.concat(map.getObjectLayer('spawners')['objects']);
    }
  }

  spawnPlayer(game, map) {
    let playerSpawner = parseInt(Math.random() * map.getObjectLayer('spawners')['objects'].length);
    this.player = new Player(
      game,
      map.getObjectLayer('spawners')['objects'][playerSpawner].x,
      map.getObjectLayer('spawners')['objects'][playerSpawner].y
    );
    //remove that spawner from the list to prevent a ghost gate spawning in the same spot
    map.getObjectLayer('spawners')['objects'].splice(playerSpawner, 1);
    this.playerSpawned = true;
  }

  spawnInitialEnemies() {
    for (let i = 0; i < this.initialSpawnedEnemies; i ++) { this.spawnEnemy(); };
  }

  buildModularBuilding(building) {
    let entrances = 0;
    let plotIndexes = [];
    //create a list of indexes
    for (let i = 0; i < building.length; i++) {
      plotIndexes.push(i);
    }
    let randPlotIndexes = [];
    //choose a random index and remove it from the list
    while(plotIndexes.length > 0) {
      let randNum = parseInt(Math.random() * plotIndexes.length);
      randPlotIndexes.push(plotIndexes.splice(randNum, 1).pop());
    }
    //use the random index to select a plot to place.
    while (randPlotIndexes.length > 0) {
      let plot = building[randPlotIndexes.pop()];
      let result = this.selectModularPiece(plot, building, entrances);
      let piece = result.piece;
      entrances = result.entrances;
      let mapSet = this.makeMapTileSet(this.game, piece.mapKey, piece.mapTileSetRef, piece.tileKey);
      this.placeMap(mapSet, {x: plot.x, y: plot.y}, plot.row);
      plot.openDirections = [];
      //update directions the plot can connect to
      piece.connections.forEach(direction => {
        plot.openDirections.push(direction);
      })
    }
  }

  /**
   * choose a modular piece randomly, then interate through all pieces until one is found that fits the plot.
   */
  selectModularPiece(plot, building, entrances) {
    let attempts = 0;
    let piece;
    let opposites = {
      'north': 'south',
      'south': 'north',
      'east': 'west',
      'west': 'east'
    };
    let neighborPlots = [
      {'direction': 'north', plot: this.findPlotByColumnAndRow(building, plot.column, plot.row - 1)},
      {'direction': 'east',  plot: this.findPlotByColumnAndRow(building, plot.column + 1, plot.row)},
      {'direction': 'south',  plot: this.findPlotByColumnAndRow(building, plot.column, plot.row + 1)},
      {'direction': 'west',  plot: this.findPlotByColumnAndRow(building, plot.column - 1, plot.row)}
    ]
    let isSuitable = false;
    let pieceCount = Constants.modularBuildingMaps.length;
    let randNum = parseInt(Math.random() * pieceCount);
    while (!isSuitable) {
      let entranceCount = entrances;
      let entranceAdded = false;
      let neededConnections = []
      neighborPlots.forEach(neighbor => {
        if (typeof neighbor.plot === 'undefined') {
          if (entranceCount < 2 && !entranceAdded) {
            neededConnections.push(neighbor.direction);
            entranceCount += 1;
            entranceAdded = true;
          };
        } else if (neighbor.plot.openDirections.includes(opposites[neighbor.direction])) {
          neededConnections.push(neighbor.direction);
        }
      });
      randNum += 1;
      //skip 0 as we only want to assign a empty plot if none of the others are valid
      if (randNum > pieceCount - 1) { randNum = 1;}
      let set = Constants.modularBuildingMaps[randNum];
      if(neededConnections.length == set.connections.length) {
        isSuitable = neededConnections.every(direction => set.connections.includes(direction));
      }
      piece = set;
      if (isSuitable) {
        entrances = entranceCount;
      } else if (attempts > pieceCount) {
        piece = Constants.modularBuildingMaps[0];
        isSuitable = true;
      }
      attempts += 1;
    }
    this.totalAttempts += attempts;
    return {'piece': piece, 'entrances': entrances};
  }

  findPlotByColumnAndRow(building, column, row) {
    let matchingPlot;
    building.forEach(plot => {
      if (plot.row == row && plot.column == column) 
        {
          matchingPlot = plot;
        }
    })
    return matchingPlot;
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
      this.loss = true;      
    } else {
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
          //this should never be called
          console.log('no Type');
          break;
      }
      this.updateGhostsText();
    }
  }

  updateGhostsText() {
    this.game.ui.updateGhostsText(this.enemies.children.size);
  }

  updateGatesText() {
    this.game.ui.updateGatesText(this.checkForOpenGates());
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
    let count = 0;
    this.ghostGates.children.entries.forEach(gate => {
      if (gate.self.open == true) { 
        count += 1;
      }
    });
    return count;
  }

  cleanup(factory) {
    factory.destroyAllExists();
  }
}
