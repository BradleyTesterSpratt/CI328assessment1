let game;
let phaser;
let world;

let input;
let ui;
let audio;

function main() {
  console.log("main()");
  var config = {
    type: Phaser.AUTO,
    parent: 'my-game',
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        debug: true
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };

  phaser = new Phaser.Game(config);
}

/**
 * The first thing to be called.
 * Loads assets.
 */
function preload() {
  console.log("preload()");

  game = this;
  game.score = 0;
  this.load.image('testTiles', 'assets/tiles/sciFiTiles.png');
  this.load.tilemapTiledJSON('testMap', 'assets/tilemaps/testMap.json');

  this.load.image('background_img', 'assets/gameBg.png');
  this.load.image('bullet_img', 'assets/bullet.png');

  this.load.atlasXML('ghostGate', 'assets/sprites/gates.png', 'assets/sprites/gates.xml');
  this.load.atlasXML('firstSlime', 'assets/slimeA.png', 'assets/slimeA.xml');
  this.load.atlasXML('secondSlime', 'assets/sprites/slimeB.png', 'assets/sprites/slimeB.xml');
  this.load.atlasXML('thirdSlime', 'assets/sprites/slimeC.png', 'assets/sprites/slimeC.xml');
  this.load.atlasXML('physTypeOne', 'assets/physicalClassOne.png', 'assets/physicalClassOne.xml');
  this.load.atlasXML('buster_sp', 'assets/buster.png', 'assets/buster.xml')
  this.load.atlasXML('wand_sp', 'assets/wand.png', 'assets/wand.xml')
  this.load.atlasXML('wandSparks', 'assets/wandSparks.png', 'assets/wandSparks.xml');
  this.load.atlasXML('trap', 'assets/sprites/trap.png', 'assets/sprites/trap.xml');

  this.load.audio('intro', 'assets/audio/start.mp3');
  this.load.audio('bg', 'assets/audio/start.mp3');
  //this.load.audio('bg', 'assets/audio/ufo_Theme.mp3');
  this.load.audio('explode', 'assets/audio/explode.mp3');
  this.load.audio('fly', 'assets/audio/fly.mp3');
  this.load.audio('shoot', 'assets/audio/shoot.mp3');
}

function create() {
  world = new World(game);
  input = new Input();
  ui = new UI();
  audio = new Audio();
  player = world.player;
  animationSetUp();
  configureInput();
  pointer = game.input.activePointer;
  this.physics.add.overlap(player.playerBody, world.enemies, onCollisionPlayerEnemy);
  this.physics.add.overlap(world.bulletFactory.group, world.enemies, onCollisionBulletEnemy);
  this.physics.add.collider(player.playerBody, world.walls, onCollisionPlayerWall);
  this.physics.add.collider(world.enemies, world.walls, onCollisionEnemyWall);
  this.physics.add.overlap(world.bulletFactory.group, world.walls, onCollisionBulletWall);
  this.physics.add.collider(player.playerBody, world.ghostGates, onCollisionPlayerGate);
  this.physics.add.overlap(world.bulletFactory.group, world.ghostGates, onCollisionBulletGate);
  this.physics.add.overlap(player.playerBody, player.trap, onCollisionPlayerTrap);
  pauseGameForInput();
  game.input.on('pointerdown', startGame);
  path = { t: 0, vec: new Phaser.Math.Vector2() };
  stream1 = this.add.graphics().setDepth(50);
  stream2 = this.add.graphics().setDepth(50);
  stream3 = this.add.graphics().setDepth(50);
  streamDest = {x: pointer.position.x, y: pointer.position.y};
  trapWire = this.add.graphics().setDepth(12);
  hitEnemy = null;
  collidedBullet = null;
  bulletCheck = 0.0
}

function pauseGameForInput() {
  game.paused = true;

  ui.showStartText();
}

function resumeGameFromInput() {
  ui.disableStartText();
  game.paused = false;
}

//This will not work correctly if each frame doesn't have the .png suffix
//refactor to add the suffix into the function requirements?
function createAnimation(key, repeat, frameRate, spriteSheet, animationName, yoyo) {
  game.anims.create(
    {
      key: key,
      repeat: repeat,
      frameRate: frameRate,
      yoyo: (yoyo || false),
      frames: game.anims.generateFrameNames(spriteSheet, {
        prefix: animationName,
        suffix: '.png',
        //phaser3 will only load sprites it finds, so using 1-999 means it will catch all
        start: 1,
        end: 999
      })
    });
}

//This require's all ghost sprites to use the same naming convention in the .xml file
function generateGhostAnimation(sprite)
{
  createAnimation(`${sprite}WalkLeft`, -1, 5, sprite, 'side_walk_');
  createAnimation(`${sprite}WalkRight`, -1, 5, sprite, 'right_walk_');
  createAnimation(`${sprite}WalkBackLeft`, -1, 5, sprite, 'back_side_walk_');
  createAnimation(`${sprite}WalkBackRight`, -1, 5, sprite, 'back_right_walk_');
  createAnimation(`${sprite}WalkBack`, -1, 5, sprite, 'back_walk_');
  createAnimation(`${sprite}WalkForward`, -1, 5, sprite, 'front_walk_');
  createAnimation(`${sprite}IdleForward`, -1, 5, sprite, 'front_stand_');
  createAnimation(`${sprite}IdleBack`, -1, 5, sprite, 'back_stand_');
  createAnimation(`${sprite}Hit`, -1, 5, sprite, 'front_hurt_');
  createAnimation(`${sprite}LeftHit`, -1, 5, sprite, 'side_hurt_');
  createAnimation(`${sprite}RightHit`, -1, 5, sprite, 'right_hurt_');
  createAnimation(`${sprite}BackHit`, -1, 5, sprite, 'back_hurt_');
}

function animationSetUp()
{
  playerAnimations();
  gateAnimations();
  generateGhostAnimation('physTypeOne');
}

function playerAnimations()
{
  createAnimation('walkLeft', -1, 5, 'buster_sp', 'frontWalkLeft');
  createAnimation('walkRight', -1, 5, 'buster_sp', 'frontWalkRight');
  createAnimation('walkForward', -1, 5, 'buster_sp', 'frontWalk');
  createAnimation('idleForward', -1, 5, 'buster_sp', 'frontIdle');
  createAnimation('hitForward', -1, 5, 'buster_sp', 'frontHit');
  createAnimation('walkBackLeft', -1, 5, 'buster_sp', 'backWalkLeft');
  createAnimation('walkBackRight', -1, 5, 'buster_sp', 'backWalkRight');
  createAnimation('walkBack', -1, 5, 'buster_sp', 'backWalk');
  createAnimation('idleBack', -1, 5, 'buster_sp', 'backIdle');
  createAnimation('hitBack', -1, 5, 'buster_sp', 'backHit');
  createAnimation('slimeDripA', -1, 2, 'firstSlime', 'drip');
  createAnimation('slimeDripB', -1, 2, 'secondSlime', 'drip');
  createAnimation('slimeDripC', -1, 2, 'thirdSlime', 'drip');
  createAnimation('wandSpark', -1, 20, 'wandSparks', 'spark_');
  createAnimation('trapOut', -1, 5, 'trap', 'trap_out_');
  createAnimation('trapClosed', -1, 5, 'trap', 'trap_closed_');
}

function gateAnimations()
{
  createAnimation('slimeGate', -1, 1.5, 'ghostGate', 'slime_', true);
  createAnimation('glowGate', -1, 5, 'ghostGate', 'glow_', true);
  createAnimation('closedGate', -1, 5, 'ghostGate', 'closed_');
}

function startGame() {
  if (!game.paused)
    return;
  
  console.log("startGame()");
  //trap will not deploy if the player is in it's collider, this resets it
  player.deployTrap(player.playerBody.x, player.playerBody.y)

  // game.time.addEvent({ delay: 4000, repeat: -1, callback: spawnEnemies });
  
  setScore(0);

  resumeGameFromInput();
}

function addStreamPoints(curve, noOfPoints) {
  array = curve;
  array = array.getDistancePoints(noOfPoints);
  i = 0;
  for (i = 1; i < array.length-1; i++) {
    random = (Math.floor((Math.random()*5)+1));
    plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    random = random * plusOrMinus;
    array[i].x = array[i].x + random;
    random = (Math.floor((Math.random()*5)+1));
    random = random * plusOrMinus;
    array[i].y = array[i].y + random;
  }
  return array;
}

function processStreams(shouldFire) {  
  if (collidedBullet != null) {
    streamDest.x = collidedBullet.x;
    streamDest.y = collidedBullet.y;
  } else if (hitEnemy == null)  {
    streamDest.x = pointer.position.x;
    streamDest.y = pointer.position.y;
  } else {
    streamDest.x = hitEnemy.x;
    streamDest.y = hitEnemy.y;
  }
  if (shouldFire == true) {
    drawStream(20, 2, stream1, Constants.colour.streamBlue);
    drawStream(4, 2, stream2, Constants.colour.streamYellow);
    drawStream(4, 4, stream3, Constants.colour.streamRed);
  } else {
    stream1.clear();
    stream2.clear();
    stream3.clear();
    world.cleanup(world.bulletFactory);
  }
}

function drawStream(noOfPoints, thickness, graphics, colour) {
  curve = new Phaser.Curves.Spline(
    [
      player.wandEnd.x, player.wandEnd.y,
      streamDest.x, streamDest.y
    ]
  );
  curve.points = addStreamPoints(curve, noOfPoints);
  graphics.clear();
  graphics.lineStyle(thickness, colour, 1);
  curve.draw(graphics, 64);
  curve.getPoint(path.t, path.vec);
}

function deployTrap(destX, destY) {
  curve = new Phaser.Curves.Spline(
    [
      player.playerBody.x, player.playerBody.y,
      destX-40, destY+40,
      destX-10, destY+20
    ]
  );
  curve.points = addStreamPoints(curve, 9);
  trapWire.lineStyle(2, Constants.colour.blackSlime, 1);
  curve.draw(trapWire, 10);
  curve.getPoint(path.t, path.vec);
}

function update() {
  input.update();
  if (!game.paused) {
    //must process streams before updating the player
    processStreams(player.firing);
    world.update();
    if (hitEnemy != null || collidedBullet != null) {
      bulletCheck += 0.02;
    }
    if (bulletCheck > 1) {
      hitEnemy = null;
      collidedBullet = null;
      world.wallHit = false;
      bulletCheck = 0.0;
    }
  }
}

function configureInput() {
  input.add(Phaser.Input.Keyboard.KeyCodes.A, function() { player.setMove('left'); });
  input.add(Phaser.Input.Keyboard.KeyCodes.D, function() { player.setMove('right'); });
  input.add(Phaser.Input.Keyboard.KeyCodes.W, function() { player.setMove('up'); });
  input.add(Phaser.Input.Keyboard.KeyCodes.S, function() { player.setMove('down'); });
  input.add(Phaser.Input.Keyboard.KeyCodes.SPACE, function() {
    player.firing = true;
    world.spawnBullet(player.wandEnd.x, player.wandEnd.y, pointer.position.x, pointer.position.y);
    // audio.shoot.play();
  });

}
function aimFromPlayerToPointer() {
  playerSprite = world.player.playerBody;
  radian = Phaser.Math.Angle.BetweenPoints(playerSprite, pointer.position);
  degrees = Phaser.Math.RadToDeg(radian);
  return (degrees);
}

function onCollisionPlayerEnemy(playerBody, enemyBody) {
  if (player.hasCollided == false) {
    slimeInfo = enemyBody.enemy.slime();
    player.slime(slimeInfo);
  }
}

function onCollisionPlayerWall(playerBody, wall) {
  playerBody.player.hitWall();
}

function onCollisionPlayerGate(playerBody, gate) {
  if (gate.self.open == true) { playerBody.player.hitWall() }
}

function onCollisionPlayerTrap(playerBody, trap) {
  playerBody.player.grabTrap();
  trapWire.clear();
}

function onCollisionEnemyWall(enemyBody, wall) {
  if(enemyBody.enemy.isPhysical == true) {
    enemyBody.enemy.hitWall(enemyBody.enemy.moving);
  }
}

function onCollisionBulletWall(bullet, wall) {
  collidedBullet = {
    x: bullet.x,
    y: bullet.y
  }
  world.wallHitSpark.x = bullet.x;
  world.wallHitSpark.y = bullet.y;
  world.wallHit = true;
  bullet.destroy();
}

function onCollisionBulletGate(bullet, gate) {
  if (gate.self.open == true) {
    hitEnemy = gate;
    bullet.destroy();
    gate.self.damageGate(1);
  }
}

function onCollisionBulletEnemy(bullet, enemy) {
  hitEnemy = enemy;
  bullet.destroy();
  ghostStats = enemy.enemy.leash(1);
  if (ghostStats.hp <= 0 && world.player.trapHeld == true) {
    world.cleanup(world.bulletFactory);
    enemy.enemy.trap();
    deployTrap(ghostStats.x, ghostStats.y);
    world.player.deployTrap(ghostStats.x, ghostStats.y);
    //unshift adds to the beginning of an array, so that the most recent ghost caught is the last to spawn
    world.spiritWorld.unshift(enemy.enemy.type);
  }
}

function setScore(value) {
  game.score = value;
  ui.updateScoreText(value);
}

function gameOver() {
  console.log("gameOver()");

  world.cleanup();

  pauseGameForInput();
}
