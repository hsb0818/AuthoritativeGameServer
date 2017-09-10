const RES_BULLET = {
  WIDTH: 9,
  HEIGHT: 37,
  RADIUS: () => {
    return this.HEIGHT / 2;
  },
};

const RES_HEROSHIP = {
  WIDTH: 75,
  HEIGHT: 99,
  RADIUS: () => {
    return this.HEIGHT / 2;
  },
};

module.exports = {
  RES_BULLET:RES_BULLET,
  RES_HEROSHIP:RES_HEROSHIP,
};
