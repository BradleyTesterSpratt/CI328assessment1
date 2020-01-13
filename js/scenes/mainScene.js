class MainScene extends Phaser.Scene {
  constructor() {
    super('mainScene');
  }

  //values passed in when the scene is called
  init(config) {
    this.difficulty = config.difficulty;
    this.levelSize = config.levelSize;
  }

  create() {
    this.world = new World(this, this.difficulty, this.levelSize);
    /**
     * scene will not load correctly if it attempts to choose a modular piece too many times
     * as a result of row depth correction, it could load without the restart
     * but inner building walls may overlap
     */
    if (this.world.totalAttempts > 100) { this.scene.restart(); };
    this.gameInput = new Input(this);
    this.ui = new UI(this, this.world.mapSize);
    this.audio = new Audio(this);
    this.player = this.world.player;
    const game = this;
    if (phaser.isMobileDevice) {
      this.input.on('pointerdown', function() {game.startGame(); });
      this.configureInput(this);
    } else {
      this.gameInput.add('SPACE', function() { game.startGame(); });
    }
    this.pointer = this.input.activePointer;
    this.physics.add.overlap(this.player.playerBody, this.world.enemies, this.onCollisionPlayerEnemy);
    this.physics.add.overlap(this.world.bulletFactory.group, this.world.enemies, this.onCollisionBulletEnemy);
    this.physics.add.collider(this.player.playerBody, this.world.walls, this.onCollisionPlayerWall);
    this.physics.add.collider(this.world.enemies, this.world.walls, this.onCollisionEnemyWall);
    this.physics.add.overlap(this.world.bulletFactory.group, this.world.walls, this.onCollisionBulletWall);
    this.physics.add.collider(this.player.playerBody, this.world.ghostGates, this.onCollisionPlayerGate);
    this.physics.add.overlap(this.world.bulletFactory.group, this.world.ghostGates, this.onCollisionBulletGate);
    this.physics.add.overlap(this.player.playerBody, this.player.trap, this.onCollisionPlayerTrap);
    this.ui.updateGatesText(this.world.checkForOpenGates());
    this.gameStarted = false;
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
    this.cameras.main.centerOn(this.world.mapSize.x/2, this.world.mapSize.y/2);
    this.cameras.main.setZoom(0.15);
    //the pointer position does not behave correctly without this
    game.input.setPollAlways();
    this.background = this.add.tileSprite(this.world.mapSize.x/2, this.world.mapSize.y/2 ,this.world.mapSize.x * 1.25, this.world.mapSize.y * 1.25, "slimeTiles");
    this.background.setDepth(-10);
    this.victoryTime = 0;
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
      this.victoryTime += 0.16;
      this.victoryCheck();
    }
  }

  pauseGameForInput() {
    this.paused = true;
    this.cameras.main.centerOn(this.world.mapSize.x/2, this.world.mapSize.y/2);
    this.cameras.main.setZoom(0.15);
    this.ui.showStartText();
    if (phaser.isMobileDevice) { this.pauseButton.x = 10; };
  }

  resumeGameFromInput() {
    this.ui.disableStartText();
    this.cameras.main.zoomTo(0.75,1000);
    this.cameras.main.startFollow(this.player.playerBody);
    this.paused = false;
    if (phaser.isMobileDevice) { this.pauseButton.x = this.cameras.main.width - 10; };
  }

  startGame() {
    if (!this.paused && !this.gameStarted)
      return;    
    /**
     * trap will not deploy if the player is in it's collider
     * the collider initially starts taking up a large section of the screen
     * deploying it at start forces the player to grab it instantly, shrinking the collider
     */
    this.player.deployTrap(this.player.playerBody.x, this.player.playerBody.y)
    for (let i = 0; i < this.world.initialSpawnedEnemies; i ++) { this.world.spawnEnemy(); };
    this.gameStarted = true;
    if (!phaser.isMobileDevice) { this.configureInput(this); };
    this.resumeGameFromInput();
  }

  configureInput(game) {
    if (phaser.isMobileDevice) {
      let dPadLoc = {x: 25, y: this.cameras.main.height -50};
      const upButton = this.add.sprite(dPadLoc.x, dPadLoc.y - 40, 'up');
      upButton.on('pointerover', () => { 
        game.player.setMove('up');
      });
      const downButton = this.add.sprite(dPadLoc.x, dPadLoc.y + 40, 'down');
      downButton.on('pointerover', () => { 
        game.player.setMove('down');
      });
      const leftButton = this.add.sprite(dPadLoc.x - 40, dPadLoc.y, 'left');
      leftButton.on('pointerover', () => { 
        game.player.setMove('left');
      });
      const rightButton = this.add.sprite(dPadLoc.x + 40, dPadLoc.y, 'right');
      rightButton.on('pointerover', () => { 
        game.player.setMove('right');
      });
      const pauseButton = this.add.sprite(this.cameras.main.width - 10, 10, 'pause');
      pauseButton.on('pointerdown', () => { 
        !game.paused ? game.pauseGameForInput() : game.resumeGameFromInput();
      });
      let buttons = [upButton, downButton, rightButton, leftButton, pauseButton];
      buttons.forEach(button => {
        button.setOrigin(0.5, 0.5);
        button.setInteractive();
        button.setScrollFactor(0);
        button.setDepth(100);
      });
      game.upButton = upButton;
      game.downButton = downButton;
      game.rightButton = rightButton;
      game.leftButton = leftButton;
      game.pauseButton = pauseButton;
    } else {
      this.gameInput.add('A', function() { game.player.setMove('left'); });
      this.gameInput.add('D', function() { game.player.setMove('right'); });
      this.gameInput.add('W', function() { game.player.setMove('up'); });
      this.gameInput.add('S', function() { game.player.setMove('down'); });
      this.gameInput.add('P', function() { if (!game.paused) { game.pauseGameForInput()}});
      this.gameInput.add('SPACE', function() { if (game.paused) { game.resumeGameFromInput()}});
    }
    this.gameInput.leftClick(function() {
      game.player.firing = true;
      game.world.spawnBullet(game.player.wandEnd.x, game.player.wandEnd.y, game.pointer.worldX, game.pointer.worldY);
    });
  }

  //decide how streams should be handled
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
    let curve = new Phaser.Curves.Spline([
      this.player.wandEnd.x, this.player.wandEnd.y,
      this.streamDest.x, this.streamDest.y
    ]);
    curve.points = this.addStreamPoints(curve, noOfPoints);
    graphics.clear();
    graphics.lineStyle(thickness, colour, 1);
    curve.draw(graphics, 64);
    curve.getPoint(this.path.t, this.path.vec);
  }

  /**
   * this adds additional points between the current curve points,
   * then randomly offsets each new point from its current postition,
   * creating the randomness of the curve.
   */
  addStreamPoints(curve, noOfPoints) {
    let array = curve;
    array = array.getDistancePoints(noOfPoints);
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

  deployTrap(destX, destY) {
    let curve = new Phaser.Curves.Spline([
      this.player.playerBody.x, this.player.playerBody.y,
      //offset the final 2 points in hopes that the trap cable doesn't overlap the trap
      destX-40, destY+40,
      destX-10, destY+20
    ]);
    curve.points = this.addStreamPoints(curve, 9);
    this.trapWire.lineStyle(2, Constants.colour.blackSlime, 1);
    curve.draw(this.trapWire, 10);
    curve.getPoint(this.path.t, this.path.vec);
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
    /** 
     * using the 'this' keyword causes odd crashes and errors
     * each object has a reference to the scene it is part of
     * so get the scene using the parent reference instead
     */
    let scene = bullet.scene;
    scene.collidedBullet = {
      x: bullet.x,
      y: bullet.y
    }
    scene.world.wallHitSpark.x = bullet.x;
    scene.world.wallHitSpark.y = bullet.y;
    scene.world.wallHit = true;
    bullet.destroy();
  }

  onCollisionBulletGate(bullet, gate) {
    let scene = bullet.scene;
    if (gate.self.open == true) {
      scene.hitEnemy = gate;
      bullet.destroy();
      gate.self.damageGate(1);
      scene.world.updateGatesText();
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

  victoryCheck() {
    if (this.world.checkForOpenGates() == 0 && this.world.enemies.children.size == 0) {
      //we use victory time as the game time still counts while paused.
      this.paused = true;
      phaser.scene.start('victory', 
      {
        difficulty: this.difficulty,
        levelSize: this.levelSize,
        time: this.victoryTime,
        victory: true
      })
      phaser.scene.stop('mainScene');
    } else if (this.world.loss) {
      this.paused = true;
      phaser.scene.start('victory', 
      {
        difficulty: this.difficulty,
        levelSize: this.levelSize,
        time: 0,
        victory: false
      });
      phaser.scene.stop('mainScene');
    }
  }
}