class Player {
  constructor(_sprite, _id, _speed, _fireRate, _bulletSpeed, _hp, _power, group) {
    this.sprite = _sprite;
    this.id = _id;
    this.alive = true;
    this.speed = _speed;
    this.fireRate = _fireRate;
    this.bulletSpeed = _bulletSpeed;
    this.bulletTime = 0;
    this.bulletGroup = group;
    this.hp = _hp;
    this.power = _power;
  }

  LoadBullet(spriteName, _physicsBodyType) {
    this.bulletGroup.enableBody = true;
    this.bulletGroup.physicsBodyType = _physicsBodyType;
    this.bulletGroup.createMultiple(20, spriteName);
    this.bulletGroup.setAll('anchor.x', 0.5);
    this.bulletGroup.setAll('anchor.y', 1.0);
    this.bulletGroup.setAll('outOfBoundsKill', true);
    this.bulletGroup.setAll('checkWorldBounds', true);

    for (let i=0; i<this.bulletGroup.children.length; i++) {
      this.bulletGroup.children[i].name = i.toString();
    }
  }

  Fire(currentTime) {
    if (currentTime > this.bulletTime) {
      const bullet = this.bulletGroup.getFirstExists(false);
      if (bullet === null)
        return false;

      bullet.angle = this.sprite.angle + 90;
      const rad = MyMath.PI2Rad(bullet.angle - 90);
      const speed = this.bulletSpeed;
      const vec = {
        x: Math.cos(rad) * speed,
        y: Math.sin(rad) * speed
      };

      bullet.reset(this.sprite.x, this.sprite.y);
      bullet.body.velocity.x = vec.x;
      bullet.body.velocity.y = vec.y;

      this.bulletTime = currentTime + this.fireRate;
      return true;
    }
  }
}
