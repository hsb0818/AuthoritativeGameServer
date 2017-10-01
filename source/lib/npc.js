'use strict';

const UUID = require('node-uuid');
const ACTION = require('../../public/define').ACTION;

class NPC {
  constructor(_x, _y, _speed, _fireRate, _bulletSpeed) {
    this.id = UUID.v1();
    this.alive = true;
    this.pos = {
      x: _x,
      y: _y
    };

    this.speed = _speed;
    this.fireRate = _fireRate;
    this.bulletSpeed = _bulletSpeed;
  }

  Create() {

  }

  Fire() {

  }
}
