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

const SCENARIO = {
  NEW_NPC1: 0,
};

module.exports = {
  RES_BULLET: RES_BULLET,
  RES_HEROSHIP: RES_HEROSHIP,
  SCENARIO: SCENARIO,
};
