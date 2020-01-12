class PreloaderScene extends Phaser.Scene {
  constructor() {
    super('preloader');
  }

  preload() {
    //load tilesets and maps
    this.load.image('industrialTiles1', 'assets/tiles/room1.png');
    this.load.image('industrialTiles2', 'assets/tiles/room2.png');
    this.load.image('outsideTiles', 'assets/tiles/outside.png');
    this.load.tilemapTiledJSON('outsideMap1', 'assets/tilemaps/outside.json');
    this.load.tilemapTiledJSON('outsideMap2', 'assets/tilemaps/outside2.json');
    this.load.tilemapTiledJSON('outsideMap3', 'assets/tilemaps/outside3.json');
    this.load.tilemapTiledJSON('simpleRoom1', 'assets/tilemaps/simpleRoom.json');
    this.load.tilemapTiledJSON('simpleRoom2', 'assets/tilemaps/simpleRoom2.json');
    Constants.modularBuildingMaps.forEach(map => {
      this.load.tilemapTiledJSON(map.mapKey, `assets/tilemaps/${map.mapKey}.json`);
    });

    //load main menu assets
    this.load.image('menuBrickTiles', 'assets/images/menuBGTile.png');
    this.load.image('containmentUnit', 'assets/images/menuBackdrop.png');
    this.load.atlasXML('levelSizeButton', 'assets/sprites/levelSizeButton.png', 'assets/sprites/levelSizeButton.xml');
    this.load.atlasXML('redLight', 'assets/sprites/redLight.png', 'assets/sprites/redLight.xml');
    this.load.atlasXML('amberLight', 'assets/sprites/amberLight.png', 'assets/sprites/amberLight.xml');
    this.load.atlasXML('greenLight', 'assets/sprites/greenLight.png', 'assets/sprites/greenLight.xml');
    this.load.atlasXML('startHandle', 'assets/sprites/startHandle.png', 'assets/sprites/startHandle.xml');

    //load player assets
    this.load.atlasXML('ghostGate', 'assets/sprites/gates.png', 'assets/sprites/gates.xml');
    this.load.atlasXML('firstSlime', 'assets/sprites/slimeA.png', 'assets/sprites/slimeA.xml');
    this.load.atlasXML('secondSlime', 'assets/sprites/slimeB.png', 'assets/sprites/slimeB.xml');
    this.load.atlasXML('thirdSlime', 'assets/sprites/slimeC.png', 'assets/sprites/slimeC.xml');
    this.load.image('bullet_img', 'assets/sprites/bullet.png');
    this.load.atlasXML('buster_sp', 'assets/sprites/buster.png', 'assets/sprites/buster.xml')
    this.load.atlasXML('wand_sp', 'assets/sprites/wand.png', 'assets/sprites/wand.xml')
    this.load.atlasXML('wandSparks', 'assets/sprites/wandSparks.png', 'assets/sprites/wandSparks.xml');
    this.load.atlasXML('trap', 'assets/sprites/trap.png', 'assets/sprites/trap.xml');

    //load enemy assets
    this.load.atlasXML('physTypeOne', 'assets/sprites/physicalClassOne.png', 'assets/sprites/physicalClassOne.xml');

    //load game background
    this.load.image('slimeTiles', 'assets/images/slimeBGTile.png');
  }

  create() {
    this.animationSetUp();
    phaser.scene.start('title');
  }

  //This will not work correctly if each frame doesn't have the .png suffix
  //refactor to add the suffix into the function requirements?
  createAnimation(key, repeat, frameRate, spriteSheet, animationName, yoyo) {
    this.anims.create(
      {
        key: key,
        repeat: repeat,
        frameRate: frameRate,
        yoyo: (yoyo || false),
        frames: this.anims.generateFrameNames(spriteSheet, {
          prefix: animationName,
          suffix: '.png',
          //phaser3 will only load sprites it finds, so using 1-999 means it will catch all
          start: 1,
          end: 999
        })
      });
  }

  //This require's all ghost sprites to use the same naming convention in the .xml file
  generateGhostAnimation(sprite)
  {
    this.createAnimation(`${sprite}WalkLeft`, -1, 5, sprite, 'side_walk_');
    this.createAnimation(`${sprite}WalkRight`, -1, 5, sprite, 'right_walk_');
    this.createAnimation(`${sprite}WalkBackLeft`, -1, 5, sprite, 'back_side_walk_');
    this.createAnimation(`${sprite}WalkBackRight`, -1, 5, sprite, 'back_right_walk_');
    this.createAnimation(`${sprite}WalkBack`, -1, 5, sprite, 'back_walk_');
    this.createAnimation(`${sprite}WalkForward`, -1, 5, sprite, 'front_walk_');
    this.createAnimation(`${sprite}IdleForward`, -1, 5, sprite, 'front_stand_');
    this.createAnimation(`${sprite}IdleBack`, -1, 5, sprite, 'back_stand_');
    this.createAnimation(`${sprite}Hit`, -1, 5, sprite, 'front_hurt_');
    this.createAnimation(`${sprite}LeftHit`, -1, 5, sprite, 'side_hurt_');
    this.createAnimation(`${sprite}RightHit`, -1, 5, sprite, 'right_hurt_');
    this.createAnimation(`${sprite}BackHit`, -1, 5, sprite, 'back_hurt_');
  }

  animationSetUp()
  {
    this.playerAnimations();
    this.gateAnimations();
    this.generateGhostAnimation('physTypeOne');
  }

  playerAnimations()
  {
    this.createAnimation('walkLeft', -1, 5, 'buster_sp', 'frontWalkLeft');
    this.createAnimation('walkRight', -1, 5, 'buster_sp', 'frontWalkRight');
    this.createAnimation('walkForward', -1, 5, 'buster_sp', 'frontWalk');
    this.createAnimation('idleForward', -1, 5, 'buster_sp', 'frontIdle');
    this.createAnimation('hitForward', -1, 5, 'buster_sp', 'frontHit');
    this.createAnimation('walkBackLeft', -1, 5, 'buster_sp', 'backWalkLeft');
    this.createAnimation('walkBackRight', -1, 5, 'buster_sp', 'backWalkRight');
    this.createAnimation('walkBack', -1, 5, 'buster_sp', 'backWalk');
    this.createAnimation('idleBack', -1, 5, 'buster_sp', 'backIdle');
    this.createAnimation('hitBack', -1, 5, 'buster_sp', 'backHit');
    this.createAnimation('slimeDripA', -1, 2, 'firstSlime', 'drip');
    this.createAnimation('slimeDripB', -1, 2, 'secondSlime', 'drip');
    this.createAnimation('slimeDripC', -1, 2, 'thirdSlime', 'drip');
    this.createAnimation('wandSpark', -1, 20, 'wandSparks', 'spark_');
    this.createAnimation('trapOut', -1, 5, 'trap', 'trap_out_');
    this.createAnimation('trapClosed', -1, 5, 'trap', 'trap_closed_');
  }

  gateAnimations()
  {
    this.createAnimation('slimeGate', -1, 1.5, 'ghostGate', 'slime_', true);
    this.createAnimation('glowGate', -1, 5, 'ghostGate', 'glow_', true);
    this.createAnimation('closedGate', -1, 5, 'ghostGate', 'closed_');
  }
}