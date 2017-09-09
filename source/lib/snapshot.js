class SnapShot {
  constructor(_socket, _room, _player, _type, _time) {
    this.socket = _socket;
    this.room = _room;
    this.player = _player;
    this.type = _type;
    this.time = _time;
  }
}

module.exports = SnapShot;
