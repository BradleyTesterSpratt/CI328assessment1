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
        debug: false
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
  this.load.atlasXML('firstSlime', 'assets/slimeA.png', 'assets/slimeA.xml');
  this.load.atlasXML('physTypeOne', 'assets/physicalClassOne.png', 'assets/physicalClassOne.xml');
  this.load.atlasXML('buster_sp', 'assets/buster.png', 'assets/buster.xml')
  this.load.atlasXML('wand_sp', 'assets/wand.png', 'assets/wand.xml')
  this.load.atlasXML('wandSparks', 'assets/wandSparks.png', 'assets/wandSparks.xml');
  this.load.audio('intro', 'assets/audio/start.mp3');
  this.load.audio('bg', 'assets/audio/start.mp3');
  //this.load.audio('bg', 'assets/audio/ufo_Theme.mp3');
  this.load.audio('explode', 'assets/audio/explode.mp3');
  this.load.audio('fly', 'assets/audio/fly.mp3');
  this.load.audio('shoot', 'assets/audio/shoot.mp3');
}

/**
 * Initialize the game.
 * The assets have been loaded by this point.
 */
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
  pauseGameForInput();
  game.input.on('pointerdown', startGame);
  path = { t: 0, vec: new Phaser.Math.Vector2() };
  stream1 = this.add.graphics();
  stream2 = this.add.graphics();
  stream3 = this.add.graphics();
  streamDestX = pointer.position.x;
  streamDestY = pointer.position.y;
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
function createAnimation(key, repeat, frameRate, spriteSheet, animationName) {
  game.anims.create(
    {
      key: key,
      repeat: repeat,
      frameRate: frameRate,
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
  createAnimation(`${sprite}WalkLeft`, -1, 5, sprite, 'side_walk_')
  createAnimation(`${sprite}WalkRight`, -1, 5, sprite, 'right_walk_')
  createAnimation(`${sprite}WalkBackLeft`, -1, 5, sprite, 'back_side_walk_')
  createAnimation(`${sprite}WalkBackRight`, -1, 5, sprite, 'back_right_walk_')
  createAnimation(`${sprite}WalkBack`, -1, 5, sprite, 'back_walk_')
  createAnimation(`${sprite}WalkForward`, -1, 5, sprite, 'front_walk_')
  createAnimation(`${sprite}IdleForward`, -1, 5, sprite, 'front_stand_')
  createAnimation(`${sprite}IdleBack`, -1, 5, sprite, 'back_stand_')
  createAnimation(`${sprite}Hit`, -1, 5, sprite, 'front_hurt_')
  createAnimation(`${sprite}LeftHit`, -1, 5, sprite, 'side_hurt_')
  createAnimation(`${sprite}RightHit`, -1, 5, sprite, 'right_hurt_')
  createAnimation(`${sprite}BackHit`, -1, 5, sprite, 'back_hurt_')
}

function animationSetUp()
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
  generateGhostAnimation('physTypeOne')
  createAnimation('wandSpark', -1, 20, 'wandSparks', 'spark_')
}

// function spawnEnemies() {
//     if (world.numEnemies > 0)
//         return;
    
//     const x = Phaser.Math.Between(50, 150);

    // attempt to display a wave of 3 new enemies
    // world.spawnEnemy(x, -50);
    // world.spawnEnemy(170, -50);
    // world.spawnEnemy(340 - x, -50);

//     //audio.fly.play();
// }

function startGame() {
  if (!game.paused)
    return;
  
  console.log("startGame()");

  // game.time.addEvent({ delay: 4000, repeat: -1, callback: spawnEnemies });
  
  setScore(0);

  resumeGameFromInput();
}

function addStreamPoints(curve, noOfPoints) {
  array = curve;
  array = array.getDistancePoints(noOfPoints);
  i = 0;
  for (i = 0; i < array.length; i++) {
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
    streamDestX = collidedBullet.x;
    streamDestY = collidedBullet.y;
  } else if (hitEnemy == null)  {
    streamDestX = pointer.position.x;
    streamDestY = pointer.position.y;
  } else {
    streamDestX = hitEnemy.x;
    streamDestY = hitEnemy.y;
  }
  if (shouldFire == true) {
    drawStream(20, 2, stream1, Constants.colour.streamBlue);
    drawStream(4, 4, stream2, Constants.colour.streamYellow);
    drawStream(30, 2, stream3, Constants.colour.streamRed);
  } else {
    stream1.clear();
    stream2.clear();
    stream3.clear();
    world.cleanup(world.bulletFactory);
    // hitEnemy = null;
  }
}

function drawStream(noOfPoints, thickness, graphics, colour) {
  curve = new Phaser.Curves.Spline(
    [
      player.wandEndX, player.wandEndY,
      streamDestX, streamDestY
    ]
  );
  curve.points = addStreamPoints(curve, noOfPoints);
  graphics.clear();
  graphics.lineStyle(thickness, colour, 1);
  curve.draw(graphics, 64);
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
  input.add(Phaser.Input.Keyboard.KeyCodes.A, function() { player.left(); });
  input.add(Phaser.Input.Keyboard.KeyCodes.D, function() { player.right(); });
  input.add(Phaser.Input.Keyboard.KeyCodes.W, function() { player.up(); });
  input.add(Phaser.Input.Keyboard.KeyCodes.S, function() { player.down(); });
  input.add(Phaser.Input.Keyboard.KeyCodes.SPACE, function() {
    player.firing = true;
    world.spawnBullet(player.wandEndX, player.wandEndY, pointer.position.x, pointer.position.y);
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
  slimeInfo = enemyBody.enemy.slime();
  playerBody.player.slime(slimeInfo);
}

function onCollisionBulletEnemy(bullet, enemy) {
  hitEnemy = enemy;
  bullet.destroy();
  enemy.enemy.leash();
}

function onCollisionPlayerWall(playerBody, wall) {
  playerBody.player.hitWall(playerBody.player.moving);
}

function onCollisionEnemyWall(enemyBody, wall) {
  if(enemyBody.enemy.isPhysical == true) {
    console.log("I shouldn't go through this!");
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

function setScore(value) {
  game.score = value;
  ui.updateScoreText(value);
}

function gameOver() {
  console.log("gameOver()");

  world.cleanup();

  pauseGameForInput();
}
