class Player {
  constructor(id) {
    this.id = id;
    this.alive = true;
    this.speed = 150;
    this.firerate = 500;
    this.angle = 0;
    this.bulletspeed = 800;
  }

  InitWeapon(sprite, weapon, type, bulletspeed, firerate) {
    this.bulletspeed = bulletspeed;
    this.firerate = firerate;

    weapon.bulletKillType = type;
    weapon.bulletAngleOffset = 90;
    weapon.bulletSpeed = this.bulletspeed;
    weapon.fireRate = this.firerate;
    weapon.trackSprite(sprite, 50, 0, true);
    sprite.weapon = weapon;
  }
}
