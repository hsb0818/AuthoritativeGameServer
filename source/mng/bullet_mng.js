'use strict';

const Queue = require('../../public/queue');

class BulletMng {
  constructor() {
    this.list = new Queue();
  }
}

BulletMng.instance = null;
BulletMng.GetInstance = () => {
  if (BulletMng.instance === null) {
    BulletMng.instance = new BulletMng();
  }

  return BulletMng.instance;
};

module.exports = BulletMng.GetInstance();
