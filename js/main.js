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
    this.load.image('background_img', 'assets/gameBg.png');
    this.load.image('bullet_img', 'assets/bullet.png');
    this.load.atlasXML('firstSlime', 'assets/slimeA.png', 'assets/slimeA.xml');
    this.load.atlasXML('physTypeOne', 'assets/physicalClassOne.png', 'assets/physicalClassOne.xml');
    this.load.atlasXML('buster_sp', 'assets/buster.png', 'assets/buster.xml')
    this.load.atlasXML('wand_sp', 'assets/wand.png', 'assets/wand.xml')
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

    animationSetUp();
    configureInput();

    pointer = game.input.activePointer;

    this.physics.add.overlap(world.player.playerBody, world.tempEnemy.enemySprite, onCollisionPlayerEnemy);
    
    pauseGameForInput();
    
    game.input.on('pointerdown', startGame);
}

function pauseGameForInput() {
    game.paused = true;

    ui.showStartText();
}

function resumeGameFromInput() {
    ui.disableStartText();
    game.paused = false;
}

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

function update() {
  input.update();
  world.update();
}

function configureInput() {
  input.add(Phaser.Input.Keyboard.KeyCodes.A, function() { world.player.left(); });
  input.add(Phaser.Input.Keyboard.KeyCodes.D, function() { world.player.right(); });
  input.add(Phaser.Input.Keyboard.KeyCodes.W, function() { world.player.up(); });
  input.add(Phaser.Input.Keyboard.KeyCodes.S, function() { world.player.down(); });
  // input.add(Phaser.Input.Keyboard.KeyCodes.SPACE, function() {
  //     world.spawnBullet(world.player.sprite.x, world.player.sprite.y);
  //     audio.shoot.play();
  // });

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

// function onCollisionBulletEnemy(bulletSprite, enemySprite) {
//     bulletSprite.destroy();
//     enemySprite.destroy();
//     audio.explode.play();

//     world.numEnemies--;
//     setScore(game.score + 20);
// }

function setScore(value) {
    game.score = value;
    ui.updateScoreText(value);
}

function gameOver() {
    console.log("gameOver()");

    world.cleanup();

    pauseGameForInput();
}
