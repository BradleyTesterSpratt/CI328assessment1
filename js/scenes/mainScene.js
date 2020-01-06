class MainScene extends Phaser.Scene {
  constructor() {
    super('mainScene');
  }
  /**
   * The first thing to be called.
   * Loads assets.
   */
  preload() {
    console.log("preload()");
    // this.score = 0;
    // this.load.image('testTiles', 'assets/tiles/sciFiTiles.png');
    this.load.image('industrialTiles1', 'assets/tiles/room1.png');
    this.load.image('industrialTiles2', 'assets/tiles/room2.png');
    this.load.image('outsideTiles', 'assets/tiles/outside.png');
    // this.load.tilemapTiledJSON('testMap', 'assets/tilemaps/testMap.json');
    this.load.tilemapTiledJSON('outsideMap', 'assets/tilemaps/outside.json');

    this.load.image('bullet_img', 'assets/bullet.png');

    this.load.atlasXML('ghostGate', 'assets/sprites/gates.png', 'assets/sprites/gates.xml');
    this.load.atlasXML('firstSlime', 'assets/sprites/slimeA.png', 'assets/sprites/slimeA.xml');
    this.load.atlasXML('secondSlime', 'assets/sprites/slimeB.png', 'assets/sprites/slimeB.xml');
    this.load.atlasXML('thirdSlime', 'assets/sprites/slimeC.png', 'assets/sprites/slimeC.xml');
    this.load.atlasXML('physTypeOne', 'assets/physicalClassOne.png', 'assets/physicalClassOne.xml');
    this.load.atlasXML('buster_sp', 'assets/buster.png', 'assets/buster.xml')
    this.load.atlasXML('wand_sp', 'assets/wand.png', 'assets/wand.xml')
    this.load.atlasXML('wandSparks', 'assets/wandSparks.png', 'assets/wandSparks.xml');
    this.load.atlasXML('trap', 'assets/sprites/trap.png', 'assets/sprites/trap.xml');

    this.load.audio('intro', 'assets/audio/start.mp3');
    this.load.audio('bg', 'assets/audio/start.mp3');
    this.load.audio('explode', 'assets/audio/explode.mp3');
    this.load.audio('fly', 'assets/audio/fly.mp3');
    this.load.audio('shoot', 'assets/audio/shoot.mp3');
  }

  create() {
    this.start = false;
    this.world = new World(this);
    this.gameInput = new Input(this);
    this.ui = new UI(this);
    this.audio = new Audio(this);
    this.player = this.world.player;
    const game = this;
    this.gameInput.leftClick(function() { game.startGame(); });
    this.animationSetUp();
    // this.input.on('pointerdown', 
    //   start = true;
    // });
    this.pointer = this.input.activePointer;
    this.physics.add.overlap(this.player.playerBody, this.world.enemies, this.onCollisionPlayerEnemy);
    this.physics.add.overlap(this.world.bulletFactory.group, this.world.enemies, this.onCollisionBulletEnemy);
    this.physics.add.collider(this.player.playerBody, this.world.walls, this.onCollisionPlayerWall);
    this.physics.add.collider(this.world.enemies, this.world.walls, this.onCollisionEnemyWall);
    this.physics.add.overlap(this.world.bulletFactory.group, this.world.walls, this.onCollisionBulletWall);
    this.physics.add.collider(this.player.playerBody, this.world.ghostGates, this.onCollisionPlayerGate);
    this.physics.add.overlap(this.world.bulletFactory.group, this.world.ghostGates, this.onCollisionBulletGate);
    this.physics.add.overlap(this.player.playerBody, this.player.trap, this.onCollisionPlayerTrap);
    this.pauseGameForInput();
    this.path = { t: 0, vec: new Phaser.Math.Vector2() };
    this.stream1 = this.add.graphics().setDepth(50);
    this.stream2 = this.add.graphics().setDepth(50);
    this.stream3 = this.add.graphics().setDepth(50);
    this.streamDest = {
      x: this.pointer.worldX,
      y: this.pointer.worldY
    };
    this.trapWire = this.add.graphics().setDepth(12);
    this.hitEnemy = null;
    this.collidedBullet = null;
    this.bulletCheck = 0.0;
    this.cameras.main.startFollow(this.player.playerBody);
    // this.cameras.main.setBounds;(400, 300, (this.world.mapSize.x - 400), (this.world.mapSize.y - 300));
    // this.cameras.main.setDeadzone(700,500);

  }

  pauseGameForInput() {
    this.paused = true;

    this.ui.showStartText();
  }

  resumeGameFromInput() {
    this.ui.disableStartText();
    this.paused = false;
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

  startGame() {
    if (!this.paused)
      return;
    
    console.log("startGame()");
    //trap will not deploy if the player is in it's collider, this resets it
    this.player.deployTrap(this.player.playerBody.x, this.player.playerBody.y)

    // game.time.addEvent({ delay: 4000, repeat: -1, callback: spawnEnemies });
    
    this.setScore(0);
    this.configureInput(this);

    this.resumeGameFromInput();
  }

  addStreamPoints(curve, noOfPoints) {
    let array = curve;
    array = array.getDistancePoints(noOfPoints);
    // let i = 0;
    for (let i = 1; i < array.length-1; i++) {
      let random = (Math.floor((Math.random()*5)+1));
      let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
      random = random * plusOrMinus;
      array[i].x = array[i].x + random;
      random = (Math.floor((Math.random()*5)+1));
      random = random * plusOrMinus;
      array[i].y = array[i].y + random;
    }
    return array;
  }

  processStreams(shouldFire) {  
    if (this.collidedBullet != null) {
      this.streamDest.x = this.collidedBullet.x;
      this.streamDest.y = this.collidedBullet.y;
    } else if (this.hitEnemy == null)  {
      this.streamDest.x = this.pointer.worldX;
      this.streamDest.y = this.pointer.worldY;
    } else {
      this.streamDest.x = this.hitEnemy.x;
      this.streamDest.y = this.hitEnemy.y;
    }
    if (shouldFire == true) {
      this.drawStream(20, 2, this.stream1, Constants.colour.streamBlue);
      this.drawStream(4, 2, this.stream2, Constants.colour.streamYellow);
      this.drawStream(4, 4, this.stream3, Constants.colour.streamRed);
    } else {
      this.stream1.clear();
      this.stream2.clear();
      this.stream3.clear();
      this.world.cleanup(this.world.bulletFactory);
    }
  }

  drawStream(noOfPoints, thickness, graphics, colour) {
    let curve = new Phaser.Curves.Spline(
      [
        this.player.wandEnd.x, this.player.wandEnd.y,
        this.streamDest.x, this.streamDest.y
      ]
    );
    curve.points = this.addStreamPoints(curve, noOfPoints);
    graphics.clear();
    graphics.lineStyle(thickness, colour, 1);
    curve.draw(graphics, 64);
    curve.getPoint(this.path.t, this.path.vec);
  }

  deployTrap(destX, destY) {
    let curve = new Phaser.Curves.Spline(
      [
        this.player.playerBody.x, this.player.playerBody.y,
        destX-40, destY+40,
        destX-10, destY+20
      ]
    );
    curve.points = this.addStreamPoints(curve, 9);
    this.trapWire.lineStyle(2, Constants.colour.blackSlime, 1);
    curve.draw(this.trapWire, 10);
    curve.getPoint(this.path.t, this.path.vec);
  }

  update() {
    this.gameInput.update();
    if (!this.paused) {
      //must process streams before updating the player
      this.processStreams(this.player.firing);
      this.world.update();
      if (this.hitEnemy != null || this.collidedBullet != null) {
        this.bulletCheck += 0.02;
      }
      if (this.bulletCheck > 1) {
        this.hitEnemy = null;
        this.collidedBullet = null;
        this.world.wallHit = false;
        this.bulletCheck = 0.0;
      }
    }
  }

  configureInput(game) {
    this.gameInput.add(Phaser.Input.Keyboard.KeyCodes.A, function() { game.player.setMove('left'); });
    this.gameInput.add(Phaser.Input.Keyboard.KeyCodes.D, function() { game.player.setMove('right'); });
    this.gameInput.add(Phaser.Input.Keyboard.KeyCodes.W, function() { game.player.setMove('up'); });
    this.gameInput.add(Phaser.Input.Keyboard.KeyCodes.S, function() { game.player.setMove('down'); });
    this.gameInput.add(Phaser.Input.Keyboard.KeyCodes.SPACE, function() {
      game.player.firing = true;
      game.world.spawnBullet(game.player.wandEnd.x, game.player.wandEnd.y, game.pointer.worldX, game.pointer.worldY);
      // audio.shoot.play();
    });

  }
  aimFromPlayerToPointer() {
    let radian = Phaser.Math.Angle.BetweenPoints(this.player.playerBody, {x: this.pointer.worldX, y: this.pointer.worldY});
    let degrees = Phaser.Math.RadToDeg(radian);
    return (degrees);
  }

  onCollisionPlayerEnemy(playerBody, enemyBody) {
    if (enemyBody.enemy.hasCollided == false) {
      let slimeInfo = enemyBody.enemy.slime();
      playerBody.player.slime(slimeInfo);
    }
  }

  onCollisionPlayerWall(playerBody, wall) {
    playerBody.player.hitWall();
  }

  onCollisionPlayerGate(playerBody, gate) {
    if (gate.self.open == true) { playerBody.player.hitWall() }
  }

  onCollisionPlayerTrap(playerBody, trap) {
    playerBody.player.grabTrap();
    playerBody.scene.trapWire.clear();
  }

  onCollisionEnemyWall(enemyBody, wall) {
    if(enemyBody.enemy.isPhysical == true) {
      enemyBody.enemy.hitWall(enemyBody.enemy.moving);
    }
  }

  onCollisionBulletWall(bullet, wall) {
    bullet.scene.collidedBullet = {
      x: bullet.x,
      y: bullet.y
    }
    bullet.scene.world.wallHitSpark.x = bullet.x;
    bullet.scene.world.wallHitSpark.y = bullet.y;
    bullet.scene.world.wallHit = true;
    bullet.destroy();
  }

  onCollisionBulletGate(bullet, gate) {
    if (gate.self.open == true) {
      bullet.scene.hitEnemy = gate;
      bullet.destroy();
      gate.self.damageGate(1);
    }
  }

  onCollisionBulletEnemy(bullet, enemy) {
    let scene = bullet.scene;
    bullet.scene.hitEnemy = enemy;
    bullet.destroy();
    let ghostStats = enemy.enemy.leash(1);
    if (ghostStats.hp <= 0 && scene.world.player.trapHeld == true) {
      scene.world.cleanup(scene.world.bulletFactory);
      enemy.enemy.trap();
      scene.deployTrap(ghostStats.x, ghostStats.y);
      scene.player.deployTrap(ghostStats.x, ghostStats.y);
      //unshift adds to the beginning of an array, so that the most recent ghost caught is the last to spawn
      scene.world.spiritWorld.unshift(enemy.enemy.type);
    }
  }

  setScore(value) {
    this.score = value;
    this.ui.updateScoreText(value);
  }

  gameOver() {
    console.log("gameOver()");

    this.world.cleanup();

    this.pauseGameForInput();
  }
}