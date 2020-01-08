class TypeOne extends Enemy {
  constructor(game, location) {
    super(game, location, 'physTypeOne', 4.0, 10.0, 5, 'physTypeOne', true, 0.1);
    this.decisionDelay = 0.0;
    this.randomColour();
    if (this.slimeColour != Constants.colour.pinkSlime){
      this.enemySprite.tint = this.slimeColour;
    }
    this.slimeStat = 'speed';
    this.hasCollided = false;
  }

  randomColour() {
    let rand = (parseInt(Math.random() * 3));
    switch(rand) {
      case 0:
        this.slimeColour = Constants.colour.greenSlime;
        break;
      case 1:
        this.slimeColour = Constants.colour.blackSlime;
        break;
      default:
        this.slimeColour = Constants.colour.pinkSlime;
        break;
    }

  }
  update() {
    super.update();
  }

  perFrameUpdate() {
    super.perFrameUpdate();
  }
}