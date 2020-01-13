//width and height is provided by the user viewport
function main(width, height, isMobileDevice) {
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
  phaser.isMobileDevice = isMobileDevice;
}
