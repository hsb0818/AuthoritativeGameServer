'use strict';

class User {
  constructor(name, room, socket) {
    this.m_name = name;
    this.m_room = room;
    this.m_socket = socket;
    this.m_player = {
      id: -1,
      x: 0,
      y: 0
    };
  }
}

module.exports = User;
