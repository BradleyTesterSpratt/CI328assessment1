class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create() {
    console.log('title screen');
    this.levelSize = 'Medium'
    this.add.tileSprite(phaser.config.width/2, phaser.config.height/2 ,phaser.config.width, phaser.config.height, "menuBrickTiles");
    this.containmentUnit = this.add.sprite(100, phaser.config.height/2, 'containmentUnit');
    this.containmentUnit.y = this.containmentUnit.y - this.containmentUnit.height/2;
    //origin to 0 so that the button positions can be found in the photo editor and then used as offset
    this.containmentUnit.setOrigin(0.0, 0.0);
    this.sizeDisplay = this.addText(279, 238, this.levelSize, 22, 'black');
    this.buttonPurposeDisplay = this.addText(100 + this.containmentUnit.width, this.containmentUnit.height/2, '', 40);
    this.buttonPurposeDisplay.visible = false;
    this.setUpButtons();
    this.difficultyDisplay = this.addText(303, 90, 'Normal', 40, 'darkorange');
    this.changeDifficulty('normal');

  }

  addText(x, y, text, size, fill = '#fff') {
    let newText = this.add.text(this.containmentUnit.x + x, this.containmentUnit.y + y, text, {
      font: `${size}px Arial`,
      fill: fill,
    });
    newText.setOrigin(0.5, 0.5);
    return newText;
  }

  updateButtonPurposeText(text) {
    this.buttonPurposeDisplay.setText(text);
    this.buttonPurposeDisplay.setRotation(Math.random() * 1);
    this.buttonPurposeDisplay.visible = true;
  }

  updateDifficultyText() {
    this.difficultyDisplay.setText(this.difficulty);
    switch(this.difficulty) {
      case 'Easy':
        this.difficultyDisplay.setShadow(5, 5, 'red', 15).setFill('red');
        break;
      case 'Hard':
        this.difficultyDisplay.setShadow(5, 5, 'lime', 15).setFill('lime');
        break;
      default:
        this.difficultyDisplay.setShadow(5, 5, 'darkorange', 15).setFill('darkorange');
    }
  }

  setUpButtons() {
    let levelSizeButton = this.addButton(211, 235, 'levelSizeButton', 'unselected.png', 'mouseOver.png', 'pressed.png', "Change\nLevel Size");
      levelSizeButton.on('pointerdown', () => { 
        levelSizeButton.setFrame('pressed.png');
        this.changeLevelSize();
      });

    let easyButton = this.addButton(229, 35, 'redLight', 'unselected.png', 'mouseOver.png', 'selected.png', "Set Game\nTo Easy", true);
    easyButton.on('pointerdown', () => { 
      this.changeDifficulty('easy');
    });
    this.easyButton = easyButton;

    let normalButton = this.addButton(303, 35, 'amberLight', 'unselected.png', 'mouseOver.png', 'selected.png', 'Set Game\nTo Medium', true);
    normalButton.on('pointerdown', () => { 
      this.changeDifficulty('normal');
    });
    this.normalButton = normalButton;

    let hardButton = this.addButton(379, 35, 'greenLight', 'unselected.png', 'mouseOver.png', 'selected.png', 'Set Game\nTo Hard', true);
    hardButton.on('pointerdown', () => { 
      this.changeDifficulty('hard');
    });
    this.hardButton = hardButton;

    let startHandle = this.addButton(355, 320, 'startHandle', 'unselected.png', 'mouseOver.png', 'unselected.png', 'Start\nGame');
    startHandle.on('pointerdown', () => { 
      this.startGame();
    });
    this.startHandle = startHandle;
  }

  addButton(x, y, sprite, idleFrame, mouseOverFrame, selectedFrame, buttonPurpose, stayDown = false) {
    let button = this.add.sprite(x + this.containmentUnit.x, y + this.containmentUnit.y, sprite, idleFrame);
    button.setOrigin(0.5, 0.5);
    button.setInteractive();
    if (stayDown) {
      button.on('pointerover', () => {
        if(button.frame.name != selectedFrame) {
          button.setFrame(mouseOverFrame);
          this.updateButtonPurposeText(buttonPurpose);
        };
      });
      button.on('pointerout', () => { 
        if(button.frame.name != selectedFrame) {
          button.setFrame(idleFrame); };
          this.buttonPurposeDisplay.visible = false;
      });
    } else {
      button.on('pointerover', () => {
        button.setFrame(mouseOverFrame);
        this.updateButtonPurposeText(buttonPurpose);
      });
      button.on('pointerout', () => {
        button.setFrame(idleFrame);
        this.buttonPurposeDisplay.visible = false;
      });
    }
    return button;
  }

  startGame() {
    phaser.scene.start('mainScene', {
      difficulty: this.difficulty.toLowerCase(),
      levelSize: this.levelSize.toLowerCase()
    });
    phaser.scene.stop('title');
  }

  changeDifficulty(difficulty) {
    switch(difficulty) {
      case 'easy': 
        this.difficulty = 'Easy';
        this.easyButton.setFrame('selected.png');
        this.normalButton.setFrame('unselected.png');
        this.hardButton.setFrame('unselected.png');
        break;
      case 'hard': 
        this.difficulty = 'Hard';
        this.easyButton.setFrame('unselected.png');
        this.normalButton.setFrame('unselected.png');
        this.hardButton.setFrame('selected.png');
        break;
      default:
        this.difficulty = 'Normal';
        this.easyButton.setFrame('unselected.png');
        this.normalButton.setFrame('selected.png');
        this.hardButton.setFrame('unselected.png');
    }
    this.updateDifficultyText();
  }

  changeLevelSize() {
    let validSizes = Constants.levelSizes
    let index = validSizes.indexOf(this.levelSize) + 1;
    this.levelSize = index == validSizes.length ? validSizes[0] : validSizes[index];
    this.sizeDisplay.setText(this.levelSize);
  }
  
}