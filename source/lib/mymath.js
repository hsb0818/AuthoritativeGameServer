function RandomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

module.exports = {
  RandomInt : RandomInt
};
