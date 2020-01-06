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
    scene: MainScene
  };

  phaser = new Phaser.Game(config);
}