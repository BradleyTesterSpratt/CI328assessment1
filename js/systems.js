class Audio {
  constructor(game) {
    this.intro = game.sound.add('intro');
    //this.intro.play();
    this.bg = game.sound.add('bg', true);
    //this.bg.play();
    this.explode = game.sound.add('explode');
    this.fly = game.sound.add('fly');
    this.shoot = game.sound.add('shoot');
  }
}

class Input {
  constructor(game) {
    this.game = game;

    this.keyMap = new Map();
  }

  add(key, action) {
    this.keyMap.set(this.game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[key]), action);
  }

  leftClick(action) {
    this.keyMap.set(this.game.input.activePointer, action);
  }
  
  update() {
    for (const [key, action] of this.keyMap.entries()) {
      if (key.isDown) {
        action();
      }
    }
  }
}

class UI {
  //this needs to be updated to follow the camera
  constructor(game, mapSize) {
    this.startGameText = game.add.text(mapSize.x / 2, mapSize.y / 2, 'Click to Start', {
      // this.startGameText = game.add.text(game.world.mapSize.x / 2, game.world.mapSize.y / 2, 'Press SPACEBAR to Start', {
      font: '200px Arial',
      fill: 'black'
    });
    this.startGameText.setOrigin(0.5, 0.5);
    this.startGameText.setDepth(100);

    this.ghostsText = game.add.text(0, -30, 'Ghosts Present: 0', {
      font: '34px Arial',
      fill: '#fff'
    });
    this.ghostsText.setDepth(100);
    this.ghostsText.setScrollFactor(0);

    this.gatesText = game.add.text(0, -5, 'Open Gates: 0', {
      font: '34px Arial',
      fill: '#fff'
    });
    this.gatesText.setDepth(100);
    this.gatesText.setScrollFactor(0);
  }

  updateGhostsText(newCount) {
    this.ghostsText.setText('Ghosts Present: ' + newCount);
  }

  updateGatesText(newCount) {
    this.gatesText.setText('Open Gates: ' + newCount);
  }

  showStartText() {
    this.startGameText.visible = true;
    this.gatesText.visible = false;
    this.ghostsText.visible = false;
  }

  disableStartText() {
    this.startGameText.visible = false;
    this.gatesText.visible = true;
    this.ghostsText.visible = true;
  }
}

class Constants {
  static colour = {
    streamWhite: 0xffffff,
    streamBlue: 0x00ffff,
    streamRed: 0xff0000,
    streamYellow: 0xffff00,
    pinkSlime: 0x936999,
    greenSlime: 0x00FF00,
    blackSlime: 0x444444
  }
  static baseMaps = [
    {mapKey: 'outsideMap1', mapTileSetRef: 'outside', tileKey: 'outsideTiles', size: 1},
    {mapKey: 'outsideMap2', mapTileSetRef: 'outside', tileKey: 'outsideTiles', size: 2},
    {mapKey: 'outsideMap3', mapTileSetRef: 'outside', tileKey: 'outsideTiles', size: 2},
  ]
  static simpleBuildingMaps = [
    {mapKey: 'simpleRoom1', mapTileSetRef: 'room2', tileKey: 'industrialTiles2'},
    {mapKey: 'simpleRoom2', mapTileSetRef: 'room1', tileKey: 'industrialTiles1'}
  ]
  static modularBuildingMaps = [
    {mapKey: 'industrialEmpty', mapTileSetRef: 'room2', tileKey: 'industrialTiles2', connections: []},
    {mapKey: 'industrialEN', mapTileSetRef: 'room2', tileKey: 'industrialTiles2', connections: ['north', 'east']},
    {mapKey: 'industrialN', mapTileSetRef: 'room2', tileKey: 'industrialTiles2', connections: ['north']},
    {mapKey: 'industrialS', mapTileSetRef: 'room2', tileKey: 'industrialTiles2', connections: ['south']},
    {mapKey: 'industrialSE', mapTileSetRef: 'room2', tileKey: 'industrialTiles2', connections: ['south', 'east']},
    {mapKey: 'industrialWEN', mapTileSetRef: 'room2', tileKey: 'industrialTiles2', connections: ['west', 'east', 'north']},
    {mapKey: 'industrialWN', mapTileSetRef: 'room2', tileKey: 'industrialTiles2', connections: ['west', 'north']},
    {mapKey: 'industrialWS', mapTileSetRef: 'room2', tileKey: 'industrialTiles2', connections: ['west', 'south']},
    {mapKey: 'industrialWSE', mapTileSetRef: 'room2', tileKey: 'industrialTiles2', connections: ['west', 'south', 'east']},
    {mapKey: 'industrialWSEN', mapTileSetRef: 'room2', tileKey: 'industrialTiles2', connections: ['north', 'south', 'east', 'west']},
    {mapKey: 'industrialWSN', mapTileSetRef: 'room2', tileKey: 'industrialTiles2', connections: ['north', 'south', 'west']}
  ]
  static enemyTypes = [ 'physTypeOne']
  static levelSizes = ['Tiny', 'Small', 'Medium', 'Large']
}