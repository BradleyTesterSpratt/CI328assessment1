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

    this.load.image('background_img', 'assets/gameBg.png');
    this.load.image('bullet_img', 'assets/bullet.png');
    this.load.atlasXML('enemy_sp', 'assets/enemy512x512x16.png', 'assets/enemy512x512x16.xml');
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
    console.log("create()");

    world = new World(game);

    input = new Input();
    ui = new UI();
    audio = new Audio();
    pointer = game.input.activePointer;

    input.add(Phaser.Input.Keyboard.KeyCodes.A, function() { world.player.left(); });
    input.add(Phaser.Input.Keyboard.KeyCodes.D, function() { world.player.right(); });
    input.add(Phaser.Input.Keyboard.KeyCodes.W, function() { world.player.up(); });
    input.add(Phaser.Input.Keyboard.KeyCodes.S, function() { world.player.down(); });
    // input.add(Phaser.Input.Keyboard.KeyCodes.SPACE, function() {
    //     world.spawnBullet(world.player.sprite.x, world.player.sprite.y);
    //     audio.shoot.play();
    // });

    this.anims.create(
      {
        key: 'walkLeft',
        repeat: -1,
        frameRate: 5,
        frames: this.anims.generateFrameNames('buster_sp', {
          prefix: 'frontWalkLeft',
          suffix: '.png',
          start: 1,
          end: 5
        })
      });

    this.anims.create(
      {
        key: 'walkRight',
        repeat: -1,
        frameRate: 5,
        frames: this.anims.generateFrameNames('buster_sp', {
          prefix: 'frontWalkRight',
          suffix: '.png',
          start: 1,
          end: 5
        })
      });

    this.anims.create(
      {
        key: 'walkForward',
        repeat: -1,
        frameRate: 5,
        frames: this.anims.generateFrameNames('buster_sp', {
          prefix: 'frontWalk',
          suffix: '.png',
          start: 1,
          end: 2
        })
      });

    this.anims.create(
      {
        key: 'idleForward',
        frames: this.anims.generateFrameNames('buster_sp', {
          prefix: 'frontIdle',
          suffix: '.png',
          start: 1,
          end: 1
        })
      });

    this.anims.create(
      {
        key: 'hitForward',
        repeat: -1,
        frameRate: 5,
        frames: this.anims.generateFrameNames('buster_sp', {
          prefix: 'frontHit',
          suffix: '.png',
          start: 1,
          end: 1
        })
      });

    this.anims.create(
      {
        key: 'walkBackLeft',
        repeat: -1,
        frameRate: 5,
        frames: this.anims.generateFrameNames('buster_sp', {
          prefix: 'backWalkLeft',
          suffix: '.png',
          start: 1,
          end: 5
        })
      });

    this.anims.create(
      {
        key: 'walkBackRight',
        repeat: -1,
        frameRate: 5,
        frames: this.anims.generateFrameNames('buster_sp', {
          prefix: 'backWalkRight',
          suffix: '.png',
          start: 1,
          end: 5
        })
      });

    this.anims.create(
      {
        key: 'walkBack',
        repeat: -1,
        frameRate: 5,
        frames: this.anims.generateFrameNames('buster_sp', {
          prefix: 'backWalk',
          suffix: '.png',
          start: 1,
          end: 4
        })
      });

    this.anims.create(
      {
        key: 'idleBack',
        repeat: -1,
        frameRate: 5,
        frames: this.anims.generateFrameNames('buster_sp', {
          prefix: 'backIdle',
          suffix: '.png',
          start: 1,
          end: 1
        })
      });

    this.anims.create(
      {
        key: 'hitBack',
        repeat: -1,
        frameRate: 5,
        frames: this.anims.generateFrameNames('buster_sp', {
          prefix: 'backHit',
          suffix: '.png',
          start: 1,
          end: 1
        })
      });

    // this.physics.add.overlap(world.bulletFactory.group, world.enemyFactory.group, onCollisionBulletEnemy);
    
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

// function spawnEnemies() {
//     if (world.numEnemies > 0)
//         return;
    
//     const x = Phaser.Math.Between(50, 150);

//     // attempt to display a wave of 3 new enemies
//     world.spawnEnemy(x, -50);
//     world.spawnEnemy(170, -50);
//     world.spawnEnemy(340 - x, -50);

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

function aimFromPlayerToPointer() {
  playerSprite = world.player.sprites[0];
  radian = Phaser.Math.Angle.BetweenPoints(playerSprite, pointer.position);
  degrees = Phaser.Math.RadToDeg(radian);
  return (degrees);
}

function onCollisionPlayerEnemy(buster_sp, enemySprite) {
    buster_sp.entity.destroy();
    enemySprite.entity.destroy();
    audio.explode.play();
}

function onCollisionBulletEnemy(bulletSprite, enemySprite) {
    bulletSprite.destroy();
    enemySprite.destroy();
    audio.explode.play();

    world.numEnemies--;
    setScore(game.score + 20);
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
