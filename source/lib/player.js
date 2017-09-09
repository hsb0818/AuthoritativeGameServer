'use strict';

const UUID = require('node-uuid');
const ACTION = require('../../public/define').ACTION;

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
  }
}

module.exports = Player;
