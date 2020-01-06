class Audio {
  constructor(game) {
    this.intro = game.sound.add('intro');
    //this.intro.play();
    this.bg = game.sound.add('bg', true);
    //this.bg.play();
    this.explode = game.sound.add('explode');
    this.fly = game.sound.add('fly');
    this.shoot = game.sound.add('shoot');
  }
}

class Input {
  constructor(game) {
    this.game = game;

    this.keyMap = new Map();
  }

  add(key, action) {
    this.keyMap.set(this.game.input.keyboard.addKey(key), action);
  }

  leftClick(action) {
    this.keyMap.set(this.game.input.activePointer, action);
  }
  
  update() {
    for (const [key, action] of this.keyMap.entries()) {
      if (key.isDown) {
        action();
      }
    }
  }
}

class UI {
  constructor(game) {
    // this.cameras.main.follow(this.player);

    this.startGameText = game.add.text(phaser.config.width / 2, phaser.config.height / 2, 'Click to Start', {
      font: '30px Arial',
      fill: '#fff'
    });
    this.startGameText.setOrigin(0.5, 0.5);
    this.startGameText.setDepth(100);

    this.scoreText = game.add.text(10, 10, 'Score: 0', {
      font: '34px Arial',
      fill: '#fff'
    });
    this.scoreText.setDepth(100);
  }

  updateScoreText(newScore) {
    this.scoreText.setText('Score: ' + newScore);
  }

  showStartText() {
    this.startGameText.visible = true;
  }

  disableStartText() {
    this.startGameText.visible = false;
  }
}

class Constants {
  static colour = {
    streamWhite: 0xffffff,
    streamBlue: 0x00ffff,
    streamRed: 0xff0000,
    streamYellow: 0xffff00,
    pinkSlime: 0x936999,
    greenSlime: 0x00FF00,
    blackSlime: 0x444444
  }
}