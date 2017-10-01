class SnapShot {
  constructor(_socket, _room, _player, _seqnum, _type,
    _angle, _serverTime, _deltaTime) {
    this.socket = _socket;
    this.room = _room;
    this.player = _player;
    this.seqnum = _seqnum;
    this.type = _type;
    this.angle = _angle;
    this.serverTime = _serverTime;
    this.deltaTime = _deltaTime;
  }
}

module.exports = SnapShot;
