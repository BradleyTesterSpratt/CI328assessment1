let game;
let phaser;
let world;

let input;
let ui;
let audio;

function main(width, height) {
  var config = {
    type: Phaser.AUTO,
    parent: 'my-game',
    width: width,
    height: height,
    physics: {
      default: 'arcade',
      arcade: {
        debug: false
      }
    },
    scene: [
      PreloaderScene,
      TitleScene,
      MainScene,
      VictoryScene
    ]
  };

  phaser = new Phaser.Game(config);
}
