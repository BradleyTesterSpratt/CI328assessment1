/**
 * class provided as part of the assignment example
 */
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

    if (this.game.time.now > this.nextBulletTime) {
      const sprite = this.group.create(x-1, y-2)
      this.setUpEntity(sprite);
      
      sprite.setOrigin(0.5, 0.5);
      sprite.setScale(0.05, 0.05);
      this.game.physics.moveToObject(sprite, new Phaser.Math.Vector2(destX, destY), 1500);
      this.nextBulletTime = this.game.time.now + 250;
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
      //error needs to be caught to prevent crashing, safe to ignore
    }
  }
}