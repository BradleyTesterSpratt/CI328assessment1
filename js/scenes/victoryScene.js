class VictoryScene extends Phaser.Scene {
  constructor() {
    super('victory');
  }

  //values passed in when the scene is called
  init(results) {
    this.difficulty = results.difficulty;
    this.levelSize = results.levelSize;
    this.time = results.time;
    this.victory = results.victory;
  }

  create() {
    this.gameInput = new Input(this);
    this.gameInput.add('SPACE', function() { 
      phaser.scene.start('title');
      phaser.scene.stop('victory');
    });
    if(this.victory) {
      this.getDifficultyScore();
      this.baseScoreText = this.addText(100, phaser.config.height/2 - 50, `Base Score: ${this.baseScore}`, 30, 'white');
      this.levelMultiplyerText = this.addText(100, phaser.config.height/2 - 25, `Level Size Multiplyer: ${this.getLevelSizeMultiplyer()}`, 30, 'white');
      this.totalScoreText = this.addText(100, phaser.config.height/2 + 25, `Total Score: ${this.calculateTotalScore()}`, 40, 'lightblue');
      this.titleMenuText = this.addText(100, phaser.config.height/2 + 60, 'Press SPACE to return to the Title Screen', 30, 'white');  
    } else {
      this.gameOverText = this.addText(100, phaser.config.height/2 + 25, 'Game Over!', 40, 'darkred');
      this.titleMenuText = this.addText(100, phaser.config.height/2 + 60, 'Press SPACE to return to the Title Screen', 30, 'white');  
    }
  }

  //need to call update otherwise the space bar input will never be recognised
  update() {
    this.gameInput.update();
  }

  addText(x, y, text, size, fill = '#fff') {
    let newText = this.add.text(x, y, text, {
      font: `${size}px Arial`,
      fill: fill,
    });
    newText.setOrigin(0, 0.5);
    return newText;
  }

  calculateTotalScore() {
    return this.baseScore * this.getLevelSizeMultiplyer();
  }

  getDifficultyScore() {
    switch(this.difficulty) {
      case 'easy': 
        this.baseScore = 10000 / this.getTimePenalty();
        break;
      case 'hard':
        this.baseScore = 30000 / this.getTimePenalty();
        break;
      default:
        //normal (matching the default case in world.js)
        this.baseScore = 20000 / this.getTimePenalty();
    }
  }

  getTimePenalty() {
    return Math.ceil(this.time/1000)
  }

  getLevelSizeMultiplyer() {
    let multiplyer;
    switch(this.levelSize) {
      case 'tiny': 
        multiplyer = 0.5;
        break;
      case 'small':
        multiplyer = 1;
        break;
      case 'large':
        multiplyer = 3;
        break;
      default:
        //normal (matching the default case in world.js)
        multiplyer = 2;
    }
    return multiplyer;
  }
}