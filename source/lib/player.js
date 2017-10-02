'use strict';

const UUID = require('node-uuid');
const ACTION = require('../../public/define').ACTION;

class Player {
  constructor(_x, _y, _angle) {
    this.id = UUID.v1();
    this.alive = true;
    this.pos = {
      x: _x,
      y: _y
    };

    this.angle = _angle;
    this.speed = 150;
    this.fireRate = 500;
    this.angle = 0;
    this.bulletSpeed = 600;
    this.hp = 10;
    this.power = 5;
  }

  Action(type, angle, deltatime) {
    switch (type) {
      case ACTION.LEFT: {
        this.pos.x -= this.speed * deltatime;
        break;
      }
      case ACTION.RIGHT: {
        this.pos.x += this.speed * deltatime;
        break;
      }
      case ACTION.UP: {
        this.pos.y -= this.speed * deltatime;
        break;
      }
      case ACTION.DOWN: {
        this.pos.y += this.speed * deltatime;
        break;
      }
    }

    this.angle = angle;
  }
}

module.exports = Player;
