class Player {
  constructor(id) {
    this.id = id;
    this.alive = true;
    this.speed = 150;
    this.fireRate = 500;
    this.angle = 0;
    this.bulletSpeed = 800;
  }

  InitWeapon(sprite, weapon, type, bulletSpeed, fireRate) {
    this.bulletSpeed = bulletSpeed;
    this.fireRate = fireRate;

    weapon.bulletKillType = type;
    weapon.bulletAngleOffset = 90;
    weapon.bulletSpeed = this.bulletSpeed;
    weapon.fireRate = this.fireRate;
    weapon.trackSprite(sprite, 50, 0, true);
    sprite.weapon = weapon;
  }
}
