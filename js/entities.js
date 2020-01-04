class Control {
  onUpdate(sprite) {}
}

class EntityFactory {
  constructor(game, spriteName) {
    this.game = game;
    const group = game.physics.add.group({
      defaultKey: spriteName
    });
    this.group = group;
  }

  spawnAsBullet(x, y, destX, destY) {
    if (!this.nextBulletTime) {
      this.nextBulletTime = 0;
    }

    //  To avoid them being allowed to fire too fast we set a time limit
    if (this.game.time.now > this.nextBulletTime) {
      const sprite = this.group.create(x-1, y-2)
      this.setUpEntity(sprite);
      
      sprite.setOrigin(0.5, 0.5);
      sprite.setScale(0.05, 0.05);
      this.game.physics.moveToObject(sprite, new Phaser.Math.Vector2(destX, destY), 750);
      this.nextBulletTime = this.game.time.now + 75;
    }
  }

  setUpEntity(sprite) {
    sprite.controls = [];
    sprite.addControl = (control) => { sprite.controls.push(control); }
    sprite.updateControls = () => { sprite.controls.forEach(control => control.onUpdate(sprite)); }
  }

  updateAllExists() {
    this.group.children.iterate(function (sprite) {
      if (sprite) {
        sprite.updateControls(20);
      }
    })
  }

  destroyAllExists() {
    try {
      this.group.children.iterate(function (sprite) {
        sprite.destroy();
      });
    }
    catch(err) {
      console.log(err);
    }
  }

  // spawnAsEnemy(x, y) {
    // const sprite = this.group.create(x, y + 30);
    // this.setUpEntity(sprite);
    // sprite.setVelocity(Phaser.Math.Between(35, 55), Phaser.Math.Between(45, 100));
    // sprite.setOrigin(1.0, 1.0);
    // sprite.addControl(new EnemyControl());
  // }
}