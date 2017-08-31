'use strict';

const UUID = require('node-uuid');
const MOVEMENT = require('../../public/define').MOVEMENT;

class Player {
  constructor(_x, _y) {
    this.id = UUID.v1();
    this.alive = true;
    this.pos = {
      x: _x,
      y: _y
    };

    this.speed = 150;
  }

  Move(type, deltatime) {
    switch (type) {
      case MOVEMENT.LEFT: {
        this.pos.x -= this.speed * deltatime;
        break;
      }
      case MOVEMENT.RIGHT: {
        this.pos.x += this.speed * deltatime;
        break;
      }
      case MOVEMENT.UP: {
        this.pos.y -= this.speed * deltatime;
        break;
      }
      case MOVEMENT.DOWN: {
        this.pos.y += this.speed * deltatime;
        break;
      }
    }
  }
}

module.exports = Player;
