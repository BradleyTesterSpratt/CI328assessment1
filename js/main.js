let game;
let phaser;
let world;

let input;
let ui;
let audio;

function main(width, height) {
  console.log("main()");
  var config = {
    type: Phaser.AUTO,
    parent: 'my-game',
    width: width,
    height: height,
    physics: {
      default: 'arcade',
      arcade: {
        debug: true
      }
    },
    scene: [
      PreloaderScene,
      TitleScene,
      MainScene
    ]
  };

  phaser = new Phaser.Game(config);
}