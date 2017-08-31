'use strict';

const Room = require('./room');
const FULL_USER = 2;

class RoomMng {
  constructor() {
    let m_user_count = 0;
    let m_rooms = {};

    this.GetUserCount = () => { return m_user_count; };
    this.Enter = _Enter;
    this.Leave = _Leave;
    this.GetUserCount = _GetUserCount;
    this.FindUserByID = _FindUserByID;
    this.FindUserByName = _FindUserByName;
    this.FindRoom = _FindRoom;

    function _Enter (name, socket) {
      m_user_count++;

      if (Join(name, socket))
        return;

      const room = new Room(FULL_USER);
      const key = room.Join(name, socket);
      m_rooms[key] = room;

      console.log('new room : ' + key);
    }

    function Join(name, socket) {
      for (const key in m_rooms) {
        if (m_rooms[key].IsFulled())
          continue;

        m_rooms[key].Join(name, socket);
        return true;
      }

      return false;
    }

    function _Leave(user) {
      if (m_rooms.hasOwnProperty(user.m_room) === false)
        return false;

      m_user_count--;
      return m_rooms[user.m_room].Leave(user.m_socket);
    }

    function _GetUserCount(key) {
      if (m_rooms.hasOwnProperty(key) === false)
        return -1;

      return m_rooms[key].GetUserCount();
    }

    function _FindUserByID(id) {
      for (const key in m_rooms) {
        const user = m_rooms[key].FindUserByID(id);
        if (user === null)
          continue;

        return user;
      }

      return null;
    }

    function _FindUserByName(name) {
      for (const key in m_rooms) {
        const user = m_rooms[key].FindUserByName(name);
        if (user === null)
          continue;

        return user;
      }

      return null;
    }

    function _FindRoom(key) {
      if (m_rooms.hasOwnProperty(key) === false)
        return null;

      return m_rooms[key];
    }
  }
}

module.exports = new RoomMng();
